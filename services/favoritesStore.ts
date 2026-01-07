import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import type { CookIdea } from "../types";
import { normalizeCookIdea } from "./recipeService";

const FAVORITES_KEY = "chefmate:favorites";
const isNative = Capacitor.isNativePlatform();

const readStorage = async (): Promise<string | null> => {
  if (isNative) {
    const { value } = await Preferences.get({ key: FAVORITES_KEY });
    return value ?? null;
  }
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(FAVORITES_KEY);
};

const writeStorage = async (value: string) => {
  if (isNative) {
    await Preferences.set({ key: FAVORITES_KEY, value });
    return;
  }
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, value);
};

export const getFavorites = async (): Promise<CookIdea[]> => {
  const raw = await readStorage();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((idea) => normalizeCookIdea(idea));
  } catch (error) {
    console.warn("Failed to parse favorites store", error);
    return [];
  }
};

export const isFavorite = async (id: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((idea) => idea.id === id);
};

export const toggleFavorite = async (idea: CookIdea): Promise<CookIdea[]> => {
  const favorites = await getFavorites();
  const exists = favorites.some((item) => item.id === idea.id);
  const next = exists ? favorites.filter((item) => item.id !== idea.id) : [idea, ...favorites];
  await writeStorage(JSON.stringify(next));
  return next;
};
