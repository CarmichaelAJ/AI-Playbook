import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const [mode, command] = process.argv.slice(2);

if (!["static", "platform"].includes(mode) || !["build", "dev"].includes(command)) {
  console.error("Usage: node scripts/run-next-mode.mjs <static|platform> <build|dev>");
  process.exit(1);
}

const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const result = spawnSync(process.execPath, [nextCli, command], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_MODE: mode,
  },
});

if (result.error) {
  console.error(result.error.message);
}

if (result.status === 0 && mode === "static" && command === "build") {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const outputRoot = resolve(projectRoot, "out");
  const platformRoutes = ["admin", "community", "messages", "moderation", "post", "profile", "submit"];

  for (const route of platformRoutes) {
    for (const relativeTarget of [route, `${route}.html`, `${route}.txt`]) {
      const target = resolve(outputRoot, relativeTarget);
      if (!target.startsWith(`${outputRoot}${sep}`)) {
        throw new Error(`Refusing to remove generated path outside out/: ${target}`);
      }
      rmSync(target, { recursive: true, force: true });
    }
  }
}

process.exit(result.status ?? 1);
