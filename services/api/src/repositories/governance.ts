import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { z } from "zod";

export const ReportSchema = z.object({
  reason: z.enum(["unsafe", "incorrect", "duplicate", "spam", "outdated", "other"]),
  details: z.string().trim().max(2000).optional().default(""),
});

export const ResolveReportSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  note: z.string().trim().max(2000).optional().default(""),
});

export const ProfileSchema = z.object({
  username: z.string().trim().min(2).max(40),
  afsc: z.string().trim().min(1).max(20),
  rank: z.string().trim().min(1).max(20),
});

export const SuspendUserSchema = z.object({
  suspended: z.boolean(),
  reason: z.string().trim().max(1000).optional().default(""),
});

export const MembershipSchema = z.object({
  role: z.enum(["member", "moderator", "owner"]).default("member"),
});

export const FeatureOverrideSchema = z.object({
  enabled: z.boolean(),
});

export const AnalyticsEventSchema = z.object({
  eventName: z.string().trim().min(2).max(80),
  targetType: z.string().trim().max(40).optional(),
  targetId: z.string().trim().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const LearningProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  progressPercent: z.number().int().min(0).max(100),
});

export type ContentReport = {
  id: string;
  submissionId: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  resolverEmail?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type UserProfile = {
  email: string;
  username: string;
  afsc: string;
  rank: string;
  suspended: boolean;
  suspensionReason?: string;
  firstSeenAt: string;
  updatedAt: string;
};

export type AuditEvent = {
  id: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export class GovernanceRepository {
  private reports = new Map<string, ContentReport>();
  private profiles = new Map<string, UserProfile>();
  private memberships = new Map<string, Map<string, string>>();
  private featureOverrides = new Map<string, boolean>();
  private auditEvents: AuditEvent[] = [];
  private analytics: Array<{ eventName: string; actorEmail?: string; createdAt: string }> = [];
  private learning = new Map<string, { assetId: string; status: string; progressPercent: number; updatedAt: string }>();

  constructor(private readonly pool?: Pool) {}

  async upsertProfile(email: string, input: z.infer<typeof ProfileSchema>): Promise<UserProfile> {
    const now = new Date().toISOString();
    if (!this.pool) {
      const existing = this.profiles.get(email);
      const profile: UserProfile = {
        email,
        ...input,
        suspended: existing?.suspended ?? false,
        suspensionReason: existing?.suspensionReason,
        firstSeenAt: existing?.firstSeenAt ?? now,
        updatedAt: now,
      };
      this.profiles.set(email, profile);
      return profile;
    }
    const result = await this.pool.query(
      `INSERT INTO user_profiles (email, username, afsc, rank)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username, afsc = EXCLUDED.afsc, rank = EXCLUDED.rank, updated_at = now()
       RETURNING *`,
      [email, input.username, input.afsc, input.rank],
    );
    return this.rowToProfile(result.rows[0]);
  }

  async isSuspended(email: string): Promise<boolean> {
    if (!this.pool) return this.profiles.get(email)?.suspended ?? false;
    const result = await this.pool.query("SELECT suspended FROM user_profiles WHERE email = $1", [email]);
    return Boolean(result.rows[0]?.suspended);
  }

  async listUsers(): Promise<UserProfile[]> {
    if (!this.pool) return [...this.profiles.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const result = await this.pool.query("SELECT * FROM user_profiles ORDER BY updated_at DESC");
    return result.rows.map((row) => this.rowToProfile(row));
  }

  async suspendUser(email: string, suspended: boolean, reason: string): Promise<UserProfile | undefined> {
    if (!this.pool) {
      const existing = this.profiles.get(email);
      if (!existing) return undefined;
      const updated = {
        ...existing,
        suspended,
        suspensionReason: suspended ? reason : undefined,
        updatedAt: new Date().toISOString(),
      };
      this.profiles.set(email, updated);
      return updated;
    }
    const result = await this.pool.query(
      `UPDATE user_profiles SET suspended = $2, suspension_reason = NULLIF($3, ''), updated_at = now()
       WHERE email = $1 RETURNING *`,
      [email, suspended, reason],
    );
    return result.rowCount ? this.rowToProfile(result.rows[0]) : undefined;
  }

  async report(submissionId: string, reporterEmail: string, input: z.infer<typeof ReportSchema>): Promise<ContentReport> {
    const report: ContentReport = {
      id: randomUUID(),
      submissionId,
      reporterEmail,
      ...input,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    if (!this.pool) {
      const duplicate = [...this.reports.values()].find(
        (item) => item.submissionId === submissionId && item.reporterEmail === reporterEmail,
      );
      if (duplicate) return duplicate;
      this.reports.set(report.id, report);
      return report;
    }
    const result = await this.pool.query(
      `INSERT INTO content_reports (id, submission_id, reporter_email, reason, details)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (submission_id, reporter_email) DO UPDATE SET reason = EXCLUDED.reason, details = EXCLUDED.details
       RETURNING *`,
      [report.id, submissionId, reporterEmail, input.reason, input.details],
    );
    return this.rowToReport(result.rows[0]);
  }

  async listReports(status = "open"): Promise<ContentReport[]> {
    if (!this.pool) {
      return [...this.reports.values()]
        .filter((item) => item.status === status)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    const result = await this.pool.query("SELECT * FROM content_reports WHERE status = $1 ORDER BY created_at ASC", [status]);
    return result.rows.map((row) => this.rowToReport(row));
  }

  async resolveReport(
    id: string,
    resolverEmail: string,
    status: "resolved" | "dismissed",
    note: string,
  ): Promise<ContentReport | undefined> {
    if (!this.pool) {
      const existing = this.reports.get(id);
      if (!existing) return undefined;
      const updated = {
        ...existing,
        status,
        resolverEmail,
        resolutionNote: note,
        resolvedAt: new Date().toISOString(),
      };
      this.reports.set(id, updated);
      return updated;
    }
    const result = await this.pool.query(
      `UPDATE content_reports SET status = $2, resolver_email = $3, resolution_note = $4, resolved_at = now()
       WHERE id = $1 RETURNING *`,
      [id, status, resolverEmail, note],
    );
    return result.rowCount ? this.rowToReport(result.rows[0]) : undefined;
  }

  async setMembership(communityId: string, email: string, role: "member" | "moderator" | "owner"): Promise<void> {
    if (!this.pool) {
      const members = this.memberships.get(communityId) ?? new Map<string, string>();
      members.set(email, role);
      this.memberships.set(communityId, members);
      return;
    }
    await this.pool.query(
      `INSERT INTO community_memberships (community_id, member_email, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (community_id, member_email) DO UPDATE SET role = EXCLUDED.role`,
      [communityId, email, role],
    );
  }

  async removeMembership(communityId: string, email: string): Promise<void> {
    if (!this.pool) {
      this.memberships.get(communityId)?.delete(email);
      return;
    }
    await this.pool.query("DELETE FROM community_memberships WHERE community_id = $1 AND member_email = $2", [communityId, email]);
  }

  async membershipSummary(communityId: string, email?: string): Promise<{ count: number; role?: string }> {
    if (!this.pool) {
      const members = this.memberships.get(communityId) ?? new Map<string, string>();
      return { count: members.size, role: email ? members.get(email) : undefined };
    }
    const result = await this.pool.query(
      `SELECT COUNT(*)::int AS count,
       MAX(CASE WHEN member_email = $2 THEN role END) AS role
       FROM community_memberships WHERE community_id = $1`,
      [communityId, email ?? ""],
    );
    return { count: Number(result.rows[0].count), role: result.rows[0].role ?? undefined };
  }

  async setFeatureOverride(featureId: string, enabled: boolean, actorEmail: string): Promise<void> {
    if (!this.pool) {
      this.featureOverrides.set(featureId, enabled);
      return;
    }
    await this.pool.query(
      `INSERT INTO feature_overrides (feature_id, enabled, updated_by_email)
       VALUES ($1, $2, $3)
       ON CONFLICT (feature_id) DO UPDATE SET enabled = EXCLUDED.enabled, updated_by_email = EXCLUDED.updated_by_email, updated_at = now()`,
      [featureId, enabled, actorEmail],
    );
  }

  async getFeatureOverrides(): Promise<Record<string, boolean>> {
    if (!this.pool) return Object.fromEntries(this.featureOverrides);
    const result = await this.pool.query("SELECT feature_id, enabled FROM feature_overrides");
    return Object.fromEntries(result.rows.map((row) => [String(row.feature_id), Boolean(row.enabled)]));
  }

  async audit(
    actorEmail: string | undefined,
    action: string,
    targetType: string,
    targetId?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const event: AuditEvent = {
      id: randomUUID(),
      actorEmail,
      action,
      targetType,
      targetId,
      metadata,
      createdAt: new Date().toISOString(),
    };
    if (!this.pool) {
      this.auditEvents.unshift(event);
      this.auditEvents = this.auditEvents.slice(0, 1000);
      return;
    }
    await this.pool.query(
      `INSERT INTO audit_events (id, actor_email, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [event.id, actorEmail, action, targetType, targetId, metadata],
    );
  }

  async listAudit(limit = 100): Promise<AuditEvent[]> {
    if (!this.pool) return this.auditEvents.slice(0, limit);
    const result = await this.pool.query("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT $1", [limit]);
    return result.rows.map((row) => ({
      id: String(row.id),
      actorEmail: row.actor_email ? String(row.actor_email) : undefined,
      action: String(row.action),
      targetType: String(row.target_type),
      targetId: row.target_id ? String(row.target_id) : undefined,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  async track(
    actorEmail: string | undefined,
    input: z.infer<typeof AnalyticsEventSchema>,
  ): Promise<void> {
    if (!this.pool) {
      this.analytics.push({ eventName: input.eventName, actorEmail, createdAt: new Date().toISOString() });
      return;
    }
    await this.pool.query(
      `INSERT INTO analytics_events (id, actor_email, event_name, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), actorEmail, input.eventName, input.targetType, input.targetId, input.metadata],
    );
  }

  async metrics(): Promise<Record<string, number>> {
    if (!this.pool) {
      return this.analytics.reduce<Record<string, number>>((totals, event) => {
        totals[event.eventName] = (totals[event.eventName] ?? 0) + 1;
        return totals;
      }, {});
    }
    const result = await this.pool.query(
      "SELECT event_name, COUNT(*)::int AS count FROM analytics_events GROUP BY event_name ORDER BY count DESC",
    );
    return Object.fromEntries(result.rows.map((row) => [String(row.event_name), Number(row.count)]));
  }

  async setLearningProgress(
    email: string,
    assetId: string,
    input: z.infer<typeof LearningProgressSchema>,
  ): Promise<void> {
    const value = { assetId, ...input, updatedAt: new Date().toISOString() };
    if (!this.pool) {
      this.learning.set(`${email}:${assetId}`, value);
      return;
    }
    await this.pool.query(
      `INSERT INTO learning_progress (user_email, asset_id, status, progress_percent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_email, asset_id) DO UPDATE
       SET status = EXCLUDED.status, progress_percent = EXCLUDED.progress_percent, updated_at = now()`,
      [email, assetId, input.status, input.progressPercent],
    );
  }

  async getLearningProgress(email: string): Promise<Array<{ assetId: string; status: string; progressPercent: number; updatedAt: string }>> {
    if (!this.pool) {
      return [...this.learning.entries()]
        .filter(([key]) => key.startsWith(`${email}:`))
        .map(([, value]) => value);
    }
    const result = await this.pool.query("SELECT * FROM learning_progress WHERE user_email = $1 ORDER BY updated_at DESC", [email]);
    return result.rows.map((row) => ({
      assetId: String(row.asset_id),
      status: String(row.status),
      progressPercent: Number(row.progress_percent),
      updatedAt: new Date(row.updated_at).toISOString(),
    }));
  }

  private rowToProfile(row: Record<string, unknown>): UserProfile {
    return {
      email: String(row.email),
      username: String(row.username),
      afsc: String(row.afsc),
      rank: String(row.rank),
      suspended: Boolean(row.suspended),
      suspensionReason: row.suspension_reason ? String(row.suspension_reason) : undefined,
      firstSeenAt: new Date(String(row.first_seen_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString(),
    };
  }

  private rowToReport(row: Record<string, unknown>): ContentReport {
    return {
      id: String(row.id),
      submissionId: String(row.submission_id),
      reporterEmail: String(row.reporter_email),
      reason: String(row.reason),
      details: String(row.details ?? ""),
      status: row.status as ContentReport["status"],
      resolverEmail: row.resolver_email ? String(row.resolver_email) : undefined,
      resolutionNote: row.resolution_note ? String(row.resolution_note) : undefined,
      createdAt: new Date(String(row.created_at)).toISOString(),
      resolvedAt: row.resolved_at ? new Date(String(row.resolved_at)).toISOString() : undefined,
    };
  }
}
