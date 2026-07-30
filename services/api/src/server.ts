import { readConfig } from "./config.js";
import { createApiApp } from "./app.js";
import { runMigrations } from "./migrate.js";

const config = readConfig();
const { app, database } = await createApiApp(config);
await runMigrations(database.pool);

const shutdown = async () => {
  await app.close();
  await database.close();
};

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

await app.listen({
  host: config.host,
  port: config.port,
});
