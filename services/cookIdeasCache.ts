import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import type { CookIdea } from "../types";
import { normalizeCookIdea } from "./recipeService";

const CACHE_PREFIX = "cookIdeas";
const isNative = Capacitor.isNativePlatform();

const readCacheValue = async (key: string): Promise<string | null> => {
  if (isNative) {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  }
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(key);
};

const writeCacheValue = async (key: string, value: string) => {
  if (isNative) {
    await Preferences.set({ key, value });
    return;
  }
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value);
};

export const buildCookIdeasCacheKey = (
  date: string,
  mealType: string,
  ingredientNames: string[]
): string => {
  const sorted = [...ingredientNames].map((name) => name.toLowerCase()).sort().join(",");
  return `${CACHE_PREFIX}:${date}:${mealType}:${sorted}`;
};

export const getCookIdeasCache = async (key: string): Promise<CookIdea[] | null> => {
  const raw = await readCacheValue(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((idea) => normalizeCookIdea(idea));
  } catch (error) {
    console.warn("Failed to parse cook ideas cache", error);
    return null;
  }
};

export const setCookIdeasCache = async (key: string, ideas: CookIdea[]): Promise<void> => {
  await writeCacheValue(key, JSON.stringify(ideas));
};
