import { Pool } from "pg";
import type { ApiConfig } from "./config.js";

export type Database = {
  pool?: Pool;
  close(): Promise<void>;
};

export function createDatabase(config: ApiConfig): Database {
  if (!config.databaseUrl) {
    return {
      async close() {
        return undefined;
      },
    };
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
  });

  return {
    pool,
    async close() {
      await pool.end();
    },
  };
}
