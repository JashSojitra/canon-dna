import { approvedRecipeSchema, type ApprovedRecipe } from "../types/canon-dna";

export const RECIPE_KEY = "canon-dna.approved-recipes.v1";

export function readRecipes(): ApprovedRecipe[] {
  const raw = localStorage.getItem(RECIPE_KEY);
  if (!raw) return [];
  const parsed = approvedRecipeSchema.array().safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("Saved recipes could not be validated. Existing browser data has been preserved.");
  return parsed.data;
}

export function saveRecipe(recipe: ApprovedRecipe): ApprovedRecipe[] {
  const checked = approvedRecipeSchema.parse(recipe);
  const recipes = [checked, ...readRecipes().filter(({ id }) => id !== checked.id)];
  localStorage.setItem(RECIPE_KEY, JSON.stringify(recipes));
  return recipes;
}
