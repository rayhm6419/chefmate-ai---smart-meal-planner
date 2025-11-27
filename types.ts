
export type IngredientCategory = 'Vegetable' | 'Meat' | 'Fruit' | 'Dairy' | 'Grain' | 'Snack' | 'Spice' | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  expiryDate?: string; // YYYY-MM-DD
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface MealPlan {
  [dateKey: string]: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    notes?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface DateInfo {
  dayName: DayOfWeek;
  fullDate: string; // ISO YYYY-MM-DD
  displayDate: string; // e.g. "Oct 24"
}

export type CuisineType = 'Cantonese' | 'Sichuan' | 'Fujian' | 'Hunan' | 'Jiangsu' | 'Zhejiang' | 'Anhui' | 'Shandong' | 'General';
