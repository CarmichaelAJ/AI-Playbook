import { getPlatformIdentity, type PlatformIdentity } from "@/lib/platformIdentity";
import type { PlatformFeedSort } from "@/lib/platformFeed";
import { APP_MODE } from "@/lib/features";

export type SubmissionKind = "tool" | "play" | "community";
export type SubmissionStatus = "draft" | "pending" | "changes_requested" | "approved" | "rejected" | "removed";

export type CommunitySubmission = {
  id: string;
  kind: SubmissionKind;
  title: string;
  summary: string;
  content: string;
  url?: string;
  category?: string;
  communityId?: string;
  dataLevel: string;
  authorEmail: string;
  authorUsername: string;
  authorAfsc: string;
  authorRank: string;
  status: SubmissionStatus;
  score: number;
  commentCount: number;
  createdAt: string;
  moderationNote?: string;
  assignedModeratorEmail?: string;
  version: number;
  updatedAt: string;
  reviewedAt?: string;
};

export type ContentReport = {
  id: string;
  submissionId: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  resolutionNote?: string;
  createdAt: string;
};

export type PlatformFeature = {
  id: string;
  label: string;
  enabled: boolean;
  mode: string;
  staticFallback: string;
  overridden?: boolean;
};

export type UserProfile = {
  email: string;
  username: string;
  afsc: string;
  rank: string;
  suspended: boolean;
  suspensionReason?: string;
  updatedAt: string;
};

export type LearningProgress = {
  assetId: string;
  status: "not_started" | "in_progress" | "completed";
  progressPercent: number;
  updatedAt?: string;
};

export type LearningAsset = {
  id: string;
  title: string;
  summary: string;
  durationSeconds: number;
  audience: string;
  afscTags: string[];
  rankTags: string[];
  playbackUrl: string;
  thumbnailUrl?: string;
  captionUrl?: string;
  transcript: string;
  status: "draft" | "published" | "archived";
  dataLevel: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type DirectMessage = {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  body: string;
  createdAt: string;
  readAt?: string;
};

export type ConversationSummary = {
  participantEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type AccessReport = {
  id: string;
  targetType: "tool" | "play" | "community" | "learning" | "source";
  targetId: string;
  targetTitle: string;
  targetUrl?: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
};

export type UserNotification = {
  id: string;
  notificationType: string;
  title: string;
  body: string;
  targetUrl?: string;
  createdAt: string;
  readAt?: string;
};

export type ManagedContent = {
  id: string;
  kind: string;
  title: string;
  status: string;
  authorityUrl?: string;
  verifiedAt?: string;
  reviewDueAt?: string;
  expiresAt?: string;
  threadLocked: boolean;
  retiredAt?: string;
};

export type CommunityComment = {
  id: string;
  submissionId: string;
  body: string;
  authorUsername: string;
  authorAfsc: string;
  authorRank: string;
  createdAt: string;
};

function apiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "3001") {
    return "http://localhost:8080";
  }
  return "/api";
}

export function resolvePlatformMediaUrl(url: string): string {
  if (url.startsWith("/api/") && typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "3001") {
    return `http://localhost:8080/${url.slice("/api/".length)}`;
  }
  return url;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  identity: PlatformIdentity | null = getPlatformIdentity(),
): Promise<T> {
  if (APP_MODE === "static") {
    throw new Error("platform_mode_disabled");
  }
  const headers = new Headers(options.headers);
  headers.set("content-type", "application/json");
  if (identity) {
    headers.set("x-user-email", identity.email);
    headers.set("x-user-roles", identity.role);
  }

  const response = await fetch(`${apiBase()}${path}`, { ...options, headers });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string; message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? `Request failed (${response.status})`);
  }
  return payload;
}

export async function fetchCommunityFeed(
  kind: SubmissionKind,
  sort: Exclude<PlatformFeedSort, "core">,
  communityId?: string,
): Promise<CommunitySubmission[]> {
  const community = communityId ? `&communityId=${encodeURIComponent(communityId)}` : "";
  const payload = await request<{ submissions: CommunitySubmission[] }>(`/v1/feed/${kind}?sort=${sort}${community}`);
  return payload.submissions;
}

export async function createSubmission(input: {
  kind: SubmissionKind;
  title: string;
  summary: string;
  content: string;
  url?: string;
  category?: string;
  dataLevel: string;
  authorUsername: string;
  authorAfsc: string;
  authorRank: string;
  communityId?: string;
  submitMode?: "draft" | "review";
}): Promise<CommunitySubmission> {
  const dataLevel =
    input.dataLevel === "impact-level-4"
      ? "il4"
      : input.dataLevel === "impact-level-5"
        ? "il5"
        : input.dataLevel;
  const payload = await request<{ submission: CommunitySubmission }>("/v1/submissions", {
    method: "POST",
    body: JSON.stringify({ ...input, dataLevel }),
  });
  return payload.submission;
}

export async function fetchMySubmissions(): Promise<CommunitySubmission[]> {
  const payload = await request<{ submissions: CommunitySubmission[] }>("/v1/submissions/mine");
  return payload.submissions;
}

