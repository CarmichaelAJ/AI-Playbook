import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { z } from "zod";

export const SubmissionKindSchema = z.enum(["tool", "play", "community"]);
export const SubmissionStatusSchema = z.enum([
  "draft",
  "pending",
  "changes_requested",
  "approved",
  "rejected",
  "removed",
]);
export const FeedSortSchema = z.enum(["top", "trending", "recent"]);

const SubmissionFieldsSchema = z.object({
  kind: SubmissionKindSchema,
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(500),
  content: z.string().trim().max(10000).optional().default(""),
  url: z.string().url().max(500).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().default(""),
  dataLevel: z.enum(["public", "official-use", "cui", "il4", "il5", "tbd"]).default("tbd"),
  communityId: z.string().uuid().optional().or(z.literal("")),
  authorUsername: z.string().trim().min(2).max(40),
  authorAfsc: z.string().trim().min(1).max(20),
  authorRank: z.string().trim().min(1).max(20),
});

export const CreateSubmissionSchema = SubmissionFieldsSchema.extend({
  submitMode: z.enum(["draft", "review"]).optional().default("review"),
}).superRefine((input, context) => {
  if (input.submitMode === "review" && input.kind === "tool" && !input.url) {
    context.addIssue({ code: "custom", path: ["url"], message: "Tools require a valid URL." });
  }
  if (input.submitMode === "review" && input.kind === "play" && input.content.length < 20) {
    context.addIssue({ code: "custom", path: ["content"], message: "Plays require actionable instructions." });
  }
});

export const UpdateSubmissionSchema = z.object({
  kind: SubmissionKindSchema.optional(),
  title: z.string().trim().min(3).max(120).optional(),
  summary: z.string().trim().min(10).max(500).optional(),
  content: z.string().trim().max(10000).optional(),
  url: z.string().url().max(500).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional(),
  dataLevel: z.enum(["public", "official-use", "cui", "il4", "il5", "tbd"]).optional(),
  communityId: z.string().uuid().optional().or(z.literal("")),
  authorUsername: z.string().trim().min(2).max(40).optional(),
  authorAfsc: z.string().trim().min(1).max(20).optional(),
  authorRank: z.string().trim().min(1).max(20).optional(),
  submitMode: z.enum(["draft", "review"]).optional(),
});

export const CreateCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  authorUsername: z.string().trim().min(2).max(40),
  authorAfsc: z.string().trim().min(1).max(20),
  authorRank: z.string().trim().min(1).max(20),
});

export const VoteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export const ModerateSubmissionSchema = z.object({
  status: z.enum(["approved", "rejected", "changes_requested", "removed"]),
  note: z.string().trim().max(1000).optional().default(""),
  assignedModeratorEmail: z.string().email().optional(),
});

export type SubmissionKind = z.infer<typeof SubmissionKindSchema>;
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;
export type FeedSort = z.infer<typeof FeedSortSchema>;
export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof UpdateSubmissionSchema>;

type SubmissionFields = Omit<CreateSubmissionInput, "submitMode">;

export type CommunitySubmission = SubmissionFields & {
  id: string;
  status: SubmissionStatus;
  authorEmail: string;
  moderatorEmail?: string;
  assignedModeratorEmail?: string;
  moderationNote?: string;
  score: number;
  commentCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
};

export type SubmissionRevision = {
  id: string;
  submissionId: string;
  version: number;
  editorEmail: string;
  snapshot: CommunitySubmission;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  submissionId: string;
  body: string;
  authorEmail: string;
  authorUsername: string;
  authorAfsc: string;
  authorRank: string;
  createdAt: string;
};

function rowToSubmission(row: Record<string, unknown>): CommunitySubmission {
  return {
    id: String(row.id),
    kind: SubmissionKindSchema.parse(row.kind),
    title: String(row.title),
    summary: String(row.summary),
    content: String(row.content ?? ""),
    url: row.url ? String(row.url) : "",
    category: String(row.category ?? ""),
    dataLevel: SubmissionFieldsSchema.shape.dataLevel.parse(row.data_level),
    communityId: row.community_id ? String(row.community_id) : "",
    authorEmail: String(row.author_email),
    authorUsername: String(row.author_username),
    authorAfsc: String(row.author_afsc),
    authorRank: String(row.author_rank),
    status: SubmissionStatusSchema.parse(row.status),
    moderatorEmail: row.moderator_email ? String(row.moderator_email) : undefined,
    assignedModeratorEmail: row.assigned_moderator_email ? String(row.assigned_moderator_email) : undefined,
    moderationNote: row.moderation_note ? String(row.moderation_note) : undefined,
    score: Number(row.score ?? 0),
    commentCount: Number(row.comment_count ?? 0),
    version: Number(row.version ?? 1),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
    reviewedAt: row.reviewed_at ? new Date(String(row.reviewed_at)).toISOString() : undefined,
  };
}

