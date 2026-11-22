import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, guardPage, shot } from "./helpers";

test("overview explains the workflow and derives the 3-to-4 view transformation", async ({ page, baseURL }, testInfo) => {
  const guard = await guardPage(page, baseURL ?? "http://localhost:3000");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Don’t start from zero.Start from everything you’ve built.");
  const illustration = page.getByRole("region", { name: "Interactive illustrative preview" });
  await expect(illustration).toContainText("1 physical camera");
  await expect(illustration).toContainText("3 selectable views");
  await expect(page.locator('[data-testid^="hero-view-"]')).toHaveCount(3);
  await illustration.getByRole("button", { name: "Laboratory" }).click();
  await expect(illustration).toContainText("2 physical cameras");
  await expect(illustration).toContainText("4 selectable views");
  await page.getByTestId("hero-view-workbench").click();
  await expect(page.getByTestId("hero-view-workbench")).toHaveAttribute("aria-pressed", "true");
  await expectNoHorizontalOverflow(page, "overview-laboratory");
  await shot(page, testInfo, "overview-laboratory");
  await illustration.getByRole("button", { name: "Lecture", exact: true }).click();
  await expect(page.getByTestId("hero-view-workbench")).toHaveCount(0);
  await expect(page.getByTestId("hero-view-professor")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Launch studio" }).first().click();
  await expect(page).toHaveURL(/\/studio$/);
  await page.reload();
  await expect(page.getByTestId("library-sample-classroom")).toBeVisible();
  await page.getByRole("link", { name: "Back to overview" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Don’t start from zero.Start from everything you’ve built.");
  guard.assertClean();
});
