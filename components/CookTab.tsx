
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, CookIdea, Dish } from '../types';
import { CATEGORIES, INITIAL_DISHES } from '../constants';
import { DishCard } from './DishCard';
import { RecipeModal } from './RecipeModal';
import { generateCookIdeas, normalizeCookIdea } from '../services/recipeService';
import { IngredientSelectorModal, SelectedIngredient } from './IngredientSelectorModal';
import { buildCookIdeasCacheKey, getCookIdeasCache, setCookIdeasCache } from '../services/cookIdeasCache';
import { getFavorites, toggleFavorite } from '../services/favoritesStore';

interface CookTabProps {
  selectedDate: string;
}

export const CookTab: React.FC<CookTabProps> = ({ selectedDate }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('Breakfast');
  const [dishes, setDishes] = useState<CookIdea[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDish, setSelectedDish] = useState<CookIdea | null>(null);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [isIngredientSelectorOpen, setIsIngredientSelectorOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const ingredientNames = useMemo(
    () => selectedIngredients.map((item) => item.name),
    [selectedIngredients]
  );

  const cacheKey = useMemo(
    () => buildCookIdeasCacheKey(selectedDate, activeCategory, ingredientNames),
    [selectedDate, activeCategory, ingredientNames]
  );

  const seedIdeas = useCallback((category: Category) => {
    const seeded = INITIAL_DISHES.filter((d) => d.category === category).map((dish: Dish) =>
      normalizeCookIdea(
        {
          id: dish.id,
          title: dish.title,
          shortDescription: dish.description,
          estimatedTime: dish.timeMins,
          difficulty: "Medium",
          ingredients: dish.ingredients,
          steps: dish.steps ?? [],
          calories: dish.calories,
          rating: dish.rating,
          category: dish.category,
        },
        { category }
      )
    );
    setDishes(seeded.slice(0, 3));
  }, []);

  const handleShuffle = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newDishes = await generateCookIdeas(
        {
        ingredients: selectedIngredients.map((item) => ({ id: item.id, name: item.name })),
        seed: `${selectedDate}-${activeCategory}`,
        },
        { category: activeCategory }
      );
      if (newDishes.length > 0) {
        setDishes(newDishes);
        await setCookIdeasCache(cacheKey, newDishes);
      } else {
        seedIdeas(activeCategory);
      }
    } catch (error) {
      console.error("Failed to generate cook ideas", error);
      seedIdeas(activeCategory);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeCategory, cacheKey, selectedDate, selectedIngredients, seedIdeas]);

  // Update list when category changes
  useEffect(() => {
    let isMounted = true;
    const loadCached = async () => {
      const cached = await getCookIdeasCache(cacheKey);
      if (!isMounted) return;
      if (cached && cached.length > 0) {
        setDishes(cached);
      } else {
        seedIdeas(activeCategory);
      }
    };
    loadCached();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, cacheKey, seedIdeas]);

  useEffect(() => {
    let isMounted = true;
    getFavorites().then((favs) => {
      if (!isMounted) return;
      setFavoriteIds(new Set(favs.map((idea) => idea.id)));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-screen-xl mx-auto px-4 sm:px-6">
      {/* Category Selector */}
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-4 tracking-tight">What should I eat?</h1>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient Context */}
      <div className="mb-8">
        {selectedIngredients.length > 0 ? (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Using:</span>
            {selectedIngredients.map((ing) => (
              <span key={ing.id} className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100 whitespace-nowrap flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                {ing.name}
              </span>
            ))}
            <button 
              onClick={() => setIsIngredientSelectorOpen(true)}
              className="ml-auto text-xs font-bold text-orange-600 hover:underline flex items-center"
            >
              Edit <i className="fa-solid fa-chevron-right ml-1 text-[10px]"></i>
            </button>
          </div>
        ) : (
          <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                  <i className="fa-solid fa-kitchen-set"></i>
               </div>
               <div>
                  <h4 className="text-sm font-bold text-gray-800 leading-tight">Use what's in your fridge</h4>
                  <p className="text-[11px] text-gray-500">Better results with ingredients</p>
               </div>
            </div>
            <button 
              onClick={() => setIsIngredientSelectorOpen(true)}
              className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-orange-600 shadow-sm hover:shadow-md transition-shadow"
            >
              Pick ingredients
            </button>
          </div>
        )}
      </div>

      {/* View Toggle (Hidden on very small screens, desktop focus) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suggestions for you</h2>
        <div className="hidden sm:flex items-center bg-gray-200/50 p-1 rounded-lg">
          <button 
            onClick={() => setLayoutMode('list')}
            className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
          >
            <i className="fa-solid fa-list-ul text-xs"></i>
          </button>
          <button 
            onClick={() => setLayoutMode('grid')}
            className={`p-1.5 rounded ${layoutMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
          >
            <i className="fa-solid fa-grip-vertical text-xs"></i>
          </button>
        </div>
      </div>

      {/* Dish List/Grid */}
      <div className={`flex-1 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className={layoutMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {dishes.map((dish) => (
            <DishCard 
              key={dish.id} 
              dish={dish} 
              layout={layoutMode} 
              onClick={setSelectedDish}
              isFavorite={favoriteIds.has(dish.id)}
              onToggleFavorite={async (idea) => {
                const next = await toggleFavorite(idea);
                setFavoriteIds(new Set(next.map((fav) => fav.id)));
              }}
            />
          ))}
          {dishes.length === 0 && !isRefreshing && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
               <div className="text-4xl mb-3 opacity-20">🍳</div>
               <p className="text-gray-400 font-medium">No dishes found. Try shuffling!</p>
            </div>
          )}
        </div>
      </div>

      {/* Regenerate Action */}
      <div className="mt-8 mb-4">
        <button 
          onClick={handleShuffle}
          disabled={isRefreshing}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-3xl shadow-sm border border-gray-200 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
        >
          <i className={`fa-solid fa-rotate ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} text-orange-500`}></i>
          {isRefreshing ? 'Thinking...' : 'Shuffle ideas'}
        </button>
      </div>

      {/* Detail Modal */}
      <RecipeModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onFavoritesUpdated={(next) => {
          setFavoriteIds(new Set(next.map((idea) => idea.id)));
        }}
      />
      <IngredientSelectorModal
        open={isIngredientSelectorOpen}
        onClose={() => setIsIngredientSelectorOpen(false)}
        onConfirm={(items) => {
          setSelectedIngredients(items);
          setIsIngredientSelectorOpen(false);
        }}
        initialSelected={selectedIngredients}
      />
    </div>
  );
};
