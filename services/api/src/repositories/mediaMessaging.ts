import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { z } from "zod";

const PlaybackUrlSchema = z.union([
  z.string().url().max(1000),
  z.string().regex(/^\/api\/media\/[a-f0-9-]+\.(mp4|webm)$/i).max(1000),
]);

export const LearningAssetSchema = z.object({
  id: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(1000),
  durationSeconds: z.number().int().min(0).max(86400).default(0),
  audience: z.string().trim().max(160).optional().default(""),
  afscTags: z.array(z.string().trim().min(1).max(20)).max(30).optional().default([]),
  rankTags: z.array(z.string().trim().min(1).max(20)).max(30).optional().default([]),
  playbackUrl: PlaybackUrlSchema,
  thumbnailUrl: z.string().url().max(1000).optional().or(z.literal("")),
  captionUrl: z.string().max(1000).optional().default(""),
  transcript: z.string().trim().max(100000).optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  dataLevel: z.enum(["public", "official-use", "cui", "il4", "il5"]).default("public"),
});

export const UpdateLearningAssetSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  summary: z.string().trim().min(10).max(1000).optional(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  audience: z.string().trim().max(160).optional(),
  afscTags: z.array(z.string().trim().min(1).max(20)).max(30).optional(),
  rankTags: z.array(z.string().trim().min(1).max(20)).max(30).optional(),
  playbackUrl: PlaybackUrlSchema.optional(),
  thumbnailUrl: z.string().url().max(1000).optional().or(z.literal("")),
  captionUrl: z.string().max(1000).optional(),
  transcript: z.string().trim().max(100000).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  dataLevel: z.enum(["public", "official-use", "cui", "il4", "il5"]).optional(),
});

export const SendMessageSchema = z.object({
  recipientEmail: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  body: z.string().trim().min(1).max(4000),
});

