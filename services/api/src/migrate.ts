import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

const migrationsDirectory = fileURLToPath(new URL("../migrations", import.meta.url));

export async function runMigrations(pool: Pool | undefined): Promise<void> {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const name of files) {
    const applied = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name]);
    if (applied.rowCount) continue;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(await readFile(`${migrationsDirectory}/${name}`, "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
