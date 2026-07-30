import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify, { type FastifyRequest } from "fastify";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { createAuthAdapter, isMilEmail, type AuthContext } from "./auth/index.js";
import type { ApiConfig } from "./config.js";
import { readConfig } from "./config.js";
import { createDatabase, type Database } from "./db.js";
import { getFeatureRegistry, isFeatureEnabled } from "./features.js";
import {
  CommunityContentRepository,
  CreateCommentSchema,
  CreateSubmissionSchema,
  FeedSortSchema,
  ModerateSubmissionSchema,
  SubmissionKindSchema,
  SubmissionStatusSchema,
  UpdateSubmissionSchema,
  VoteSchema,
} from "./repositories/communityContent.js";
import {
  AnalyticsEventSchema,
  FeatureOverrideSchema,
  GovernanceRepository,
  LearningProgressSchema,
  MembershipSchema,
  ProfileSchema,
  ReportSchema,
  ResolveReportSchema,
  SuspendUserSchema,
} from "./repositories/governance.js";
import { ToolSubmissionRepository, ToolSubmissionSchema } from "./repositories/toolSubmissions.js";
import {
  LearningAssetSchema,
  MediaMessagingRepository,
  SendMessageSchema,
  UpdateLearningAssetSchema,
} from "./repositories/mediaMessaging.js";
import {
  AccessReportSchema,
  BroadcastNotificationSchema,
  LifecycleSchema,
  OperationsRepository,
  ResolveAccessReportSchema,
} from "./repositories/operations.js";

const moderationRoles = new Set(["moderator", "admin"]);
const contributorRoles = new Set(["contributor", "moderator", "admin"]);

