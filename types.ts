export type Category = 'Breakfast' | 'Lunch' | 'Dinner';

export interface Dish {
  id: string;
  title: string;
  description: string;
  timeMins: number;
  calories: number;
  rating: number;
  thumbnailUrl: string;
  category: Category;
  ingredients: string[];
}

export interface AppState {
  currentTab: string;
  selectedDate: string;
  selectedCategory: Category;
  selectedIngredients: string[];
}

export type IngredientCategory = 'Vegetable' | 'Meat' | 'Fruit' | 'Dairy' | 'Grain' | 'Snack' | 'Spice' | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity?: number;
  unit?: string;
  expiryDate?: string; // YYYY-MM-DD
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked?: boolean;
  [key: string]: any;
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

export type MealTypeOption = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface RecipeIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  note?: string;
}

export interface Recipe {
  id: string;
  title: string;
  shortDescription?: string;
  servings?: number;
  mealType: MealTypeOption;
  cuisine?: string;
  cookTimeMinutes?: number;
  difficulty: RecipeDifficulty;
  favorite: boolean;
  plannedDate?: string;
  plannedMealSlot?: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  tips: string[];
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface DateInfo {
  dayName: DayOfWeek;
  fullDate: string; // ISO YYYY-MM-DD
  displayDate: string; // e.g. "Oct 24"
}

export type CuisineType = 'Cantonese' | 'Sichuan' | 'Fujian' | 'Hunan' | 'Jiangsu' | 'Zhejiang' | 'Anhui' | 'Shandong' | 'General';
