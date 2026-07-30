import crypto from "node:crypto";
import type { Pool } from "pg";
import { z } from "zod";

export const ToolSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().min(10).max(2000),
  dataLevel: z.enum(["public", "official-use", "cui", "il4", "il5", "tbd"]),
  submittedByEmail: z.string().trim().email().optional(),
  submittedByAfsc: z.string().trim().max(16).optional(),
  submittedByRank: z.string().trim().max(32).optional(),
});

export type ToolSubmissionInput = z.infer<typeof ToolSubmissionSchema>;

export type ToolSubmission = ToolSubmissionInput & {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export class ToolSubmissionRepository {
  private readonly memory: ToolSubmission[] = [];

  constructor(private readonly pool?: Pool) {}

  async create(input: ToolSubmissionInput): Promise<ToolSubmission> {
    const submission: ToolSubmission = {
      ...input,
      url: input.url || undefined,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (!this.pool) {
      this.memory.unshift(submission);
      return submission;
    }

    await this.pool.query(
      `INSERT INTO tool_submissions (
        id,
        name,
        url,
        description,
        data_level,
        submitted_by_email,
        submitted_by_afsc,
        submitted_by_rank,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        submission.id,
        submission.name,
        submission.url ?? null,
        submission.description,
        submission.dataLevel,
        submission.submittedByEmail ?? null,
        submission.submittedByAfsc ?? null,
        submission.submittedByRank ?? null,
        submission.status,
        submission.createdAt,
      ],
    );

    return submission;
  }

  async listPending(): Promise<ToolSubmission[]> {
    if (!this.pool) return this.memory.filter((submission) => submission.status === "pending");

    const result = await this.pool.query<{
      id: string;
      name: string;
      url: string | null;
      description: string;
      data_level: ToolSubmission["dataLevel"];
      submitted_by_email: string | null;
      submitted_by_afsc: string | null;
      submitted_by_rank: string | null;
      status: ToolSubmission["status"];
      created_at: Date;
    }>(
      `SELECT id, name, url, description, data_level, submitted_by_email, submitted_by_afsc, submitted_by_rank, status, created_at
       FROM tool_submissions
       WHERE status = 'pending'
       ORDER BY created_at DESC
       LIMIT 100`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url ?? undefined,
      description: row.description,
      dataLevel: row.data_level,
      submittedByEmail: row.submitted_by_email ?? undefined,
      submittedByAfsc: row.submitted_by_afsc ?? undefined,
      submittedByRank: row.submitted_by_rank ?? undefined,
      status: row.status,
      createdAt: row.created_at.toISOString(),
    }));
  }
}
