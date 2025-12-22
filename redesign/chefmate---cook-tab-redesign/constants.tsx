
import { Dish, Category } from './types';

export const INITIAL_DISHES: Dish[] = [
  {
    id: '1',
    title: 'Avocado Toast with Poached Egg',
    description: 'Creamy avocado on sourdough topped with a perfect runny egg.',
    timeMins: 12,
    calories: 320,
    rating: 4.8,
    thumbnailUrl: 'https://picsum.photos/seed/avocado/400/300',
    category: 'Breakfast',
    ingredients: ['Avocado', 'Egg', 'Sourdough']
  },
  {
    id: '2',
    title: 'Greek Yogurt Parfait',
    description: 'Honeyed yogurt with seasonal berries and crunchy granola.',
    timeMins: 5,
    calories: 210,
    rating: 4.5,
    thumbnailUrl: 'https://picsum.photos/seed/yogurt/400/300',
    category: 'Breakfast',
    ingredients: ['Yogurt', 'Berries', 'Granola']
  },
  {
    id: '3',
    title: 'Quinoa Buddha Bowl',
    description: 'Fresh kale, roasted chickpeas, and tahini dressing.',
    timeMins: 20,
    calories: 450,
    rating: 4.9,
    thumbnailUrl: 'https://picsum.photos/seed/quinoa/400/300',
    category: 'Lunch',
    ingredients: ['Quinoa', 'Kale', 'Chickpeas']
  },
  {
    id: '4',
    title: 'Grilled Salmon & Asparagus',
    description: 'Lemon-garlic glazed salmon with buttered asparagus.',
    timeMins: 15,
    calories: 380,
    rating: 4.7,
    thumbnailUrl: 'https://picsum.photos/seed/salmon/400/300',
    category: 'Dinner',
    ingredients: ['Salmon', 'Asparagus', 'Lemon']
  },
  {
    id: '5',
    title: 'Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms and parmesan.',
    timeMins: 35,
    calories: 520,
    rating: 4.6,
    thumbnailUrl: 'https://picsum.photos/seed/mushroom/400/300',
    category: 'Dinner',
    ingredients: ['Mushroom', 'Arborio Rice', 'Parmesan']
  },
  {
    id: '6',
    title: 'Chicken Pesto Pasta',
    description: 'Fusilli pasta tossed in fresh basil pesto with grilled chicken.',
    timeMins: 20,
    calories: 480,
    rating: 4.4,
    thumbnailUrl: 'https://picsum.photos/seed/pasta/400/300',
    category: 'Lunch',
    ingredients: ['Chicken', 'Pasta', 'Pesto']
  }
];

export const CATEGORIES: Category[] = ['Breakfast', 'Lunch', 'Dinner'];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
