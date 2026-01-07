import type { CookIdea, Recipe } from "../types";

const buildVideoUrl = (filename: string) =>
  new URL(`./recipeVideos/${filename}`, import.meta.url).toString();

export const DEFAULT_RECIPE_VIDEO = buildVideoUrl("default.mp4");

export const getRecipeVideoUrl = (_recipe: Recipe | CookIdea): string => DEFAULT_RECIPE_VIDEO;