export async function fetchSubmission(id: string): Promise<CommunitySubmission> {
  const payload = await request<{ submission: CommunitySubmission }>(`/v1/submissions/${id}`);
  return payload.submission;
}

export async function updateSubmission(
  id: string,
  input: Partial<Omit<CommunitySubmission, "id" | "authorEmail" | "status" | "score" | "commentCount" | "createdAt" | "updatedAt" | "version">> & {
    submitMode?: "draft" | "review";
  },
): Promise<CommunitySubmission> {
  const dataLevel =
    input.dataLevel === "impact-level-4" ? "il4" : input.dataLevel === "impact-level-5" ? "il5" : input.dataLevel;
  const payload = await request<{ submission: CommunitySubmission }>(`/v1/submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...input, dataLevel }),
  });
  return payload.submission;
}

export async function searchCommunityContent(query: string): Promise<CommunitySubmission[]> {
  const payload = await request<{ submissions: CommunitySubmission[] }>(`/v1/search?q=${encodeURIComponent(query)}`);
  return payload.submissions;
}

export async function voteOnSubmission(id: string, value: -1 | 0 | 1): Promise<number> {
  const payload = await request<{ score: number }>(`/v1/submissions/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
  return payload.score;
}

export async function fetchComments(id: string): Promise<CommunityComment[]> {
  const payload = await request<{ comments: CommunityComment[] }>(`/v1/submissions/${id}/comments`);
  return payload.comments;
}

export async function addComment(id: string, body: string, identity: PlatformIdentity): Promise<CommunityComment> {
  const payload = await request<{ comment: CommunityComment }>(
    `/v1/submissions/${id}/comments`,
    {
      method: "POST",
      body: JSON.stringify({
        body,
        authorUsername: identity.username,
        authorAfsc: identity.afsc,
        authorRank: identity.rank,
      }),
    },
    identity,
  );
  return payload.comment;
}

export async function fetchModerationQueue(status: SubmissionStatus = "pending"): Promise<CommunitySubmission[]> {
  const payload = await request<{ submissions: CommunitySubmission[] }>(
    `/v1/moderation/submissions?status=${status}`,
  );
  return payload.submissions;
}

export async function moderateSubmission(
  id: string,
  status: "approved" | "rejected" | "changes_requested" | "removed",
  note: string,
): Promise<CommunitySubmission> {
  const payload = await request<{ submission: CommunitySubmission }>(`/v1/moderation/submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
  return payload.submission;
}

export async function reportSubmission(id: string, reason: string, details = ""): Promise<ContentReport> {
  const payload = await request<{ report: ContentReport }>(`/v1/submissions/${id}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
  });
  return payload.report;
}

export async function fetchMembership(
  id: string,
  identity: PlatformIdentity | null = getPlatformIdentity(),
): Promise<{ count: number; role?: string }> {
  const payload = await request<{ membership: { count: number; role?: string } }>(
    `/v1/communities/${id}/membership`,
    {},
    identity,
  );
  return payload.membership;
}

export async function joinCommunity(id: string): Promise<{ count: number; role?: string }> {
  const payload = await request<{ membership: { count: number; role?: string } }>(`/v1/communities/${id}/membership`, {
    method: "POST",
    body: JSON.stringify({ role: "member" }),
  });
  return payload.membership;
}

export async function leaveCommunity(id: string): Promise<void> {
  await request(`/v1/communities/${id}/membership`, { method: "DELETE" });
}

export async function syncPlatformProfile(identity: PlatformIdentity): Promise<UserProfile> {
  const payload = await request<{ profile: UserProfile }>("/v1/profile", {
    method: "PATCH",
    body: JSON.stringify({
      username: identity.username,
      afsc: identity.afsc,
      rank: identity.rank,
    }),
  }, identity);
  return payload.profile;
}

export async function fetchAdminFeatures(): Promise<PlatformFeature[]> {
  const payload = await request<{ features: PlatformFeature[] }>("/v1/admin/features");
  return payload.features;
}

export async function setAdminFeature(id: string, enabled: boolean): Promise<void> {
  await request(`/v1/admin/features/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) });
}

export async function fetchAdminUsers(): Promise<UserProfile[]> {
  const payload = await request<{ users: UserProfile[] }>("/v1/admin/users");
  return payload.users;
}

export async function setUserSuspension(email: string, suspended: boolean, reason = ""): Promise<UserProfile> {
  const payload = await request<{ user: UserProfile }>(`/v1/admin/users/${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify({ suspended, reason }),
  });
  return payload.user;
}

export async function fetchReports(status = "open"): Promise<ContentReport[]> {
  const payload = await request<{ reports: ContentReport[] }>(`/v1/moderation/reports?status=${status}`);
  return payload.reports;
}

