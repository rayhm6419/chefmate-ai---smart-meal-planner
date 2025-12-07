import { Recipe, MealTypeOption } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

export const fetchFavorites = async (date: string, mealType?: MealTypeOption): Promise<Recipe[]> => {
  const params = new URLSearchParams({ date });
  if (mealType) params.set("mealType", mealType);
  const res = await fetch(`${API_BASE}/api/recipes/favorites?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch favorites (${res.status})`);
  }
  return res.json();
};

export interface AiRecipePayload {
  query: string;
  servings?: number;
  mealType?: string;
  cuisinePreference?: string[];
  dietRestrictions?: string[];
  language?: string;
  date?: string; // YYYY-MM-DD
}

interface AiIngredient {
  name: string;
  amount: string;
}

export interface InventoryCookPayload {
  ingredients: { id?: string; name: string }[];
}

export interface InventoryCookResponse {
  title: string;
  ingredients: string[];
  steps: string[];
}

export const generateRecipeFromInventory = async (payload: InventoryCookPayload): Promise<InventoryCookResponse> => {
  const res = await fetch(`${API_BASE}/api/recipes/from-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients: payload.ingredients }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Inventory cook failed (${res.status}): ${text}`);
  }
  return res.json();
};

interface AiRecipe {
  title: string;
  description: string;
  totalTimeMinutes: number;
  difficulty: string;
  tags: string[];
  servings: number;
  ingredients: AiIngredient[];
  steps: string[];
  tips: string[];
}

interface AiRecipeResponse {
  recipes: AiRecipe[];
}

export const generateAiRecipe = async (payload: AiRecipePayload): Promise<Recipe> => {
  const res = await fetch(`${API_BASE}/api/ai/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI recipe generation failed (${res.status}): ${text}`);
  }
  const data: AiRecipeResponse = await res.json();
  if (!data.recipes || data.recipes.length === 0) {
    throw new Error("AI did not return any recipes");
  }

  const first = data.recipes[0];
  const difficulty = first.difficulty ? first.difficulty.toUpperCase() as Recipe["difficulty"] : "MEDIUM";

  return {
    id: Date.now(),
    title: first.title,
    shortDescription: first.description,
    servings: first.servings,
    mealType: (payload.mealType?.toUpperCase() as MealTypeOption) || "DINNER",
    cuisine: payload.cuisinePreference?.[0],
    cookTimeMinutes: first.totalTimeMinutes,
    difficulty,
    favorite: true,
    plannedDate: payload.date,
    plannedMealSlot: payload.mealType?.toLowerCase(),
    ingredients: first.ingredients?.map((ing) => ({
      name: ing.name,
      note: ing.amount,
    })) || [],
    steps: first.steps || [],
    tips: first.tips || [],
  };
};