const selectWithCounts = `SELECT s.*,
  COALESCE((SELECT SUM(v.value) FROM community_votes v WHERE v.submission_id = s.id), 0)::int AS score,
  (SELECT COUNT(*) FROM community_comments c WHERE c.submission_id = s.id)::int AS comment_count
 FROM community_submissions s`;

export class CommunityContentRepository {
  private readonly submissions = new Map<string, CommunitySubmission>();
  private readonly votes = new Map<string, number>();
  private readonly comments = new Map<string, CommunityComment[]>();
  private readonly revisions = new Map<string, SubmissionRevision[]>();

  constructor(private readonly pool?: Pool) {}

  async create(input: CreateSubmissionInput, authorEmail: string): Promise<CommunitySubmission> {
    const { submitMode, ...fields } = input;
    const now = new Date().toISOString();
    const submission: CommunitySubmission = {
      ...fields,
      id: randomUUID(),
      status: submitMode === "draft" ? "draft" : "pending",
      authorEmail,
      score: 0,
      commentCount: 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    if (!this.pool) {
      this.submissions.set(submission.id, submission);
      return submission;
    }

    const result = await this.pool.query(
      `INSERT INTO community_submissions
        (id, kind, title, summary, content, url, category, data_level, community_id, author_email,
         author_username, author_afsc, author_rank, status)
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''), NULLIF($7, ''), $8, NULLIF($9, '')::uuid,
         $10, $11, $12, $13, $14)
       RETURNING *, 0::int AS score, 0::int AS comment_count`,
      [
        submission.id, submission.kind, submission.title, submission.summary, submission.content,
        submission.url, submission.category, submission.dataLevel, submission.communityId,
        submission.authorEmail, submission.authorUsername, submission.authorAfsc, submission.authorRank,
        submission.status,
      ],
    );
    return rowToSubmission(result.rows[0]);
  }

  async getById(id: string): Promise<CommunitySubmission | undefined> {
    if (!this.pool) return this.submissions.get(id);
    const result = await this.pool.query(`${selectWithCounts} WHERE s.id = $1`, [id]);
    return result.rowCount ? rowToSubmission(result.rows[0]) : undefined;
  }

  async findDuplicate(kind: SubmissionKind, title: string, excludeId?: string): Promise<CommunitySubmission | undefined> {
    const normalized = title.trim().toLowerCase();
    if (!this.pool) {
      return [...this.submissions.values()].find(
        (item) => item.id !== excludeId && item.kind === kind && item.title.trim().toLowerCase() === normalized &&
          !["rejected", "removed"].includes(item.status),
      );
    }
    const result = await this.pool.query(
      `${selectWithCounts}
       WHERE s.kind = $1 AND lower(trim(s.title)) = $2 AND s.id <> COALESCE($3::uuid, '00000000-0000-0000-0000-000000000000')
         AND s.status NOT IN ('rejected', 'removed')
       LIMIT 1`,
      [kind, normalized, excludeId ?? null],
    );
    return result.rowCount ? rowToSubmission(result.rows[0]) : undefined;
  }

  async update(id: string, authorEmail: string, input: UpdateSubmissionInput): Promise<CommunitySubmission | undefined> {
    const current = await this.getById(id);
    if (!current || current.authorEmail !== authorEmail || !["draft", "pending", "changes_requested"].includes(current.status)) {
      return undefined;
    }
    const { submitMode, ...updates } = input;
    const nextStatus: SubmissionStatus = submitMode === "review" ? "pending" : submitMode === "draft" ? "draft" : current.status;
    const now = new Date().toISOString();
    const updated: CommunitySubmission = {
      ...current,
      ...updates,
      status: nextStatus,
      version: current.version + 1,
      updatedAt: now,
      moderationNote: nextStatus === "pending" ? undefined : current.moderationNote,
    };

    if (!this.pool) {
      this.saveMemoryRevision(current, authorEmail);
      this.submissions.set(id, updated);
      return updated;
    }

    await this.pool.query(
      `INSERT INTO submission_revisions (id, submission_id, version, editor_email, snapshot)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [randomUUID(), id, current.version, authorEmail, JSON.stringify(current)],
    );
    const result = await this.pool.query(
      `UPDATE community_submissions SET
         title = $3, summary = $4, content = $5, url = NULLIF($6, ''), category = NULLIF($7, ''),
         data_level = $8, community_id = NULLIF($9, '')::uuid, author_username = $10,
         author_afsc = $11, author_rank = $12, status = $13, version = version + 1,
         moderation_note = CASE WHEN $13 = 'pending' THEN NULL ELSE moderation_note END, updated_at = now()
       WHERE id = $1 AND author_email = $2
       RETURNING *, 0::int AS score, 0::int AS comment_count`,
      [
        id, authorEmail, updated.title, updated.summary, updated.content, updated.url, updated.category,
        updated.dataLevel, updated.communityId, updated.authorUsername, updated.authorAfsc,
        updated.authorRank, nextStatus,
      ],
    );
    return result.rowCount ? rowToSubmission(result.rows[0]) : undefined;
  }

  async listRevisions(id: string): Promise<SubmissionRevision[]> {
    if (!this.pool) return this.revisions.get(id) ?? [];
    const result = await this.pool.query(
      "SELECT * FROM submission_revisions WHERE submission_id = $1 ORDER BY version DESC",
      [id],
    );
    return result.rows.map((row) => ({
      id: String(row.id),
      submissionId: String(row.submission_id),
      version: Number(row.version),
      editorEmail: String(row.editor_email),
      snapshot: row.snapshot as CommunitySubmission,
      createdAt: new Date(String(row.created_at)).toISOString(),
    }));
  }

  async listFeed(kind: SubmissionKind, sort: FeedSort, communityId?: string): Promise<CommunitySubmission[]> {
    if (!this.pool) {
      const items = [...this.submissions.values()].filter(
        (item) => item.kind === kind && item.status === "approved" && (!communityId || item.communityId === communityId),
      );
      return this.sort(items, sort);
    }

    const order =
      sort === "top"
        ? "score DESC, s.created_at DESC"
        : sort === "trending"
          ? "(score::float / POWER(GREATEST(EXTRACT(EPOCH FROM (now() - s.created_at)) / 3600, 2), 0.65)) DESC"
          : "s.created_at DESC";
    const result = await this.pool.query(
      `${selectWithCounts}
       WHERE s.kind = $1 AND s.status = 'approved' AND ($2::uuid IS NULL OR s.community_id = $2::uuid)
       ORDER BY ${order}`,
      [kind, communityId || null],
    );
    return result.rows.map(rowToSubmission);
  }

  async searchApproved(query: string): Promise<CommunitySubmission[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    if (!this.pool) {
      return [...this.submissions.values()]
        .filter((item) => item.status === "approved" &&
          [item.title, item.summary, item.content, item.category].join(" ").toLowerCase().includes(normalized))
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    }
    const result = await this.pool.query(
      `${selectWithCounts}
       WHERE s.status = 'approved'
         AND to_tsvector('english', concat_ws(' ', s.title, s.summary, s.content, s.category))
           @@ websearch_to_tsquery('english', $1)
       ORDER BY score DESC, s.created_at DESC LIMIT 50`,
      [query],
    );
    return result.rows.map(rowToSubmission);
  }

  async listByAuthor(authorEmail: string): Promise<CommunitySubmission[]> {
    if (!this.pool) {
      return [...this.submissions.values()]
        .filter((item) => item.authorEmail === authorEmail)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    const result = await this.pool.query(
      `${selectWithCounts} WHERE s.author_email = $1 ORDER BY s.updated_at DESC`,
      [authorEmail],
    );
    return result.rows.map(rowToSubmission);
  }

  async listForModeration(status: SubmissionStatus): Promise<CommunitySubmission[]> {
    if (!this.pool) {
      return [...this.submissions.values()]
        .filter((item) => item.status === status)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    const result = await this.pool.query(
      `${selectWithCounts} WHERE s.status = $1 ORDER BY s.created_at ASC`,
      [status],
    );
    return result.rows.map(rowToSubmission);
  }

  async moderate(
    id: string,
    status: "approved" | "rejected" | "changes_requested" | "removed",
    moderatorEmail: string,
    note: string,
    assignedModeratorEmail?: string,
  ): Promise<CommunitySubmission | undefined> {
    if (!this.pool) {
      const current = this.submissions.get(id);
      if (!current) return undefined;
      const updated: CommunitySubmission = {
        ...current,
        status,
        moderatorEmail,
        assignedModeratorEmail: assignedModeratorEmail ?? current.assignedModeratorEmail,
        moderationNote: note,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.submissions.set(id, updated);
      return updated;
    }
    const result = await this.pool.query(
      `UPDATE community_submissions
       SET status = $2, moderator_email = $3, moderation_note = $4,
         assigned_moderator_email = COALESCE($5, assigned_moderator_email), reviewed_at = now(), updated_at = now()
       WHERE id = $1
       RETURNING *, 0::int AS score, 0::int AS comment_count`,
      [id, status, moderatorEmail, note, assignedModeratorEmail ?? null],
    );
    return result.rowCount ? rowToSubmission(result.rows[0]) : undefined;
  }

  async vote(id: string, voterEmail: string, value: number): Promise<number | undefined> {
    if (!this.pool) {
      const submission = this.submissions.get(id);
      if (!submission || submission.status !== "approved") return undefined;
      const key = `${id}:${voterEmail}`;
      if (value === 0) this.votes.delete(key);
      else this.votes.set(key, value);
      const score = [...this.votes.entries()]
        .filter(([voteKey]) => voteKey.startsWith(`${id}:`))
        .reduce((total, [, vote]) => total + vote, 0);
      this.submissions.set(id, { ...submission, score });
      return score;
    }
    const exists = await this.pool.query(
      "SELECT 1 FROM community_submissions WHERE id = $1 AND status = 'approved'",
      [id],
    );
    if (!exists.rowCount) return undefined;
    if (value === 0) {
      await this.pool.query("DELETE FROM community_votes WHERE submission_id = $1 AND voter_email = $2", [id, voterEmail]);
    } else {
      await this.pool.query(
        `INSERT INTO community_votes (submission_id, voter_email, value)
         VALUES ($1, $2, $3)
         ON CONFLICT (submission_id, voter_email) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [id, voterEmail, value],
      );
    }
    const result = await this.pool.query(
      "SELECT COALESCE(SUM(value), 0)::int AS score FROM community_votes WHERE submission_id = $1",
      [id],
    );
    return Number(result.rows[0].score);
  }

