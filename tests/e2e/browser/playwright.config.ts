/**
 * Playwright config for the Canon DNA demo path (QA-owned).
 *
 * Runs against a production build. Playwright must be available to the runner.
 * Playwright isn't a repo dependency. Install it temporarily without touching
 * package.json or the lockfile; see tests/e2e/README.md.
 *
 * Specs are named *.e2e.ts so the repo's Vitest (default *.test/*.spec pattern) never picks them up.
 */
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const here = __dirname;
const repoRoot = path.resolve(here, "../../..");
const baseURL = process.env.CANON_DNA_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: here,
  testMatch: "**/*.e2e.ts",
  outputDir: path.join(here, "../.artifacts/results"),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { outputFolder: path.join(here, "../.artifacts/report"), open: "never" }]],
  use: {
    baseURL,
    launchOptions: process.env.CANON_CHROMIUM_PATH ? { executablePath: process.env.CANON_CHROMIUM_PATH } : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Fresh context per test means empty localStorage: the demo must not depend on prior state.
    storageState: undefined,
  },
  // With no CANON_DNA_URL, serve a production build of the integrated repo (run `npm run build` first).
  webServer: process.env.CANON_DNA_URL
    ? undefined
    : { command: "npm run start", cwd: repoRoot, url: baseURL, reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "projector-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "projector-1440-reduced-motion",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: "reduce" } },
    },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, hasTouch: true } },
    {
      name: "mobile-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
});
