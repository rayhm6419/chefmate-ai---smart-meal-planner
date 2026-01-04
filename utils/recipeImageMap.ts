// src/recipeImageMap.ts

// IMPORTANT: using Vite base URL so it works in web + Capacitor builds
const BASE = import.meta.env.BASE_URL || "/";

export const DEFAULT_RECIPE_IMAGE = `${BASE}recipe-images/default.jpg`;

/**
 * keyword -> image url
 * 你可以随时扩充，不需要改其他逻辑
 */
export const RECIPE_IMAGE_MAP: Record<string, string> = {
  chicken: `${BASE}recipe-images/chicken.jpg`,
  egg: `${BASE}recipe-images/egg.jpg`,
  beef: `${BASE}recipe-images/beef.jpg`,
  pork: `${BASE}recipe-images/beef.jpg`,
  fish: `${BASE}recipe-images/fish.jpg`,
  seafood: `${BASE}recipe-images/fish.jpg`,
  salad: `${BASE}recipe-images/salad.jpg`,
  soup: `${BASE}recipe-images/soup.jpg`,
  noodles: `${BASE}recipe-images/noodles.jpg`,
  pasta: `${BASE}recipe-images/noodles.jpg`,
  rice: `${BASE}recipe-images/rice.jpg`,
  dessert: `${BASE}recipe-images/dessert.jpg`,
  yogurt: `${BASE}recipe-images/dessert.jpg`,
  veggie: `${BASE}recipe-images/veggie.jpg`,
  vegetable: `${BASE}recipe-images/veggie.jpg`,
};

/**
 * very small heuristic: find a keyword from title/desc/ingredients
 */
export function inferImageKeyword(input: {
  title?: string;
  description?: string;
  ingredients?: string[];
}): string | undefined {
  const text = `${input.title ?? ""} ${input.description ?? ""} ${(input.ingredients ?? []).join(" ")}`.toLowerCase();

  const keywords = Object.keys(RECIPE_IMAGE_MAP);
  return keywords.find((k) => text.includes(k));
}

/**
 * choose which image to render for a recipe
 */
export function getRecipeImage(recipe: {
  imageUrl?: string;
  imageKeyword?: string;
  title?: string;
  description?: string;
  ingredients?: string[];
}): string {
  if (recipe.imageUrl) return recipe.imageUrl;

  const key = (recipe.imageKeyword ?? inferImageKeyword(recipe))?.toLowerCase();
  if (key && RECIPE_IMAGE_MAP[key]) return RECIPE_IMAGE_MAP[key];

  return DEFAULT_RECIPE_IMAGE;
}
