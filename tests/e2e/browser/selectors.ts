/**
 * PROPOSED data-testid contract for the studio UI. These IDs are UNCONFIRMED.
 *
 * The studio UI doesn't exist yet. QA proposes these IDs to Local Codex (via Jash)
 * so the browser specs can stay stable while visual copy changes. If the UI ships
 * different hooks, update ONLY this file; the specs import everything from here.
 *
 * Convention: kebab-case, entity IDs taken from the engine config (e.g. `view-tile-workbench`),
 * never from display copy.
 */
import type { Page } from "@playwright/test";

export const tid = {
  // Shell
  stageNav: (stage: "library" | "extraction" | "architect" | "preview" | "blueprint") => `stage-nav-${stage}`,
  appSubtitle: "app-subtitle",

  // A · Library
  sampleCard: (sampleId: string) => `library-sample-${sampleId}`, // classroom | remote-training
  analyzeButton: (sampleId: string) => `analyze-dna-${sampleId}`,
  recipeCard: (recipeId: string) => `library-recipe-${recipeId}`, // university-lab-recipe
  recipeList: "library-recipes",

  // B · Extraction
  graphNode: (componentId: string) => `dna-node-${componentId}`, // classroom-preview | source-selector
  graphEdge: (from: string, to: string) => `dna-edge-${from}--${to}`,
  inspector: "inspector-panel",
  inspectorSourcePath: "inspector-source-path",

  // C · Architect
  requirementInput: "architect-input",
  generateButton: "architect-generate",
  interpretationBadge: "interpretation-mode", // must expose rules-demo vs llm truthfully
  interpretationError: "architect-error",
  reuseDecision: (componentId: string) => `reuse-decision-${componentId}`, // contains REUSE/ADAPT/NEW text

  // D · Preview
  roleSwitch: (role: "professor" | "student") => `role-${role}`,
  modeSwitch: (mode: "lecture" | "laboratory") => `mode-${mode}`,
  viewTile: (sourceId: string) => `view-tile-${sourceId}`, // professor | whiteboard | slides | workbench
  viewTiles: "view-tile-", // prefix match
  layoutButton: "layout-toggle",
  fullscreenButton: "fullscreen-toggle",
  ptzControl: "ptz-control",
  changeInput: "change-request-input",
  applyChangeButton: "change-request-apply",
  beforeAfterToggle: "before-after-toggle",
  diffList: "config-diff",
  diffEntry: (entity: string, id: string) => `diff-${entity}-${id}`, // carries data-change="added|preserved|..."
  xrayToggle: "xray-toggle",
  xrayTarget: (componentId: string) => `xray-target-${componentId}`, // source-selector | classroom-preview | workbench-view
  coverageWarning: "coverage-warning",

  // E · Blueprint & approval
  sdkMapping: (layer: "Camera" | "Hub" | "Edge") => `sdk-mapping-${layer.toLowerCase()}`,
  signoffChecklist: "signoff-checklist",
  approveButton: "approve-design",
  requestChangesButton: "request-changes",
  approvalState: "approval-state", // text: draft | approved
} as const;

/** All selectable view tiles currently rendered in the preview. */
export const viewTiles = (page: Page) => page.locator(`[data-testid^="${tid.viewTiles}"]`);