  async addComment(
    submissionId: string,
    authorEmail: string,
    input: z.infer<typeof CreateCommentSchema>,
  ): Promise<CommunityComment | undefined> {
    const comment: CommunityComment = {
      id: randomUUID(),
      submissionId,
      authorEmail,
      ...input,
      createdAt: new Date().toISOString(),
    };
    if (!this.pool) {
      const submission = this.submissions.get(submissionId);
      if (!submission || submission.status !== "approved") return undefined;
      const current = this.comments.get(submissionId) ?? [];
      this.comments.set(submissionId, [...current, comment]);
      this.submissions.set(submissionId, { ...submission, commentCount: current.length + 1 });
      return comment;
    }
    const result = await this.pool.query(
      `INSERT INTO community_comments
        (id, submission_id, author_email, author_username, author_afsc, author_rank, body)
       SELECT $1, id, $3, $4, $5, $6, $7
       FROM community_submissions WHERE id = $2 AND status = 'approved'
       RETURNING *`,
      [
        comment.id, submissionId, authorEmail, input.authorUsername, input.authorAfsc,
        input.authorRank, input.body,
      ],
    );
    if (!result.rowCount) return undefined;
    return { ...comment, createdAt: new Date(result.rows[0].created_at).toISOString() };
  }

  async listComments(submissionId: string): Promise<CommunityComment[]> {
    if (!this.pool) return this.comments.get(submissionId) ?? [];
    const result = await this.pool.query(
      "SELECT * FROM community_comments WHERE submission_id = $1 ORDER BY created_at ASC",
      [submissionId],
    );
    return result.rows.map((row) => ({
      id: String(row.id),
      submissionId: String(row.submission_id),
      body: String(row.body),
      authorEmail: String(row.author_email),
      authorUsername: String(row.author_username),
      authorAfsc: String(row.author_afsc),
      authorRank: String(row.author_rank),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  private saveMemoryRevision(submission: CommunitySubmission, editorEmail: string): void {
    const current = this.revisions.get(submission.id) ?? [];
    this.revisions.set(submission.id, [{
      id: randomUUID(),
      submissionId: submission.id,
      version: submission.version,
      editorEmail,
      snapshot: submission,
      createdAt: new Date().toISOString(),
    }, ...current]);
  }

  private sort(items: CommunitySubmission[], sort: FeedSort): CommunitySubmission[] {
    if (sort === "top") return items.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
    if (sort === "trending") return items.sort((a, b) => this.trendingScore(b) - this.trendingScore(a));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private trendingScore(item: CommunitySubmission): number {
    const ageHours = Math.max(2, (Date.now() - new Date(item.createdAt).getTime()) / 3_600_000);
    return item.score / Math.pow(ageHours, 0.65);
  }
}
