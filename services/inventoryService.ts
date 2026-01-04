import { apiFetchJson } from "./apiClient";
import { Ingredient, IngredientCategory } from "../types";

type InventoryApiCategory = "MEAT" | "SEAFOOD" | "VEGETABLE" | "FRUIT" | "DAIRY" | "FROZEN" | "OTHER";

interface InventoryApiItem {
  id: string;
  name: string;
  category: InventoryApiCategory;
  quantity?: number | null;
  unit?: string | null;
  expiryDate?: string | null;
}

const toApiCategory = (category: IngredientCategory): InventoryApiCategory => {
  switch (category) {
    case "Meat":
      return "MEAT";
    case "Seafood":
      return "SEAFOOD";
    case "Vegetable":
      return "VEGETABLE";
    case "Fruit":
      return "FRUIT";
    case "Dairy":
      return "DAIRY";
    case "Frozen":
      return "FROZEN";
    case "Other":
      return "OTHER";
  }
};

const fromApiCategory = (category: InventoryApiCategory): IngredientCategory => {
  switch (category) {
    case "MEAT":
      return "Meat";
    case "SEAFOOD":
      return "Seafood";
    case "VEGETABLE":
      return "Vegetable";
    case "FRUIT":
      return "Fruit";
    case "DAIRY":
      return "Dairy";
    case "FROZEN":
      return "Frozen";
    case "OTHER":
      return "Other";
  }
};

const toIngredient = (item: InventoryApiItem): Ingredient => ({
  id: item.id,
  name: item.name,
  category: fromApiCategory(item.category),
  quantity: item.quantity ?? undefined,
  unit: item.unit ?? undefined,
  expiryDate: item.expiryDate ?? undefined,
});

export const listInventoryItems = async (): Promise<Ingredient[]> => {
  const items = await apiFetchJson<InventoryApiItem[]>(`/api/inventory`);
  return items.map(toIngredient);
};

export const createInventoryItem = async (
  name: string,
  category: IngredientCategory,
  expiryDate?: string,
  quantity?: number,
  unit?: string
): Promise<Ingredient> => {
  const created = await apiFetchJson<InventoryApiItem>(`/api/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      category: toApiCategory(category),
      quantity,
      unit,
      expiryDate,
    }),
  });
  return toIngredient(created);
};

export const updateInventoryItem = async (
  id: string,
  name: string,
  category: IngredientCategory,
  expiryDate?: string,
  quantity?: number,
  unit?: string
): Promise<Ingredient> => {
  const updated = await apiFetchJson<InventoryApiItem>(`/api/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      category: toApiCategory(category),
      quantity,
      unit,
      expiryDate,
    }),
  });
  return toIngredient(updated);
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await apiFetchJson<void>(`/api/inventory/${id}`, { method: "DELETE" });
};
