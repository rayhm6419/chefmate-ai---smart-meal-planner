import { Recipe, MealTypeOption } from "../types";
import { apiFetchJson } from "./apiClient";

export const fetchFavorites = async (date: string, mealType?: MealTypeOption): Promise<Recipe[]> => {
  const params = new URLSearchParams({ date });
  if (mealType) params.set("mealType", mealType);
  return apiFetchJson<Recipe[]>(`/api/recipes/favorites?${params.toString()}`);
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
  return apiFetchJson<InventoryCookResponse>(`/api/recipes/from-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients: payload.ingredients }),
  });
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
  const data = await apiFetchJson<AiRecipeResponse>(`/api/ai/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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

export interface CookIdeaPayload {
  ingredients: { id?: string; name: string }[];
  cuisinePreference?: string[];
  difficulty?: string;
  servings?: number;
  maxTimeMinutes?: number;
  excludeRecipeIds?: string[];
  seed?: string;
}

export interface CookIdea {
  id: string;
  title: string;
  shortDescription: string;
  difficulty: string;
  estimatedTime: number;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
}

interface CookIdeasResponse {
  dishes: CookIdea[];
}

export const generateCookIdeas = async (payload: CookIdeaPayload): Promise<CookIdea[]> => {
  const data = await apiFetchJson<CookIdeasResponse>(`/api/recipes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.dishes || [];
};
