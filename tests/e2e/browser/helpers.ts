import { expect, type Page, type TestInfo } from "@playwright/test";
import { labPrompt, lecturePrompt } from "../../../src/data/demo-prompts";
import { tid } from "./selectors";

export { labPrompt, lecturePrompt };

/**
 * Collects console errors / page errors and aborts every non-same-origin request,
 * proving the demo needs no network beyond the app server (no LLM, CDN, or external media).
 */
export async function guardPage(page: Page, baseURL: string) {
  const origin = new URL(baseURL).origin;
  const consoleErrors: string[] = [];
  const thirdParty: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(origin) || url.startsWith("data:") || url.startsWith("blob:")) return route.continue();
    thirdParty.push(url);
    return route.abort();
  });
  return {
    assertClean() {
      expect(consoleErrors, "console errors during demo path").toEqual([]);
      expect(thirdParty, "third-party requests during demo path").toEqual([]);
    },
  };
}

export async function shot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-${name}.png`), fullPage: false });
}

export async function expectNoHorizontalOverflow(page: Page, where: string) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.scrollingElement?.scrollWidth ?? document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, `horizontal overflow at ${where}`).toBeLessThanOrEqual(innerWidth);
}

/** Library → Analyze → Architect → Generate (lecture). Leaves the page in Preview, ready for role/view checks. */
export async function reachLecturePreview(page: Page) {
  await page.goto("/");
  await page.getByTestId(tid.analyzeButton("classroom")).click();
  await expect(page.getByTestId(tid.graphNode("source-selector"))).toBeVisible();
  await page.getByTestId(tid.stageNav("architect")).click();
  await expect(page.getByTestId(tid.requirementInput)).toHaveValue(new RegExp(`^\\s*${escapeRegex(lecturePrompt)}\\s*$`, "i"));
  await page.getByTestId(tid.generateButton).click();
  await expect(page.getByTestId(tid.reuseDecision("source-selector"))).toBeVisible();
  await page.getByTestId(tid.stageNav("preview")).click();
}

export async function applyLabChange(page: Page) {
  const input = page.getByTestId(tid.changeInput);
  if ((await input.inputValue()).trim().toLowerCase() !== labPrompt.toLowerCase()) await input.fill(labPrompt);
  await page.getByTestId(tid.applyChangeButton).click();
  // Whether the UI auto-switches to Laboratory is undecided, so select it explicitly (harmless if already active).
  await switchMode(page, "laboratory");
  await expect(page.getByTestId(tid.viewTile("workbench"))).toBeVisible();
}

/**
 * `switch-mode` is a PROFESSOR permission in the contract. Students can't switch modes, so we
 * switch as Professor and return to Student. OPEN QUESTION for UI: is there a separate
 * operator-level mode control outside the role preview? If so, use it here instead.
 */
export async function switchMode(page: Page, mode: "lecture" | "laboratory") {
  await page.getByTestId(tid.roleSwitch("professor")).click();
  await page.getByTestId(tid.modeSwitch(mode)).click();
  await page.getByTestId(tid.roleSwitch("student")).click();
}

export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
