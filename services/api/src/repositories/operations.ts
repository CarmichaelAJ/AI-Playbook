import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { z } from "zod";

export const AccessReportSchema = z.object({
  targetType: z.enum(["tool", "play", "community", "learning", "source"]),
  targetId: z.string().trim().min(1).max(160),
  targetTitle: z.string().trim().min(2).max(200),
  targetUrl: z.string().url().max(1000).optional().or(z.literal("")),
  reason: z.enum(["broken-link", "access-denied", "outdated", "data-label", "accessibility", "other"]),
  details: z.string().trim().max(2000).optional().default(""),
});

export const ResolveAccessReportSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  note: z.string().trim().max(2000).optional().default(""),
});

export const LifecycleSchema = z.object({
  authorityUrl: z.string().url().max(1000).optional().or(z.literal("")),
  verifiedAt: z.string().datetime().optional().or(z.literal("")),
  reviewDueAt: z.string().datetime().optional().or(z.literal("")),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
  threadLocked: z.boolean().optional(),
  retired: z.boolean().optional(),
});

export const BroadcastNotificationSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(3).max(2000),
  targetUrl: z.string().max(1000).optional().default(""),
});

export type AccessReport = z.infer<typeof AccessReportSchema> & {
  id: string;
  reporterEmail: string;
  status: "open" | "resolved" | "dismissed";
  resolverEmail?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type UserNotification = {
  id: string;
  recipientEmail: string;
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

export class OperationsRepository {
  private readonly reports: AccessReport[] = [];
  private readonly notifications: UserNotification[] = [];
  private readonly lifecycle = new Map<string, ManagedContent>();

  constructor(private readonly pool?: Pool) {}

  async createAccessReport(input: z.infer<typeof AccessReportSchema>, reporterEmail: string): Promise<AccessReport> {
    const report: AccessReport = {
      ...input,
      id: randomUUID(),
      reporterEmail,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    if (!this.pool) {
      this.reports.unshift(report);
      return report;
    }
    const result = await this.pool.query(
      `INSERT INTO access_reports
        (id, target_type, target_id, target_title, target_url, reporter_email, reason, details)
       VALUES ($1, $2, $3, $4, NULLIF($5, ''), $6, $7, $8)
       RETURNING *`,
      [report.id, input.targetType, input.targetId, input.targetTitle, input.targetUrl, reporterEmail, input.reason, input.details],
    );
    return this.rowToAccessReport(result.rows[0]);
  }

  async listAccessReports(status = "open"): Promise<AccessReport[]> {
    if (!this.pool) return this.reports.filter((report) => report.status === status);
    const result = await this.pool.query(
      "SELECT * FROM access_reports WHERE status = $1 ORDER BY created_at DESC LIMIT 500",
      [status],
    );
    return result.rows.map((row) => this.rowToAccessReport(row));
  }

  async resolveAccessReport(id: string, resolverEmail: string, status: "resolved" | "dismissed", note: string): Promise<AccessReport | undefined> {
    if (!this.pool) {
      const report = this.reports.find((item) => item.id === id);
      if (!report) return undefined;
      Object.assign(report, { status, resolverEmail, resolutionNote: note, resolvedAt: new Date().toISOString() });
      return report;
    }
    const result = await this.pool.query(
      `UPDATE access_reports SET status = $2, resolver_email = $3, resolution_note = $4, resolved_at = now()
       WHERE id = $1 RETURNING *`,
      [id, status, resolverEmail, note],
    );
    return result.rowCount ? this.rowToAccessReport(result.rows[0]) : undefined;
  }

  async notify(recipientEmail: string, notificationType: string, title: string, body: string, targetUrl = ""): Promise<void> {
    const notification: UserNotification = {
      id: randomUUID(), recipientEmail, notificationType, title, body,
      targetUrl: targetUrl || undefined, createdAt: new Date().toISOString(),
    };
    if (!this.pool) {
      this.notifications.unshift(notification);
      return;
    }
    await this.pool.query(
      `INSERT INTO user_notifications
        (id, recipient_email, notification_type, title, body, target_url)
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))`,
      [notification.id, recipientEmail, notificationType, title, body, targetUrl],
    );
  }

  async listNotifications(email: string): Promise<UserNotification[]> {
    if (!this.pool) return this.notifications.filter((item) => item.recipientEmail === email).slice(0, 100);
    const result = await this.pool.query(
      "SELECT * FROM user_notifications WHERE recipient_email = $1 ORDER BY created_at DESC LIMIT 100",
      [email],
    );
    return result.rows.map((row) => this.rowToNotification(row));
  }

  async markNotificationRead(id: string, email: string): Promise<boolean> {
    if (!this.pool) {
      const item = this.notifications.find((notification) => notification.id === id && notification.recipientEmail === email);
      if (!item) return false;
      item.readAt = new Date().toISOString();
      return true;
    }
    const result = await this.pool.query(
      "UPDATE user_notifications SET read_at = COALESCE(read_at, now()) WHERE id = $1 AND recipient_email = $2",
      [id, email],
    );
    return Boolean(result.rowCount);
  }

  async listManagedContent(): Promise<ManagedContent[]> {
    if (!this.pool) return [...this.lifecycle.values()];
    const result = await this.pool.query(
      `SELECT id::text, kind, title, status, authority_url, verified_at, review_due_at,
        expires_at, thread_locked, retired_at
       FROM community_submissions
       WHERE status IN ('approved', 'removed')
       ORDER BY COALESCE(review_due_at, 'infinity'::timestamptz), updated_at DESC`,
    );
    return result.rows.map((row) => this.rowToManagedContent(row));
  }

  async updateLifecycle(id: string, input: z.infer<typeof LifecycleSchema>): Promise<ManagedContent | undefined> {
    if (!this.pool) {
      const current = this.lifecycle.get(id);
      if (!current) return undefined;
      const updated = {
        ...current,
        authorityUrl: input.authorityUrl || undefined,
        verifiedAt: input.verifiedAt || undefined,
        reviewDueAt: input.reviewDueAt || undefined,
        expiresAt: input.expiresAt || undefined,
        threadLocked: input.threadLocked ?? current.threadLocked,
        retiredAt: input.retired ? new Date().toISOString() : input.retired === false ? undefined : current.retiredAt,
        status: input.retired ? "removed" : input.retired === false ? "approved" : current.status,
      };
      this.lifecycle.set(id, updated);
      return updated;
    }
    const result = await this.pool.query(
      `UPDATE community_submissions SET
        authority_url = CASE WHEN $2::boolean THEN NULLIF($3, '') ELSE authority_url END,
        verified_at = CASE WHEN $4::boolean THEN NULLIF($5, '')::timestamptz ELSE verified_at END,
        review_due_at = CASE WHEN $6::boolean THEN NULLIF($7, '')::timestamptz ELSE review_due_at END,
        expires_at = CASE WHEN $8::boolean THEN NULLIF($9, '')::timestamptz ELSE expires_at END,
        thread_locked = COALESCE($10, thread_locked),
        retired_at = CASE WHEN $11::boolean IS TRUE THEN now() WHEN $11::boolean IS FALSE THEN NULL ELSE retired_at END,
        status = CASE WHEN $11::boolean IS TRUE THEN 'removed' WHEN $11::boolean IS FALSE AND status = 'removed' THEN 'approved' ELSE status END,
        updated_at = now()
       WHERE id = $1
       RETURNING id::text, kind, title, status, authority_url, verified_at, review_due_at,
         expires_at, thread_locked, retired_at`,
      [
        id,
        input.authorityUrl !== undefined, input.authorityUrl ?? "",
        input.verifiedAt !== undefined, input.verifiedAt ?? "",
        input.reviewDueAt !== undefined, input.reviewDueAt ?? "",
        input.expiresAt !== undefined, input.expiresAt ?? "",
        input.threadLocked ?? null, input.retired ?? null,
      ],
    );
    return result.rowCount ? this.rowToManagedContent(result.rows[0]) : undefined;
  }

  async isThreadLocked(id: string): Promise<boolean> {
    if (!this.pool) return this.lifecycle.get(id)?.threadLocked ?? false;
    const result = await this.pool.query("SELECT thread_locked FROM community_submissions WHERE id = $1", [id]);
    return Boolean(result.rows[0]?.thread_locked);
  }

  async systemSnapshot(): Promise<Record<string, number | string>> {
    if (!this.pool) {
      return {
        database: "memory",
        openAccessReports: this.reports.filter((item) => item.status === "open").length,
        unreadNotifications: this.notifications.filter((item) => !item.readAt).length,
      };
    }
    const result = await this.pool.query(
      `SELECT
        (SELECT COUNT(*) FROM access_reports WHERE status = 'open')::int AS open_access_reports,
        (SELECT COUNT(*) FROM user_notifications WHERE read_at IS NULL)::int AS unread_notifications,
        (SELECT COUNT(*) FROM community_submissions WHERE review_due_at < now() AND status = 'approved')::int AS overdue_reviews,
        (SELECT COUNT(*) FROM community_submissions WHERE thread_locked)::int AS locked_threads`,
    );
    return {
      database: "postgres",
      openAccessReports: Number(result.rows[0].open_access_reports),
      unreadNotifications: Number(result.rows[0].unread_notifications),
      overdueReviews: Number(result.rows[0].overdue_reviews),
      lockedThreads: Number(result.rows[0].locked_threads),
    };
  }

  private rowToAccessReport(row: Record<string, unknown>): AccessReport {
    return {
      id: String(row.id), targetType: AccessReportSchema.shape.targetType.parse(row.target_type),
      targetId: String(row.target_id), targetTitle: String(row.target_title),
      targetUrl: row.target_url ? String(row.target_url) : "", reporterEmail: String(row.reporter_email),
      reason: AccessReportSchema.shape.reason.parse(row.reason), details: String(row.details ?? ""),
      status: z.enum(["open", "resolved", "dismissed"]).parse(row.status),
      resolverEmail: row.resolver_email ? String(row.resolver_email) : undefined,
      resolutionNote: row.resolution_note ? String(row.resolution_note) : undefined,
      createdAt: new Date(String(row.created_at)).toISOString(),
      resolvedAt: row.resolved_at ? new Date(String(row.resolved_at)).toISOString() : undefined,
    };
  }

  private rowToNotification(row: Record<string, unknown>): UserNotification {
    return {
      id: String(row.id), recipientEmail: String(row.recipient_email),
      notificationType: String(row.notification_type), title: String(row.title), body: String(row.body),
      targetUrl: row.target_url ? String(row.target_url) : undefined,
      createdAt: new Date(String(row.created_at)).toISOString(),
      readAt: row.read_at ? new Date(String(row.read_at)).toISOString() : undefined,
    };
  }

  private rowToManagedContent(row: Record<string, unknown>): ManagedContent {
    return {
      id: String(row.id), kind: String(row.kind), title: String(row.title), status: String(row.status),
      authorityUrl: row.authority_url ? String(row.authority_url) : undefined,
      verifiedAt: row.verified_at ? new Date(String(row.verified_at)).toISOString() : undefined,
      reviewDueAt: row.review_due_at ? new Date(String(row.review_due_at)).toISOString() : undefined,
      expiresAt: row.expires_at ? new Date(String(row.expires_at)).toISOString() : undefined,
      threadLocked: Boolean(row.thread_locked),
      retiredAt: row.retired_at ? new Date(String(row.retired_at)).toISOString() : undefined,
    };
  }
}
