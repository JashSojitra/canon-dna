/**
 * Viewport, keyboard and motion checks (qa-checklist §13–15). Runs on every project in playwright.config.ts.
 * STATUS: prepared and never executed. It depends on the proposed test IDs in ./selectors.ts.
 */
import { expect, test } from "@playwright/test";
import { applyLabChange, expectNoHorizontalOverflow, reachLecturePreview, shot } from "./helpers";
import { tid, viewTiles } from "./selectors";

test("no horizontal overflow across the demo stages", async ({ page }, testInfo) => {
  await page.goto("/");
  await expectNoHorizontalOverflow(page, "library");
  await shot(page, testInfo, "r-library");

  await reachLecturePreview(page);
  await expectNoHorizontalOverflow(page, "preview-lecture");
  await page.getByTestId(tid.roleSwitch("student")).click();
  await expect(viewTiles(page)).toHaveCount(3);
  await shot(page, testInfo, "r-preview-lecture");

  await applyLabChange(page);
  await expectNoHorizontalOverflow(page, "preview-laboratory");
  await shot(page, testInfo, "r-preview-laboratory");

  await page.getByTestId(tid.xrayToggle).click();
  await page.getByTestId(tid.xrayTarget("workbench-view")).click();
  await expect(page.getByTestId(tid.inspector)).toBeInViewport();
  await expectNoHorizontalOverflow(page, "xray-inspector");
  await page.keyboard.press("Escape");

  await page.getByTestId(tid.stageNav("blueprint")).click();
  await expectNoHorizontalOverflow(page, "blueprint");
  await shot(page, testInfo, "r-blueprint");
});

test("touch targets on primary demo controls are at least 44×44 on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only check");
  await reachLecturePreview(page);
  await page.getByTestId(tid.roleSwitch("student")).click();
  const targets = [
    page.getByTestId(tid.roleSwitch("student")),
    page.getByTestId(tid.viewTile("professor")),
    page.getByTestId(tid.viewTile("whiteboard")),
    page.getByTestId(tid.viewTile("slides")),
    page.getByTestId(tid.xrayToggle),
  ];
  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box, "control should be rendered").not.toBeNull();
    expect(Math.round(box!.width)).toBeGreaterThanOrEqual(44);
    expect(Math.round(box!.height)).toBeGreaterThanOrEqual(44);
  }
});

test("Library → Extraction is keyboard operable", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard check on desktop projects");
  await page.goto("/");
  const analyze = page.getByTestId(tid.analyzeButton("classroom"));
  // Tab until the Analyze control has focus (bounded, so it can't loop forever).
  for (let i = 0; i < 40 && !(await analyze.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(analyze).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId(tid.graphNode("source-selector"))).toBeVisible();
});

test("reduced motion: state changes are immediate and complete", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("reduced-motion"), "reduced-motion project only");
  await reachLecturePreview(page);
  await page.getByTestId(tid.roleSwitch("student")).click();
  await applyLabChange(page);
  // With reduced motion the fourth tile must be present without waiting on a long animation.
  await expect(viewTiles(page)).toHaveCount(4, { timeout: 1_000 });
  const longAnimations = await page.evaluate(() =>
    document.getAnimations().filter((a) => {
      const timing = a.effect?.getComputedTiming();
      return typeof timing?.duration === "number" && timing.duration > 350;
    }).length,
  );
  expect(longAnimations, "animations longer than 350ms under reduced motion").toBe(0);
});
