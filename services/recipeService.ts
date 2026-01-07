import type { CookIdea, ImageKey, MealTypeOption, Recipe } from "../types";
import { apiFetchJson } from "./apiClient";
import { getSavedToken } from "./secureStorage";
import { DEFAULT_RECIPE_IMAGE, RECIPE_IMAGE_MAP, inferImageKeyFromTitle, isValidImageKey } from "../utils/recipeImageMap";
import { DEFAULT_RECIPE_VIDEO, getRecipeVideoUrl } from "../utils/recipeVideoMap";

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

const stableHash = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export const computeCookIdeaId = (idea: {
  title?: string;
  ingredients?: string[];
  steps?: string[];
  difficulty?: string;
  estimatedTime?: number;
}): string => {
  const payload = [
    idea.title ?? "",
    (idea.ingredients ?? []).join(","),
    (idea.steps ?? []).join("|"),
    idea.difficulty ?? "",
    idea.estimatedTime ?? "",
  ].join("::");
  return `cook_${stableHash(payload)}`;
};

export const normalizeCookIdea = (
  rawIdea: Partial<CookIdea>,
  context?: { category?: CookIdea["category"] }
): CookIdea => {
  const title = rawIdea.title?.trim() || "Untitled Recipe";
  const ingredients = (rawIdea.ingredients ?? []).filter(Boolean);
  const steps = (rawIdea.steps ?? []).filter(Boolean);
  const difficulty = rawIdea.difficulty?.trim() || "Medium";
  const estimatedTime = Number(rawIdea.estimatedTime ?? 20) || 20;
  const shortDescription = rawIdea.shortDescription?.trim() || "A tasty recipe idea.";
  const imageKey: ImageKey = isValidImageKey(rawIdea.imageKey)
    ? rawIdea.imageKey
    : inferImageKeyFromTitle(title) ?? "default";
  const imageUrl = RECIPE_IMAGE_MAP[imageKey] ?? DEFAULT_RECIPE_IMAGE;
  const videoUrl = rawIdea.videoUrl?.trim() || getRecipeVideoUrl({
    id: rawIdea.id || "",
    title,
    shortDescription,
    difficulty,
    estimatedTime,
    ingredients,
    steps,
  } as Recipe);

  return {
    id: rawIdea.id || computeCookIdeaId({ title, ingredients, steps, difficulty, estimatedTime }),
    title,
    shortDescription,
    difficulty,
    estimatedTime,
    imageUrl,
    imageKey,
    videoUrl: videoUrl || DEFAULT_RECIPE_VIDEO,
    ingredients,
    steps: steps.length > 0 ? steps : ["Follow the recipe instructions."],
    calories: rawIdea.calories ?? 420,
    rating: rawIdea.rating ?? 4.6,
    category: rawIdea.category ?? context?.category,
  };
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
    id: String(Date.now()),
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

interface CookIdeasResponse {
  dishes: CookIdea[];
}

export const generateCookIdeas = async (
  payload: CookIdeaPayload,
  context?: { category?: CookIdea["category"] }
): Promise<CookIdea[]> => {
  const token = await getSavedToken();
  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }
  const data = await apiFetchJson<CookIdeasResponse>(`/api/recipes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const dishes = data.dishes || [];
  return dishes.map((idea) => normalizeCookIdea(idea, context));
};
