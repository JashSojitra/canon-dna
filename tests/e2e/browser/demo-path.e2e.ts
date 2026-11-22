/**
 * Full Sunday demo path, from clean storage, mirroring docs/pitch-outline.md and docs/qa-checklist.md.
 * Targets the guided /studio UI and its stable DOM hooks.
 */
import { laboratoryApp } from "../../../src/data/demo-apps";
import { expect, test } from "@playwright/test";
import { applyLabChange, guardPage, reachLecturePreview, shot, switchMode } from "./helpers";
import { tid, viewTiles } from "./selectors";

test.describe.configure({ mode: "serial" });

test.describe("Demo path @projector", () => {

  test("Library → Extraction → Architect → 3 views → Lab 4 views → Lecture preserved → Diff → X-Ray → Blueprint → Approve → Reload", async ({ page, baseURL }, testInfo) => {
    const guard = await guardPage(page, baseURL ?? "http://localhost:3000");

    // A · Library (checklist 1.x)
    await page.goto("/studio");
    await expect(page.getByTestId(tid.sampleCard("classroom"))).toContainText(/team-created|sample/i);
    await expect(page.getByTestId(tid.sampleCard("remote-training"))).toContainText(/team-created|sample/i);
    await expect(page.getByTestId(tid.appSubtitle)).toContainText("Independent hackathon concept for Canon AMLOS");
    await expect(page.getByTestId(tid.recipeCard("recipe-university-classroom"))).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/canon customer (code|repositor)/i);
    await shot(page, testInfo, "01-library");

    // B · Extraction (2.x): exactly the manifest nodes and their real paths
    await page.getByTestId(tid.analyzeButton("classroom")).click();
    await expect(page.locator('[data-testid^="dna-node-"]')).toHaveCount(laboratoryApp.lineage.length);
    await expect(page.getByTestId(tid.graphEdge("classroom-preview", "source-selector"))).toBeAttached();
    await page.getByTestId(tid.graphNode("source-selector")).click();
    await expect(page.getByTestId(tid.inspectorSourcePath)).toHaveText("src/sample-apps/classroom/SourceSelector.tsx");
    await shot(page, testInfo, "02-extraction");
    await page.getByTestId(tid.graphNode("classroom-preview")).click();
    await expect(page.getByTestId(tid.inspectorSourcePath)).toHaveText("src/sample-apps/classroom/Classroom.tsx");

    // C · Architect (3.x): reachLecturePreview re-does A–B idempotently, then generates.
    await reachLecturePreview(page);
    await page.getByTestId(tid.stageNav("architect")).click();
    await expect(page.getByTestId(tid.interpretationBadge)).toContainText(/rules|demo/i);
    await expect(page.getByTestId(tid.interpretationBadge)).not.toContainText(/\bLLM\b|GPT|Claude/i);
    await expect(page.getByTestId(tid.reuseDecision("source-selector"))).toContainText(/reuse/i);
    await expect(page.getByTestId(tid.reuseDecision("classroom-preview"))).toContainText(/adapt/i);
    await shot(page, testInfo, "03-architect");

    // D · Three-view preview (4.x)
    await page.getByTestId(tid.stageNav("preview")).click();
    await page.getByTestId(tid.roleSwitch("student")).click();
    await expect(viewTiles(page)).toHaveCount(3);
    for (const id of ["professor", "whiteboard", "slides"]) {
      const tile = page.getByTestId(tid.viewTile(id));
      await tile.click();
      await expect(tile).toHaveAttribute("aria-pressed", "true");
    }
    await expect(page.getByTestId(tid.ptzControl)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /\bptz\b|pan|tilt/i })).toHaveCount(0);
    await expect(page.locator("body")).toContainText(/simulated/i);
    await shot(page, testInfo, "04-preview-lecture-student");

    // Professor sees PTZ (4.7)
    await page.getByTestId(tid.roleSwitch("professor")).click();
    await expect(page.getByTestId(tid.ptzControl)).toBeVisible();
    await page.getByTestId(tid.roleSwitch("student")).click();

    // D · Lab update → 4 views (5.x, 6.x)
    await applyLabChange(page);
    await expect(viewTiles(page)).toHaveCount(4);
    await page.getByTestId(tid.viewTile("workbench")).click();
    await expect(page.getByTestId(tid.viewTile("workbench"))).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId(tid.ptzControl)).toHaveCount(0);
    await shot(page, testInfo, "05-preview-laboratory");

    // Double apply is idempotent (5.5)
    if (await page.getByTestId(tid.applyChangeButton).isEnabled()) {
      await page.getByTestId(tid.applyChangeButton).click();
      await expect(viewTiles(page)).toHaveCount(4);
    }

    // Lecture preserved (7.x)
    await switchMode(page, "lecture");
    await expect(viewTiles(page)).toHaveCount(3);
    await expect(page.getByTestId(tid.viewTile("workbench"))).toHaveCount(0);
    await switchMode(page, "laboratory");
    await expect(viewTiles(page)).toHaveCount(4);

    // Before/After diff from real configs (8.x)
    await page.getByTestId(tid.beforeAfterToggle).click();
    const diff = page.getByTestId(tid.diffList);
    await expect(diff).toBeVisible();
    for (const [entity, id] of [["source", "workbench-camera"], ["source", "workbench"], ["mode", "laboratory"]]) {
      await expect(page.getByTestId(tid.diffEntry(entity, id))).toHaveAttribute("data-change", "added");
    }
    await expect(page.getByTestId(tid.diffEntry("mode", "lecture"))).toHaveAttribute("data-change", "preserved");
    await shot(page, testInfo, "06-before-after");
    await page.getByRole("button", { name: "After / Updated", exact: true }).click();
    await expect(viewTiles(page)).toHaveCount(4); // toggling must not mutate the after config (8.5)

    // DNA X-Ray (9.x)
    await page.getByTestId(tid.xrayToggle).click();
    await page.getByTestId(tid.xrayTarget("source-selector")).click();
    const inspector = page.getByTestId(tid.inspector);
    await expect(inspector).toContainText(/reuse/i);
    await expect(inspector).toContainText("src/sample-apps/classroom/SourceSelector.tsx");
    await page.getByTestId(tid.xrayTarget("workbench-view")).click();
    await expect(inspector).toContainText(/new/i);
    await expect(inspector).toContainText(/camera placement|coverage/i);
    await expect(inspector.locator("code")).not.toContainText("src/sample-apps/");
    await shot(page, testInfo, "07-xray");
    await expect(page.locator('[data-testid^="xray-target-"]')).toHaveCount(laboratoryApp.lineage.length); // matches validated fixture lineage
    await page.keyboard.press("Escape");
    await expect(page.getByTestId(tid.xrayTarget("source-selector"))).toBeHidden();

    // E · Blueprint (10.x)
    await page.getByTestId(tid.stageNav("blueprint")).click();
    for (const layer of ["Camera", "Hub", "Edge"] as const) {
      const mapping = page.getByTestId(tid.sdkMapping(layer));
      await expect(mapping).toContainText(/proposed/i);
      await expect(mapping).toContainText(/unverified|verification required|not verified/i);
    }
    await expect(page.getByTestId(tid.signoffChecklist)).toBeVisible();
    await expect(page.getByTestId(tid.approvalState)).toContainText(/draft/i);
    await shot(page, testInfo, "08-blueprint");

    // Approval + persistence (11.x, 12.x)
    await page.getByRole("textbox", { name: "Reviewing engineer" }).fill("Demo Engineer");
    for (const checkbox of await page.getByTestId(tid.signoffChecklist).getByRole("checkbox").all()) await checkbox.check();
    await page.getByTestId(tid.approveButton).click();
    await page.getByTestId(tid.stageNav("library")).click();
    await expect(page.getByTestId(tid.recipeCard("recipe-university-classroom"))).toBeVisible();
    await page.reload();
    await expect(page.getByTestId(tid.recipeCard("recipe-university-classroom"))).toBeVisible();
    await expect(page.getByTestId(tid.recipeCard("recipe-university-classroom"))).toHaveCount(1);
    await shot(page, testInfo, "09-library-after-reload");

    guard.assertClean();
  });

  test("a fresh context starts with no approved recipe (demo state reset)", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByTestId(tid.sampleCard("classroom"))).toBeVisible();
    await expect(page.getByTestId(tid.recipeCard("recipe-university-classroom"))).toHaveCount(0);
  });

  test("unsupported requirement text fails truthfully without crashing", async ({ page, baseURL }) => {
    const guard = await guardPage(page, baseURL ?? "http://localhost:3000");
    await page.goto("/studio");
    await page.getByTestId(tid.stageNav("architect")).click();
    await page.getByTestId(tid.requirementInput).fill("Build a hospital operating theatre viewer.");
    await page.getByTestId(tid.generateButton).click();
    await expect(page.getByTestId(tid.interpretationError)).toBeVisible();
    await expect(page.getByTestId(tid.reuseDecision("source-selector"))).toHaveCount(0);
    guard.assertClean();
  });

  test("corrupt persisted storage does not white-screen the Library", async ({ page }) => {
    await page.goto("/studio");
    await page.evaluate(() => localStorage.setItem("canon-dna.approved-recipes.v1", "{not json"));
    await page.reload();
    await expect(page.getByTestId(tid.sampleCard("classroom"))).toBeVisible();
    await expect(page.getByTestId(tid.interpretationError)).toContainText("Existing saved data has been preserved");
  });
});
