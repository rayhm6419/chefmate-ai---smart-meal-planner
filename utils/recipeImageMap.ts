import type { ImageKey } from "../types";

const buildImageUrl = (filename: string) =>
  new URL(`./recipeImages/${filename}`, import.meta.url).toString();

export const IMAGE_KEYS: ImageKey[] = [
  "default",
  "Meatloaf",
  "PotRoast",
  "greenbean",
  "omelette",
  "Cod",
  "ChickenPotPie",
  "ChickenNoodlesou",
  "CheeseBurger",
  "FishTacos",
  "EggSandwich",
  "BuffaloWings",
  "GroundBeef",
  "Salmon",
  "Sprouts",
  "lamb",
  "chicken",
  "Eggs",
  "Sandwiches",
  "Pie",
];

const IMAGE_KEY_SET = new Set<ImageKey>(IMAGE_KEYS);

export const isValidImageKey = (value: unknown): value is ImageKey =>
  typeof value === "string" && IMAGE_KEY_SET.has(value as ImageKey);

export const DEFAULT_RECIPE_IMAGE = buildImageUrl("default.jpg");

export const RECIPE_IMAGE_MAP: Record<ImageKey, string> = {
  default: DEFAULT_RECIPE_IMAGE,
  Meatloaf: buildImageUrl("Meatloaf.jpg"),
  PotRoast: buildImageUrl("PotRoast.jpg"),
  greenbean: buildImageUrl("greenbean.jpg"),
  omelette: buildImageUrl("omelette.jpg"),
  Cod: buildImageUrl("Cod.jpg"),
  ChickenPotPie: buildImageUrl("ChickenPot-Pie.jpg"),
  ChickenNoodlesou: buildImageUrl("ChickenNoodlesou.jpg"),
  CheeseBurger: buildImageUrl("CheeseBurger.jpg"),
  FishTacos: buildImageUrl("FishTacos.jpg"),
  EggSandwich: buildImageUrl("EggSandwich.jpg"),
  BuffaloWings: buildImageUrl("BuffaloWings.jpg"),
  GroundBeef: buildImageUrl("GroundBeef.jpg"),
  Salmon: buildImageUrl("Salmon.jpg"),
  Sprouts: buildImageUrl("Sprouts.jpg"),
  lamb: buildImageUrl("lamb.jpg"),
  chicken: buildImageUrl("chicken.jpg"),
  Eggs: buildImageUrl("Eggs.jpg"),
  Sandwiches: buildImageUrl("Sandwhiches.jpg"),
  Pie: buildImageUrl("Pie.jpg.jpg"),
};

const TITLE_FALLBACKS: Array<{ keyword: string; key: ImageKey }> = [
  { keyword: "chicken pot pie", key: "ChickenPotPie" },
  { keyword: "pot pie", key: "ChickenPotPie" },
  { keyword: "pot roast", key: "PotRoast" },
  { keyword: "potroast", key: "PotRoast" },
  { keyword: "roast", key: "PotRoast" },
  { keyword: "buffalo wings", key: "BuffaloWings" },
  { keyword: "wings", key: "BuffaloWings" },
  { keyword: "egg sandwich", key: "EggSandwich" },
  { keyword: "fish taco", key: "FishTacos" },
  { keyword: "tacos", key: "FishTacos" },
  { keyword: "chicken noodle", key: "ChickenNoodlesou" },
  { keyword: "noodle soup", key: "ChickenNoodlesou" },
  { keyword: "green bean", key: "greenbean" },
  { keyword: "greenbean", key: "greenbean" },
  { keyword: "omelette", key: "omelette" },
  { keyword: "omelet", key: "omelette" },
  { keyword: "cheeseburger", key: "CheeseBurger" },
  { keyword: "burger", key: "CheeseBurger" },
  { keyword: "ground beef", key: "GroundBeef" },
  { keyword: "beef chili", key: "GroundBeef" },
  { keyword: "chili", key: "GroundBeef" },
  { keyword: "brussels sprouts", key: "Sprouts" },
  { keyword: "sprouts", key: "Sprouts" },
  { keyword: "meatloaf", key: "Meatloaf" },
  { keyword: "cod", key: "Cod" },
  { keyword: "salmon", key: "Salmon" },
  { keyword: "lamb", key: "lamb" },
  { keyword: "chicken", key: "chicken" },
  { keyword: "sandwiches", key: "Sandwiches" },
  { keyword: "sandwhiches", key: "Sandwiches" },
  { keyword: "sandwhich", key: "Sandwiches" },
  { keyword: "sandwich", key: "Sandwiches" },
  { keyword: "eggs", key: "Eggs" },
  { keyword: "egg", key: "Eggs" },
  { keyword: "pie", key: "Pie" },
];

export const inferImageKeyFromTitle = (title?: string): ImageKey | undefined => {
  if (!title) return undefined;
  const lowerTitle = title.toLowerCase();
  return TITLE_FALLBACKS.find((entry) => lowerTitle.includes(entry.keyword))?.key;
};

export const getRecipeImageUrl = (recipe: {
  title?: string;
  imageKey?: ImageKey;
}): string => {
  const imageKey = isValidImageKey(recipe.imageKey)
    ? recipe.imageKey
    : inferImageKeyFromTitle(recipe.title) ?? "default";
  return RECIPE_IMAGE_MAP[imageKey] || DEFAULT_RECIPE_IMAGE;
};