export async function resolveReport(id: string, status: "resolved" | "dismissed", note = ""): Promise<void> {
  await request(`/v1/moderation/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status, note }) });
}

export async function fetchAuditEvents(): Promise<Array<{ id: string; action: string; actorEmail?: string; targetType: string; targetId?: string; createdAt: string }>> {
  const payload = await request<{ events: Array<{ id: string; action: string; actorEmail?: string; targetType: string; targetId?: string; createdAt: string }> }>("/v1/admin/audit");
  return payload.events;
}

export async function fetchMetrics(): Promise<Record<string, number | string>> {
  const payload = await request<{ metrics: Record<string, number | string> }>("/v1/admin/metrics");
  return payload.metrics;
}

export async function fetchLearningProgress(): Promise<LearningProgress[]> {
  const payload = await request<{ progress: LearningProgress[] }>("/v1/learning/progress");
  return payload.progress;
}

export async function fetchLearningAssets(admin = false): Promise<LearningAsset[]> {
  const path = admin ? "/v1/admin/learning/assets" : "/v1/learning/assets";
  const payload = await request<{ assets: LearningAsset[] }>(path);
  return payload.assets;
}

export async function createLearningAsset(input: {
  id: string;
  title: string;
  summary: string;
  durationSeconds: number;
  audience?: string;
  afscTags?: string[];
  rankTags?: string[];
  playbackUrl: string;
  thumbnailUrl?: string;
  captionUrl?: string;
  transcript?: string;
  status: "draft" | "published";
  dataLevel: string;
}): Promise<LearningAsset> {
  const payload = await request<{ asset: LearningAsset }>("/v1/admin/learning/assets", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.asset;
}

export async function updateLearningAsset(id: string, input: Partial<LearningAsset>): Promise<LearningAsset> {
  const payload = await request<{ asset: LearningAsset }>(`/v1/admin/learning/assets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return payload.asset;
}

export async function setLearningProgress(assetId: string, progressPercent: number): Promise<void> {
  const status = progressPercent >= 100 ? "completed" : progressPercent > 0 ? "in_progress" : "not_started";
  await request(`/v1/learning/progress/${encodeURIComponent(assetId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, progressPercent }),
  });
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const payload = await request<{ conversations: ConversationSummary[] }>("/v1/messages/conversations");
  return payload.conversations;
}

export async function fetchMessages(participantEmail: string): Promise<DirectMessage[]> {
  const payload = await request<{ messages: DirectMessage[] }>(`/v1/messages/${encodeURIComponent(participantEmail)}`);
  return payload.messages;
}

export async function sendMessage(recipientEmail: string, body: string): Promise<DirectMessage> {
  const payload = await request<{ message: DirectMessage }>("/v1/messages", {
    method: "POST",
    body: JSON.stringify({ recipientEmail, body }),
  });
  return payload.message;
}

export async function createAccessReport(input: {
  targetType: AccessReport["targetType"];
  targetId: string;
  targetTitle: string;
  targetUrl?: string;
  reason: string;
  details?: string;
}): Promise<AccessReport> {
  const payload = await request<{ report: AccessReport }>("/v1/access-reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.report;
}

export async function fetchAccessReports(status = "open"): Promise<AccessReport[]> {
  const payload = await request<{ reports: AccessReport[] }>(`/v1/moderation/access-reports?status=${status}`);
  return payload.reports;
}

export async function resolveAccessReport(id: string, status: "resolved" | "dismissed", note = ""): Promise<void> {
  await request(`/v1/moderation/access-reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}

export async function fetchNotifications(): Promise<UserNotification[]> {
  const payload = await request<{ notifications: UserNotification[] }>("/v1/notifications");
  return payload.notifications;
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/v1/notifications/${id}/read`, { method: "PATCH" });
}

export async function fetchManagedContent(): Promise<ManagedContent[]> {
  const payload = await request<{ content: ManagedContent[] }>("/v1/admin/content");
  return payload.content;
}

export async function updateManagedContent(
  id: string,
  input: Partial<Pick<ManagedContent, "authorityUrl" | "verifiedAt" | "reviewDueAt" | "expiresAt" | "threadLocked">> & { retired?: boolean },
): Promise<ManagedContent> {
  const payload = await request<{ content: ManagedContent }>(`/v1/admin/content/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return payload.content;
}

export async function trackAnalyticsEvent(
  eventName: string,
  targetType?: string,
  targetId?: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await request("/v1/analytics/events", {
    method: "POST",
    body: JSON.stringify({ eventName, targetType, targetId, metadata }),
  });
}

export async function uploadMediaFile(file: File): Promise<{ url: string; mimetype: string }> {
  if (APP_MODE === "static") throw new Error("platform_mode_disabled");
  const identity = getPlatformIdentity();
  if (!identity) throw new Error("mil_identity_required");
  const form = new FormData();
  form.set("file", file);
  const response = await fetch(`${apiBase()}/v1/admin/media/files`, {
    method: "POST",
    headers: {
      "x-user-email": identity.email,
      "x-user-roles": identity.role,
    },
    body: form,
  });
  const payload = (await response.json().catch(() => ({}))) as { file?: { url: string; mimetype: string }; error?: string };
  if (!response.ok || !payload.file) throw new Error(payload.error ?? "media_upload_failed");
  return payload.file;
}

export async function broadcastNotification(title: string, body: string, targetUrl = ""): Promise<number> {
  const payload = await request<{ recipients: number }>("/v1/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify({ title, body, targetUrl }),
  });
  return payload.recipients;
}