export type LearningAsset = z.infer<typeof LearningAssetSchema> & {
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

export class MediaMessagingRepository {
  private readonly assets = new Map<string, LearningAsset>();
  private readonly messages: DirectMessage[] = [];

  constructor(private readonly pool?: Pool) {}

  async listAssets(includeUnpublished = false): Promise<LearningAsset[]> {
    if (!this.pool) {
      return [...this.assets.values()]
        .filter((asset) => includeUnpublished || asset.status === "published")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    const result = await this.pool.query(
      `SELECT * FROM learning_assets
       WHERE $1::boolean OR status = 'published'
       ORDER BY updated_at DESC`,
      [includeUnpublished],
    );
    return result.rows.map((row) => this.rowToAsset(row));
  }

  async createAsset(input: z.infer<typeof LearningAssetSchema>, actorEmail: string): Promise<LearningAsset> {
    const now = new Date().toISOString();
    const asset: LearningAsset = { ...input, createdByEmail: actorEmail, createdAt: now, updatedAt: now };
    if (!this.pool) {
      if (this.assets.has(asset.id)) throw new Error("learning_asset_exists");
      this.assets.set(asset.id, asset);
      return asset;
    }
    const result = await this.pool.query(
      `INSERT INTO learning_assets
        (id, title, summary, duration_seconds, audience, afsc_tags, rank_tags, playback_url,
         thumbnail_url, caption_url, transcript, status, data_level, created_by_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULLIF($9, ''), NULLIF($10, ''), $11, $12, $13, $14)
       RETURNING *`,
      [
        input.id, input.title, input.summary, input.durationSeconds, input.audience, input.afscTags,
        input.rankTags, input.playbackUrl, input.thumbnailUrl, input.captionUrl, input.transcript,
        input.status, input.dataLevel, actorEmail,
      ],
    );
    return this.rowToAsset(result.rows[0]);
  }

  async updateAsset(
    id: string,
    input: z.infer<typeof UpdateLearningAssetSchema>,
  ): Promise<LearningAsset | undefined> {
    if (!this.pool) {
      const current = this.assets.get(id);
      if (!current) return undefined;
      const updated = { ...current, ...input, updatedAt: new Date().toISOString() };
      this.assets.set(id, updated);
      return updated;
    }
    const currentResult = await this.pool.query("SELECT * FROM learning_assets WHERE id = $1", [id]);
    if (!currentResult.rowCount) return undefined;
    const current = this.rowToAsset(currentResult.rows[0]);
    const next = { ...current, ...input };
    const result = await this.pool.query(
      `UPDATE learning_assets SET
         title = $2, summary = $3, duration_seconds = $4, audience = $5, afsc_tags = $6,
         rank_tags = $7, playback_url = $8, thumbnail_url = NULLIF($9, ''), caption_url = NULLIF($10, ''),
         transcript = $11, status = $12, data_level = $13, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        id, next.title, next.summary, next.durationSeconds, next.audience, next.afscTags,
        next.rankTags, next.playbackUrl, next.thumbnailUrl, next.captionUrl, next.transcript,
        next.status, next.dataLevel,
      ],
    );
    return this.rowToAsset(result.rows[0]);
  }

  async sendMessage(senderEmail: string, input: z.infer<typeof SendMessageSchema>): Promise<DirectMessage> {
    const message: DirectMessage = {
      id: randomUUID(),
      senderEmail,
      recipientEmail: input.recipientEmail,
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    if (!this.pool) {
      this.messages.push(message);
      return message;
    }
    const result = await this.pool.query(
      `INSERT INTO direct_messages (id, sender_email, recipient_email, body)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [message.id, senderEmail, input.recipientEmail, input.body],
    );
    return this.rowToMessage(result.rows[0]);
  }

  async listMessages(userEmail: string, participantEmail: string): Promise<DirectMessage[]> {
    const participant = participantEmail.toLowerCase();
    if (!this.pool) {
      const items = this.messages.filter(
        (message) =>
          (message.senderEmail === userEmail && message.recipientEmail === participant) ||
          (message.senderEmail === participant && message.recipientEmail === userEmail),
      );
      for (const message of items) {
        if (message.recipientEmail === userEmail && !message.readAt) message.readAt = new Date().toISOString();
      }
      return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    await this.pool.query(
      `UPDATE direct_messages SET read_at = now()
       WHERE recipient_email = $1 AND sender_email = $2 AND read_at IS NULL AND removed_at IS NULL`,
      [userEmail, participant],
    );
    const result = await this.pool.query(
      `SELECT * FROM direct_messages
       WHERE removed_at IS NULL AND
         ((sender_email = $1 AND recipient_email = $2) OR (sender_email = $2 AND recipient_email = $1))
       ORDER BY created_at ASC LIMIT 500`,
      [userEmail, participant],
    );
    return result.rows.map((row) => this.rowToMessage(row));
  }

  async listConversations(userEmail: string): Promise<ConversationSummary[]> {
    if (!this.pool) {
      const summaries = new Map<string, ConversationSummary>();
      for (const message of this.messages.filter((item) => item.senderEmail === userEmail || item.recipientEmail === userEmail)) {
        const participantEmail = message.senderEmail === userEmail ? message.recipientEmail : message.senderEmail;
        const current = summaries.get(participantEmail);
        if (!current || message.createdAt > current.lastMessageAt) {
          summaries.set(participantEmail, {
            participantEmail,
            lastMessage: message.body,
            lastMessageAt: message.createdAt,
            unreadCount: 0,
          });
        }
        if (message.recipientEmail === userEmail && !message.readAt) {
          const summary = summaries.get(participantEmail);
          if (summary) summary.unreadCount += 1;
        }
      }
      return [...summaries.values()].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    }
    const result = await this.pool.query(
      `WITH scoped AS (
         SELECT *,
           CASE WHEN sender_email = $1 THEN recipient_email ELSE sender_email END AS participant_email
         FROM direct_messages
         WHERE removed_at IS NULL AND (sender_email = $1 OR recipient_email = $1)
       ), ranked AS (
         SELECT *, ROW_NUMBER() OVER (PARTITION BY participant_email ORDER BY created_at DESC) AS position
         FROM scoped
       )
       SELECT participant_email,
         MAX(CASE WHEN position = 1 THEN body END) AS last_message,
         MAX(created_at) AS last_message_at,
         COUNT(*) FILTER (WHERE recipient_email = $1 AND read_at IS NULL)::int AS unread_count
       FROM ranked GROUP BY participant_email ORDER BY last_message_at DESC`,
      [userEmail],
    );
    return result.rows.map((row) => ({
      participantEmail: String(row.participant_email),
      lastMessage: String(row.last_message),
      lastMessageAt: new Date(String(row.last_message_at)).toISOString(),
      unreadCount: Number(row.unread_count),
    }));
  }

  private rowToAsset(row: Record<string, unknown>): LearningAsset {
    return {
      id: String(row.id),
      title: String(row.title),
      summary: String(row.summary),
      durationSeconds: Number(row.duration_seconds),
      audience: String(row.audience ?? ""),
      afscTags: (row.afsc_tags ?? []) as string[],
      rankTags: (row.rank_tags ?? []) as string[],
      playbackUrl: String(row.playback_url),
      thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : "",
      captionUrl: row.caption_url ? String(row.caption_url) : "",
      transcript: String(row.transcript ?? ""),
      status: LearningAssetSchema.shape.status.parse(row.status),
      dataLevel: LearningAssetSchema.shape.dataLevel.parse(row.data_level),
      createdByEmail: String(row.created_by_email),
      createdAt: new Date(String(row.created_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString(),
    };
  }

  private rowToMessage(row: Record<string, unknown>): DirectMessage {
    return {
      id: String(row.id),
      senderEmail: String(row.sender_email),
      recipientEmail: String(row.recipient_email),
      body: String(row.body),
      createdAt: new Date(String(row.created_at)).toISOString(),
      readAt: row.read_at ? new Date(String(row.read_at)).toISOString() : undefined,
    };
  }
}
