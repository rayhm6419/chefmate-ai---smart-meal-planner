import { apiFetchJson } from "./apiClient";
import { Recipe } from "../types";

export interface Favorite extends Recipe {
  recipeId: string;
}

export const getFavorites = async (): Promise<Favorite[]> => {
  return apiFetchJson<Favorite[]>(`/api/favorites`);
};

export const addFavorite = async (payload: Favorite): Promise<Favorite> => {
  return apiFetchJson<Favorite>(`/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const removeFavoriteByRecipe = async (recipeId: string): Promise<void> => {
  await apiFetchJson<void>(`/api/favorites/by-recipe/${recipeId}`, {
    method: "DELETE",
  });
};
