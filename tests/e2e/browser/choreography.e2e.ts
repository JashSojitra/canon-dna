import { expect, test } from "@playwright/test";
import { guardPage, reachLecturePreview } from "./helpers";

test("assembly presents computed facts and Skip opens the same valid design", async ({ page, baseURL }) => {
  const guard = await guardPage(page, baseURL!);
  await page.goto("/studio?stage=architect");
  await page.getByTestId("architect-generate").click();
  if (await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    await expect(page.getByTestId("generation-sequence")).toHaveCount(0);
  } else {
    const sequence = page.getByTestId("generation-sequence");
    await expect(sequence).toContainText("Results computed and validated");
    await expect(sequence).toContainText("NOT LIVE AI");
    await expect(page.getByTestId("architect-generate")).toBeDisabled();
    await expect(sequence.locator(".generation-acts>div[data-active=true]")).toHaveText(/Interpreting request/);
    await expect(sequence.locator(".generation-acts>div[data-active=true]")).toHaveText(/Finding reusable parts/);
    await expect(sequence.locator(".generation-facts")).toContainText("src/sample-apps/classroom/SourceSelector.tsx");
    await sequence.getByRole("button", { name: "Skip animation" }).click();
  }
  await expect(page.locator('[data-testid^="view-tile-"]')).toHaveCount(3);
  await expect(page.getByTestId("ptz-control")).toHaveCount(0);
  guard.assertClean();
});

test("lab insertion retains preview controls and Lecture restores three views", async ({ page }) => {
  await reachLecturePreview(page);
  await page.getByTestId("role-professor").click();
  await page.getByTestId("view-tile-whiteboard").click();
  await page.getByTestId("layout-toggle").click();
  await page.getByTestId("change-request-apply").click();
  await expect(page.getByTestId("role-professor")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("view-tile-whiteboard")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("layout-toggle")).toHaveText("Focus");
  await expect(page.locator('[data-testid^="view-tile-"]')).toHaveCount(4);
  await page.getByTestId("session-mode").selectOption("lecture");
  await expect(page.locator('[data-testid^="view-tile-"]')).toHaveCount(3);
});
