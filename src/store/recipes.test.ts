import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lectureApp } from "../data/demo-apps";
import { RECIPE_KEY, readRecipes, saveRecipe } from "./recipes";

describe("approved recipe persistence", () => {
  let data: Map<string, string>;
  beforeEach(() => {
    data = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  const recipe = { id: "recipe-university", app: { ...lectureApp, approval: "approved" as const }, approvedBy: "Demo Engineer", approvedAt: "2026-11-22T01:00:00.000Z" };
  it("starts empty and restores a validated approval from browser storage", () => {
    expect(readRecipes()).toEqual([]);
    saveRecipe(recipe);
    expect(readRecipes()).toEqual([recipe]);
  });
  it("updates the same recipe without duplicating it", () => {
    saveRecipe(recipe);
    saveRecipe({ ...recipe, approvedBy: "Second Reviewer" });
    expect(readRecipes()).toHaveLength(1);
    expect(readRecipes()[0].approvedBy).toBe("Second Reviewer");
  });
  it("preserves invalid existing data rather than overwriting it", () => {
    data.set(RECIPE_KEY, '{"invalid":true}');
    expect(() => saveRecipe(recipe)).toThrow();
    expect(data.get(RECIPE_KEY)).toBe('{"invalid":true}');
  });
  it("does not save draft configurations as approved recipes", () => {
    expect(() => saveRecipe({ ...recipe, app: lectureApp })).toThrow();
    expect(data.has(RECIPE_KEY)).toBe(false);
  });
});