export async function createApiApp(config: ApiConfig = readConfig()): Promise<{ app: ReturnType<typeof Fastify>; database: Database }> {
  const auth = createAuthAdapter(config);
  const database = createDatabase(config);
  const toolSubmissions = new ToolSubmissionRepository(database.pool);
  const communityContent = new CommunityContentRepository(database.pool);
  const governance = new GovernanceRepository(database.pool);
  const mediaMessaging = new MediaMessagingRepository(database.pool);
  const operations = new OperationsRepository(database.pool);
  const mutationWindows = new Map<string, { count: number; resetAt: number }>();
  const startedAt = new Date();

  const app = Fastify({ logger: true });
  const mediaRoot = resolve(config.mediaStorageDir);
  await mkdir(mediaRoot, { recursive: true });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-user-email", "x-user-roles"],
  });
  await app.register(multipart, {
    limits: { fileSize: 250 * 1024 * 1024, files: 1 },
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: "invalid_request", details: error.issues });
    }
    app.log.error(error);
    return reply.status(500).send({ error: "internal_error" });
  });

  const sessionFor = (request: FastifyRequest) => auth.authenticate(request);
  const isModerator = (session: AuthContext) => session.roles.some((role) => moderationRoles.has(role));
  const isAdmin = (session: AuthContext) => session.roles.includes("admin");

  const requireIdentity = async (request: FastifyRequest, reply: { status: (code: number) => { send: (body: unknown) => unknown } }) => {
    const session = await sessionFor(request);
    if (!session.authenticated || !session.email || (config.requireMilEmail && !isMilEmail(session.email))) {
      reply.status(401).send({ error: "mil_identity_required", message: "A verified .mil identity is required." });
      return undefined;
    }
    if (await governance.isSuspended(session.email)) {
      reply.status(403).send({ error: "account_suspended" });
      return undefined;
    }
    return session;
  };

  const rateLimited = (email: string, action: string, limit = 30): boolean => {
    const key = `${email}:${action}`;
    const now = Date.now();
    const current = mutationWindows.get(key);
    if (!current || current.resetAt <= now) {
      mutationWindows.set(key, { count: 1, resetAt: now + 60_000 });
      return false;
    }
    current.count += 1;
    return current.count > limit;
  };

  const featureEnabled = async (featureId: string): Promise<boolean> => {
    const overrides = await governance.getFeatureOverrides();
    return overrides[featureId] ?? isFeatureEnabled(featureId as Parameters<typeof isFeatureEnabled>[0]);
  };

  app.get("/health", async () => ({
    ok: true,
    service: "airman-playbook-api",
    authProvider: config.authProvider,
    database: database.pool ? "postgres" : "memory",
    uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
  }));

  app.get("/ready", async (_request, reply) => {
    if (database.pool) {
      try {
        await database.pool.query("SELECT 1");
      } catch {
        return reply.status(503).send({ ok: false, database: "unavailable" });
      }
    }
    return { ok: true, database: database.pool ? "postgres" : "memory" };
  });

  app.get("/media/:filename", async (request, reply) => {
    const { filename } = request.params as { filename: string };
    if (!/^[a-f0-9-]+\.(mp4|webm|vtt)$/i.test(filename)) return reply.status(404).send({ error: "media_not_found" });
    const filePath = join(mediaRoot, filename);
    try {
      await stat(filePath);
    } catch {
      return reply.status(404).send({ error: "media_not_found" });
    }
    const extension = extname(filename).toLowerCase();
    reply.type(extension === ".mp4" ? "video/mp4" : extension === ".webm" ? "video/webm" : "text/vtt");
    reply.header("Cache-Control", "public, max-age=3600");
    return reply.send(createReadStream(filePath));
  });

  app.get("/v1/features", async () => {
    const overrides = await governance.getFeatureOverrides();
    return {
      features: Object.values(getFeatureRegistry()).map((feature) => ({
        ...feature,
        enabled: overrides[feature.id] ?? feature.enabled,
      })),
    };
  });

  app.get("/v1/auth/session", async (request) => ({
    session: await sessionFor(request),
    requireMilEmail: config.requireMilEmail,
  }));

  app.get("/v1/feed/:kind", async (request) => {
    const params = request.params as { kind: string };
    const query = request.query as { sort?: string; communityId?: string };
    return {
      submissions: await communityContent.listFeed(
        SubmissionKindSchema.parse(params.kind),
        FeedSortSchema.parse(query.sort ?? "trending"),
        query.communityId,
      ),
    };
  });

  app.get("/v1/search", async (request) => {
    const query = request.query as { q?: string };
    return { submissions: await communityContent.searchApproved((query.q ?? "").slice(0, 200)) };
  });

  app.post("/v1/submissions", async (request, reply) => {
    if (!(await featureEnabled("communitySubmissions"))) return reply.status(403).send({ error: "feature_disabled" });
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    if (!session.roles.some((role) => contributorRoles.has(role))) {
      return reply.status(403).send({ error: "contributor_role_required" });
    }
    if (rateLimited(session.email, "submission", 10)) return reply.status(429).send({ error: "rate_limit_exceeded" });
    const input = CreateSubmissionSchema.parse(request.body);
    const duplicate = await communityContent.findDuplicate(input.kind, input.title);
    if (duplicate) return reply.status(409).send({ error: "duplicate_submission", submissionId: duplicate.id });
    await governance.upsertProfile(session.email, {
      username: input.authorUsername,
      afsc: input.authorAfsc,
      rank: input.authorRank,
    });
    const submission = await communityContent.create(input, session.email);
    await governance.audit(session.email, "submission.created", "submission", submission.id, { kind: submission.kind });
    await governance.track(session.email, { eventName: "submission_created", targetType: "submission", targetId: submission.id, metadata: {} });
    return reply.status(201).send({ submission });
  });

  app.get("/v1/submissions/mine", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    return { submissions: await communityContent.listByAuthor(session.email) };
  });

  app.get("/v1/submissions/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const submission = await communityContent.getById(id);
    if (!submission) return reply.status(404).send({ error: "submission_not_found" });
    const session = await sessionFor(request);
    if (submission.status !== "approved" && submission.authorEmail !== session.email && !isModerator(session)) {
      return reply.status(404).send({ error: "submission_not_found" });
    }
    return { submission };
  });

  app.patch("/v1/submissions/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { id } = request.params as { id: string };
    const input = UpdateSubmissionSchema.parse(request.body);
    const current = await communityContent.getById(id);
    if (!current || current.authorEmail !== session.email) return reply.status(404).send({ error: "editable_submission_not_found" });
    const duplicate = await communityContent.findDuplicate(input.kind ?? current.kind, input.title ?? current.title, id);
    if (duplicate) return reply.status(409).send({ error: "duplicate_submission", submissionId: duplicate.id });
    const submission = await communityContent.update(id, session.email, input);
    if (!submission) return reply.status(409).send({ error: "submission_not_editable" });
    await governance.audit(session.email, "submission.updated", "submission", id, { version: submission.version });
    return { submission };
  });

  app.get("/v1/submissions/:id/revisions", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { id } = request.params as { id: string };
    const submission = await communityContent.getById(id);
    if (!submission || (submission.authorEmail !== session.email && !isModerator(session))) {
      return reply.status(404).send({ error: "submission_not_found" });
    }
    return { revisions: await communityContent.listRevisions(id) };
  });

  app.post("/v1/submissions/:id/vote", async (request, reply) => {
    if (!(await featureEnabled("voting"))) return reply.status(403).send({ error: "feature_disabled" });
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    if (rateLimited(session.email, "vote", 90)) return reply.status(429).send({ error: "rate_limit_exceeded" });
    const { id } = request.params as { id: string };
    const { value } = VoteSchema.parse(request.body);
    const score = await communityContent.vote(id, session.email, value);
    if (score === undefined) return reply.status(404).send({ error: "approved_submission_not_found" });
    await governance.track(session.email, { eventName: "vote_cast", targetType: "submission", targetId: id, metadata: { value } });
    return { score };
  });

  app.get("/v1/submissions/:id/comments", async (request) => {
    const { id } = request.params as { id: string };
    return { comments: await communityContent.listComments(id) };
  });

  app.post("/v1/submissions/:id/comments", async (request, reply) => {
    if (!(await featureEnabled("comments"))) return reply.status(403).send({ error: "feature_disabled" });
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    if (rateLimited(session.email, "comment", 30)) return reply.status(429).send({ error: "rate_limit_exceeded" });
    const { id } = request.params as { id: string };
    if (await operations.isThreadLocked(id)) return reply.status(423).send({ error: "thread_locked" });
    const input = CreateCommentSchema.parse(request.body);
    const submission = await communityContent.getById(id);
    await governance.upsertProfile(session.email, {
      username: input.authorUsername,
      afsc: input.authorAfsc,
      rank: input.authorRank,
    });
    const comment = await communityContent.addComment(id, session.email, input);
    if (!comment) return reply.status(404).send({ error: "approved_submission_not_found" });
    if (submission && submission.authorEmail !== session.email) {
      await operations.notify(
        submission.authorEmail,
        "comment",
        `New comment on ${submission.title}`,
        `${input.authorUsername} commented on your submission.`,
        `/post?id=${id}`,
      );
    }
    await governance.track(session.email, { eventName: "comment_created", targetType: "submission", targetId: id, metadata: {} });
    return reply.status(201).send({ comment });
  });

  app.post("/v1/submissions/:id/report", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { id } = request.params as { id: string };
    const submission = await communityContent.getById(id);
    if (!submission || submission.status !== "approved") return reply.status(404).send({ error: "submission_not_found" });
    const report = await governance.report(id, session.email, ReportSchema.parse(request.body));
    await governance.audit(session.email, "report.created", "submission", id, { reportId: report.id });
    return reply.status(201).send({ report });
  });

  app.post("/v1/access-reports", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    if (rateLimited(session.email, "access-report", 10)) return reply.status(429).send({ error: "rate_limit_exceeded" });
    const report = await operations.createAccessReport(AccessReportSchema.parse(request.body), session.email);
    await governance.audit(session.email, "access_report.created", report.targetType, report.targetId, { reportId: report.id });
    return reply.status(201).send({ report });
  });

  app.get("/v1/communities/:id/membership", async (request) => {
    const session = await sessionFor(request);
    const { id } = request.params as { id: string };
    return { membership: await governance.membershipSummary(id, session.email) };
  });

  app.post("/v1/communities/:id/membership", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { id } = request.params as { id: string };
    const community = await communityContent.getById(id);
    if (!community || community.kind !== "community" || community.status !== "approved") {
      return reply.status(404).send({ error: "community_not_found" });
    }
    const requested = MembershipSchema.parse(request.body);
    const role = isModerator(session) ? requested.role : "member";
    await governance.setMembership(id, session.email, role);
    await governance.audit(session.email, "community.joined", "community", id, { role });
    return { membership: await governance.membershipSummary(id, session.email) };
  });

  app.delete("/v1/communities/:id/membership", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { id } = request.params as { id: string };
    await governance.removeMembership(id, session.email);
    await governance.audit(session.email, "community.left", "community", id);
    return reply.status(204).send();
  });

  app.get("/v1/profile", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const profile = (await governance.listUsers()).find((item) => item.email === session.email);
    return { profile };
  });

  app.patch("/v1/profile", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const profile = await governance.upsertProfile(session.email, ProfileSchema.parse(request.body));
    return { profile };
  });

  app.get("/v1/notifications", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    return { notifications: await operations.listNotifications(session.email) };
  });

  app.patch("/v1/notifications/:id/read", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { id } = request.params as { id: string };
    if (!(await operations.markNotificationRead(id, session.email))) {
      return reply.status(404).send({ error: "notification_not_found" });
    }
    return reply.status(204).send();
  });

  app.get("/v1/learning/progress", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    return { progress: await governance.getLearningProgress(session.email) };
  });

  app.get("/v1/learning/assets", async (_request, reply) => {
    if (!(await featureEnabled("firstPartyVideos"))) return reply.status(403).send({ error: "feature_disabled" });
    return { assets: await mediaMessaging.listAssets(false) };
  });

  app.patch("/v1/learning/progress/:assetId", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { assetId } = request.params as { assetId: string };
    const input = LearningProgressSchema.parse(request.body);
    await governance.setLearningProgress(session.email, assetId, input);
    await governance.track(session.email, { eventName: "learning_progress", targetType: "learning_asset", targetId: assetId, metadata: input });
    return { progress: { assetId, ...input } };
  });

  app.get("/v1/messages/conversations", async (request, reply) => {
    if (!(await featureEnabled("messaging"))) return reply.status(403).send({ error: "feature_disabled" });
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    return { conversations: await mediaMessaging.listConversations(session.email) };
  });

  app.get("/v1/messages/:participantEmail", async (request, reply) => {
    if (!(await featureEnabled("messaging"))) return reply.status(403).send({ error: "feature_disabled" });
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    const { participantEmail } = request.params as { participantEmail: string };
    const participant = decodeURIComponent(participantEmail).toLowerCase();
    if (!isMilEmail(participant)) return reply.status(400).send({ error: "mil_recipient_required" });
    return { messages: await mediaMessaging.listMessages(session.email, participant) };
  });

  app.post("/v1/messages", async (request, reply) => {
    if (!(await featureEnabled("messaging"))) return reply.status(403).send({ error: "feature_disabled" });
    const session = await requireIdentity(request, reply);
    if (!session?.email) return;
    if (rateLimited(session.email, "message", 30)) return reply.status(429).send({ error: "rate_limit_exceeded" });
    const input = SendMessageSchema.parse(request.body);
    if (!isMilEmail(input.recipientEmail)) return reply.status(400).send({ error: "mil_recipient_required" });
    if (input.recipientEmail === session.email) return reply.status(400).send({ error: "self_message_not_allowed" });
    const recipient = (await governance.listUsers()).find((user) => user.email === input.recipientEmail && !user.suspended);
    if (!recipient) return reply.status(404).send({ error: "recipient_not_found" });
    const message = await mediaMessaging.sendMessage(session.email, input);
    await operations.notify(
      input.recipientEmail,
      "message",
      "New Playbook message",
      `You received a message from ${session.email}.`,
      `/messages?with=${encodeURIComponent(session.email)}`,
    );
    await governance.audit(session.email, "message.sent", "message", message.id, { recipientEmail: input.recipientEmail });
    await governance.track(session.email, { eventName: "message_sent", targetType: "message", targetId: message.id, metadata: {} });
    return reply.status(201).send({ message });
  });

  app.post("/v1/analytics/events", async (request, reply) => {
    if (!(await featureEnabled("analytics"))) return reply.status(204).send();
    const session = await sessionFor(request);
    await governance.track(session.email, AnalyticsEventSchema.parse(request.body));
    return reply.status(202).send();
  });

  app.get("/v1/moderation/submissions", async (request, reply) => {
    const session = await sessionFor(request);
    if (!session.authenticated || !isModerator(session)) return reply.status(403).send({ error: "moderator_role_required" });
    const query = request.query as { status?: string };
    return { submissions: await communityContent.listForModeration(SubmissionStatusSchema.parse(query.status ?? "pending")) };
  });

  app.patch("/v1/moderation/submissions/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isModerator(session)) return reply.status(403).send({ error: "moderator_role_required" });
    const { id } = request.params as { id: string };
    const input = ModerateSubmissionSchema.parse(request.body);
    const submission = await communityContent.moderate(
      id, input.status, session.email, input.note, input.assignedModeratorEmail,
    );
    if (!submission) return reply.status(404).send({ error: "submission_not_found" });
    await operations.notify(
      submission.authorEmail,
      "moderation",
      `${submission.title}: ${input.status.replace("_", " ")}`,
      input.note || "Your submission status changed.",
      `/post?id=${id}`,
    );
    await governance.audit(session.email, `submission.${input.status}`, "submission", id, { note: input.note });
    return { submission };
  });

  app.get("/v1/moderation/reports", async (request, reply) => {
    const session = await sessionFor(request);
    if (!session.authenticated || !isModerator(session)) return reply.status(403).send({ error: "moderator_role_required" });
    const query = request.query as { status?: string };
    return { reports: await governance.listReports(query.status ?? "open") };
  });

  app.patch("/v1/moderation/reports/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isModerator(session)) return reply.status(403).send({ error: "moderator_role_required" });
    const { id } = request.params as { id: string };
    const input = ResolveReportSchema.parse(request.body);
    const report = await governance.resolveReport(id, session.email, input.status, input.note);
    if (!report) return reply.status(404).send({ error: "report_not_found" });
    await governance.audit(session.email, `report.${input.status}`, "report", id);
    return { report };
  });

  app.get("/v1/moderation/access-reports", async (request, reply) => {
    const session = await sessionFor(request);
    if (!session.authenticated || !isModerator(session)) return reply.status(403).send({ error: "moderator_role_required" });
    const query = request.query as { status?: string };
    return { reports: await operations.listAccessReports(query.status ?? "open") };
  });

  app.patch("/v1/moderation/access-reports/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isModerator(session)) return reply.status(403).send({ error: "moderator_role_required" });
    const { id } = request.params as { id: string };
    const input = ResolveAccessReportSchema.parse(request.body);
    const report = await operations.resolveAccessReport(id, session.email, input.status, input.note);
    if (!report) return reply.status(404).send({ error: "access_report_not_found" });
    await governance.audit(session.email, `access_report.${input.status}`, report.targetType, report.targetId);
    return { report };
  });

  app.get("/v1/admin/users", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    return { users: await governance.listUsers() };
  });

  app.get("/v1/admin/content", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    return { content: await operations.listManagedContent() };
  });

  app.post("/v1/admin/notifications/broadcast", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const input = BroadcastNotificationSchema.parse(request.body);
    const recipients = (await governance.listUsers()).filter((user) => !user.suspended);
    await Promise.all(recipients.map((user) => operations.notify(
      user.email, "announcement", input.title, input.body, input.targetUrl,
    )));
    await governance.audit(session.email, "notification.broadcast", "notification", undefined, { recipients: recipients.length });
    return reply.status(201).send({ recipients: recipients.length });
  });

  app.patch("/v1/admin/content/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const { id } = request.params as { id: string };
    const content = await operations.updateLifecycle(id, LifecycleSchema.parse(request.body));
    if (!content) return reply.status(404).send({ error: "content_not_found" });
    await governance.audit(session.email, "content.lifecycle_updated", content.kind, id, { status: content.status });
    return { content };
  });

  app.get("/v1/admin/learning/assets", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    return { assets: await mediaMessaging.listAssets(true) };
  });

  app.post("/v1/admin/media/files", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const part = await request.file();
    if (!part) return reply.status(400).send({ error: "media_file_required" });
    const extensions: Record<string, string> = {
      "video/mp4": ".mp4",
      "video/webm": ".webm",
      "text/vtt": ".vtt",
    };
    const extension = extensions[part.mimetype];
    if (!extension) return reply.status(415).send({ error: "unsupported_media_type" });
    const filename = `${randomUUID()}${extension}`;
    await pipeline(part.file, createWriteStream(join(mediaRoot, filename), { flags: "wx" }));
    await governance.audit(session.email, "media_file.uploaded", "media_file", filename, { mimetype: part.mimetype });
    return reply.status(201).send({ file: { filename, url: `/api/media/${filename}`, mimetype: part.mimetype } });
  });

  app.post("/v1/admin/learning/assets", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const asset = await mediaMessaging.createAsset(LearningAssetSchema.parse(request.body), session.email);
    await governance.audit(session.email, "learning_asset.created", "learning_asset", asset.id, { status: asset.status });
    return reply.status(201).send({ asset });
  });

  app.patch("/v1/admin/learning/assets/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const { id } = request.params as { id: string };
    const asset = await mediaMessaging.updateAsset(id, UpdateLearningAssetSchema.parse(request.body));
    if (!asset) return reply.status(404).send({ error: "learning_asset_not_found" });
    await governance.audit(session.email, "learning_asset.updated", "learning_asset", id, { status: asset.status });
    return { asset };
  });

  app.patch("/v1/admin/users/:email", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const { email } = request.params as { email: string };
    const input = SuspendUserSchema.parse(request.body);
    const user = await governance.suspendUser(email.toLowerCase(), input.suspended, input.reason);
    if (!user) return reply.status(404).send({ error: "user_not_found" });
    await governance.audit(session.email, input.suspended ? "user.suspended" : "user.reinstated", "user", email, { reason: input.reason });
    return { user };
  });

  app.get("/v1/admin/features", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const overrides = await governance.getFeatureOverrides();
    return {
      features: Object.values(getFeatureRegistry()).map((feature) => ({
        ...feature,
        enabled: overrides[feature.id] ?? feature.enabled,
        overridden: feature.id in overrides,
      })),
    };
  });

  app.patch("/v1/admin/features/:id", async (request, reply) => {
    const session = await requireIdentity(request, reply);
    if (!session?.email || !isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const { id } = request.params as { id: string };
    if (!(id in getFeatureRegistry())) return reply.status(404).send({ error: "feature_not_found" });
    const { enabled } = FeatureOverrideSchema.parse(request.body);
    await governance.setFeatureOverride(id, enabled, session.email);
    await governance.audit(session.email, "feature.updated", "feature", id, { enabled });
    return { feature: { id, enabled } };
  });

  app.get("/v1/admin/audit", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    const query = request.query as { limit?: string };
    return { events: await governance.listAudit(Math.min(Number(query.limit ?? 100), 500)) };
  });

  app.get("/v1/admin/metrics", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isAdmin(session)) return reply.status(403).send({ error: "admin_role_required" });
    return { metrics: { ...(await governance.metrics()), ...(await operations.systemSnapshot()) } };
  });

  app.post("/v1/tools/submissions", async (request, reply) => {
    if (!(await featureEnabled("toolSubmissions"))) {
      return reply.status(403).send({ error: "feature_disabled", fallback: getFeatureRegistry().toolSubmissions.staticFallback });
    }
    const session = await sessionFor(request);
    const input = ToolSubmissionSchema.parse(request.body);
    const submitterEmail = session.email ?? input.submittedByEmail;
    if (config.requireMilEmail && !isMilEmail(submitterEmail)) {
      return reply.status(401).send({ error: "mil_email_required", message: "Tool submissions require an approved .mil identity." });
    }
    const submission = await toolSubmissions.create({ ...input, submittedByEmail: submitterEmail?.toLowerCase() });
    return reply.status(201).send({ submission });
  });

  app.get("/v1/admin/tools/submissions", async (request, reply) => {
    const session = await sessionFor(request);
    if (!isModerator(session)) return reply.status(403).send({ error: "admin_role_required" });
    return { submissions: await toolSubmissions.listPending() };
  });

  return { app, database };
}
