import { Recipe, MealTypeOption } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

export interface AiRecipePayload {
  prompt: string;
  date: string; // YYYY-MM-DD
  mealType: MealTypeOption;
  servings?: number;
  mustHaveIngredients?: string[];
}

export const fetchFavorites = async (date: string, mealType?: MealTypeOption): Promise<Recipe[]> => {
  const params = new URLSearchParams({ date });
  if (mealType) params.set("mealType", mealType);
  const res = await fetch(`${API_BASE}/api/recipes/favorites?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch favorites (${res.status})`);
  }
  return res.json();
};

export const generateAiRecipe = async (payload: AiRecipePayload): Promise<Recipe> => {
  const res = await fetch(`${API_BASE}/api/recipes/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI recipe generation failed (${res.status}): ${text}`);
  }
  return res.json();
};
