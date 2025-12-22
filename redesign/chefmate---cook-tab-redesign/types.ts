
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
