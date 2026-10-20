import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "NEXT_PUBLIC_APP_MODE=static npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/tools",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
