
import React, { useState, useCallback, useEffect } from 'react';
import { Planner } from './components/Planner';
import { Inventory } from './components/Inventory';
import { ShoppingList } from './components/ShoppingList';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import RecipePopup from './components/RecipePopup';
import { CookTab, CookIdea } from './components/CookTab';
import { Ingredient, IngredientCategory, MealPlan, CuisineType, ShoppingItem, Recipe, MealTypeOption } from './types';
import { X, Send, Refrigerator, Package, ShoppingCart, Heart, Flame } from 'lucide-react';
import { fetchFavorites, generateAiRecipe, generateCookIdeas } from './services/recipeService';
import { useAuth } from './services/auth/AuthProvider';
import Login from './components/Login';

type Tab = 'fridge' | 'inventory' | 'cook' | 'shopping' | 'favorites';

const INVENTORY_STORAGE_KEY = 'chefmate.inventory';
const SHOPPING_STORAGE_KEY = 'chefmate.shopping';

const DEFAULT_INVENTORY: Ingredient[] = [
  { id: '1', name: 'Chicken Breast', category: 'Meat', expiryDate: '2023-11-25' },
  { id: '2', name: 'Bok Choy', category: 'Vegetable', expiryDate: '2023-11-23' },
  { id: '3', name: 'Rice', category: 'Grain' },
  { id: '4', name: 'Soy Sauce', category: 'Spice' },
  { id: '5', name: 'Eggs', category: 'Dairy', expiryDate: '2023-11-28' },
  { id: '6', name: 'Apples', category: 'Fruit', expiryDate: '2023-12-05' },
  { id: '7', name: 'Milk', category: 'Dairy', expiryDate: '2023-11-30' },
  { id: '8', name: 'Chili Oil', category: 'Spice' },
];

const DEFAULT_SHOPPING: ShoppingItem[] = [
  { id: '1', name: 'Garlic', checked: false },
  { id: '2', name: 'Oyster Sauce', checked: true },
];

const App: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  // --- App Data State ---
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [dataHydrated, setDataHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      setInventory([]);
      setShoppingItems([]);
      setDataHydrated(false);
      return;
    }

    if (typeof window === 'undefined') {
      setInventory(DEFAULT_INVENTORY);
      setShoppingItems(DEFAULT_SHOPPING);
      setDataHydrated(true);
      return;
    }

    try {
      const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
      const storedShopping = localStorage.getItem(SHOPPING_STORAGE_KEY);

      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      } else {
        setInventory(DEFAULT_INVENTORY);
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(DEFAULT_INVENTORY));
      }

      if (storedShopping) {
        setShoppingItems(JSON.parse(storedShopping));
      } else {
        setShoppingItems(DEFAULT_SHOPPING);
        localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(DEFAULT_SHOPPING));
      }
    } catch (err) {
      console.error('Failed to load saved data', err);
      setInventory(DEFAULT_INVENTORY);
      setShoppingItems(DEFAULT_SHOPPING);
    } finally {
      setDataHydrated(true);
    }
  }, [user]);

  useEffect(() => {
    if (!dataHydrated || typeof window === 'undefined' || !user) return;
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch (err) {
      console.error('Failed to persist inventory', err);
    }
  }, [inventory, dataHydrated, user]);

  useEffect(() => {
    if (!dataHydrated || typeof window === 'undefined' || !user) return;
    try {
      localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(shoppingItems));
    } catch (err) {
      console.error('Failed to persist shopping list', err);
    }
  }, [shoppingItems, dataHydrated, user]);

  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [homeInput, setHomeInput] = useState('');
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesGenerating, setFavoritesGenerating] = useState(false);
  const [cookGenerating, setCookGenerating] = useState(false);
  const [cookRecipes, setCookRecipes] = useState<CookIdea[]>([]);
  const [lastCookPayload, setLastCookPayload] = useState<{ ingredients: { id?: string; name: string }[] } | null>(null);
  const [cookError, setCookError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipePopup, setShowRecipePopup] = useState(false);
  const [popupSelectedId, setPopupSelectedId] = useState<string | null>(null);
  
  const [fridgeBg, setFridgeBg] = useState<string | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>('fridge');

  // Preferences
  const [showPrefs, setShowPrefs] = useState(false);
  const [cuisinePrefs, setCuisinePrefs] = useState<CuisineType[]>([]);
  
  const availableCuisines: CuisineType[] = [
    'Cantonese', 'Sichuan', 'Fujian', 'Hunan', 
    'Jiangsu', 'Zhejiang', 'Anhui', 'Shandong', 'General'
  ];

  // --- Handlers ---

  const toggleCuisine = (c: CuisineType) => {
    setCuisinePrefs(prev => 
      prev.includes(c) ? prev.filter(i => i !== c) : [...prev, c]
    );
  };

  const handleAddIngredient = (name: string, category: IngredientCategory, expiryDate?: string, quantity?: number, unit?: string) => {
    const newItem: Ingredient = {
      id: Date.now().toString(),
      name,
      category,
      expiryDate,
      quantity,
      unit
    };
    setInventory(prev => [...prev, newItem]);
  };

  const handleUpdateIngredient = (id: string, quantity?: number, unit?: string) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, quantity, unit } : item
    ));
  };

  const handleRemoveIngredient = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const ingredientIcon = (category: IngredientCategory) => {
    switch (category) {
      case 'Meat': return '🍗';
      case 'Vegetable': return '🥦';
      case 'Fruit': return '🍎';
      case 'Dairy': return '🥛';
      case 'Grain': return '🍚';
      case 'Spice': return '🧂';
      case 'Snack': return '🍘';
      default: return '🥕';
    }
  };

  const handleUpdatePlan = (date: string, mealType: 'lunch' | 'dinner', value: string) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: { ...prev[date], [mealType]: value }
    }));
  };

  // Shopping Handlers
  const handleAddShoppingItem = (name: string) => {
    setShoppingItems(prev => [...prev, { id: Date.now().toString(), name, checked: false }]);
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };


  const loadFavorites = useCallback(async (date: string, mealType: MealTypeOption = 'DINNER') => {
    try {
      setFavoritesLoading(true);
      setFavoritesError(null);
      const data = await fetchFavorites(date, mealType);
      setFavorites(data);
    } catch (e) {
      console.error('Favorites fetch failed', e);
      setFavoritesError('Failed to load favorites. Please try again.');
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  const askForRecipe = useCallback(async (prompt: string) => {
    if (!user) {
      setFavoritesError('Please sign in to generate recipes.');
      return false;
    }
    setFavoritesError(null);
    setFavoritesGenerating(true);
    try {
      const recipe = await generateAiRecipe({
        query: prompt,
        mealType: 'DINNER',
        servings: 2,
        cuisinePreference: cuisinePrefs.map(c => c.toLowerCase()),
        language: 'en-US',
        date: selectedDate,
      });
      await loadFavorites(selectedDate);
      return true;
    } catch (e) {
      console.error('AI recipe generation failed', e);
      setFavoritesError('Failed to generate recipe. Please try again.');
      return false;
    } finally {
      setFavoritesGenerating(false);
    }
  }, [selectedDate, user]);

  const handleGenerateFavorite = useCallback(async () => {
    const defaultPrompt = "Give me a quick dinner idea for tonight that is easy to cook.";
    await askForRecipe(defaultPrompt);
  }, [askForRecipe]);

  const handleHomeInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;
    const ok = await askForRecipe(homeInput.trim());
    if (ok) setHomeInput('');
  };

  const handleCookWithInventory = useCallback(async (items: { id: string; name: string; icon?: string }[]) => {
    if (!user) {
      setCookError('Please sign in to start cooking.');
      return;
    }
    setFavoritesError(null);
    setCookError(null);
    setCookGenerating(true);
    try {
      const payload = { ingredients: items.map((i) => ({ id: i.id, name: i.name })) };
      setLastCookPayload(payload);
      const dishes = await generateCookIdeas(payload);
      if (!dishes || dishes.length === 0) {
        throw new Error('No dishes returned');
      }
      setCookRecipes(dishes);
      setShowRecipePopup(true);
      setPopupSelectedId(null);
    } catch (e) {
      console.error('Cook with inventory failed', e);
      setCookError('Failed to cook with current ingredients. Please try again.');
    } finally {
      setCookGenerating(false);
    }
  }, [user]);

  const handleRegenerateCook = useCallback(async () => {
    if (!user) {
      setCookError('Please sign in to cook.');
      return;
    }
    if (!lastCookPayload) return;
    setCookGenerating(true);
    setCookError(null);
    try {
      const dishes = await generateCookIdeas(lastCookPayload);
      if (!dishes || dishes.length === 0) {
        throw new Error('No dishes returned');
      }
      setCookRecipes(dishes);
      setShowRecipePopup(true);
    } catch (e) {
      console.error('Regenerate cook ideas failed', e);
      setCookError('Couldn’t regenerate dishes, please try again.');
    } finally {
      setCookGenerating(false);
    }
  }, [lastCookPayload, user]);

  const handleSelectCookIdea = (idea: CookIdea) => {
    setPopupSelectedId(idea.id);
    setShowRecipePopup(true);
  };

  React.useEffect(() => {
    if (activeTab === 'favorites' && selectedDate) {
      loadFavorites(selectedDate);
    }
  }, [activeTab, selectedDate, loadFavorites]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-semibold">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const displayName = user.email?.split('@')[0] || user.email;
  const userInitial = displayName?.charAt(0)?.toUpperCase() || 'U';

  if (!dataHydrated) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white text-slate-600">
        <p className="text-sm font-medium">Loading your kitchen...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden relative">
      
      {/* Header */}
      <div className="pt-safe px-4 pb-2 bg-white flex items-center justify-between flex-none z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">CM</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">ChefMate</h1>
        </div>
        <button onClick={() => setShowPrefs(true)} className="p-1.5 bg-slate-50 rounded-full text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center">
            {userInitial}
          </div>
        </button>
      </div>

      {/* Top: Fixed Planner Strip */}
      <div className="flex-none z-20">
        <Planner 
           mealPlan={mealPlan}
           selectedDate={selectedDate}
           onSelectDate={setSelectedDate}
           onUpdatePlan={handleUpdatePlan}
        />
      </div>

      {/* Middle: Flexible Dashboard Content */}
      <div className="flex-1 flex flex-col relative min-h-0">
         {activeTab === 'shopping' && (
           <div className="flex-1 h-full overflow-hidden animate-in slide-in-from-right duration-300">
             <ShoppingList 
               items={shoppingItems}
               onAddItem={handleAddShoppingItem}
               onToggleItem={handleToggleShoppingItem}
               onRemoveItem={handleRemoveShoppingItem}
             />
           </div>
         )}

         {activeTab === 'favorites' && (
           <div className="flex-1 h-full overflow-y-auto px-4 py-6 bg-gradient-to-b from-white to-slate-50">
             <div className="max-w-xl mx-auto flex flex-col gap-4">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                   <Heart className="w-5 h-5" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-slate-900">Favorite Recipes</h2>
                   <p className="text-sm text-slate-500">Quick access to the dishes you love most.</p>
                 </div>
               </div>
                {favoritesLoading && <p className="text-sm text-slate-500">Loading favorites...</p>}
                {favoritesError && <p className="text-sm text-red-500">{favoritesError}</p>}
                {(!favoritesLoading && favorites.length === 0) && (
                  <div className="border border-dashed border-rose-200 rounded-2xl p-4 bg-white shadow-sm">
                    <p className="text-slate-700 font-medium mb-2">No favorites yet</p>
                    <p className="text-sm text-slate-500 mb-3">Ask ChefMate to generate a recipe and it will appear here.</p>
                    <button 
                      onClick={handleGenerateFavorite}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
                      disabled={favoritesGenerating}
                    >
                      <Heart className="w-4 h-4" /> {favoritesGenerating ? 'Generating…' : 'Ask for a recipe'}
                    </button>
                  </div>
                )}
                {favorites.length > 0 && (
                  <div className="space-y-3">
                    {favorites.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedRecipe(recipe);
                        }}
                      >
                        <h4 className="font-bold text-slate-900 truncate mb-1">{recipe.title}</h4>
                        {recipe.shortDescription && (
                          <p className="text-sm text-slate-600 mb-2">{recipe.shortDescription}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          {recipe.cookTimeMinutes && (
                            <span className="px-2 py-1 bg-slate-100 rounded-full">
                              {recipe.cookTimeMinutes} mins
                            </span>
                          )}
                          {recipe.difficulty && (
                            <span className="px-2 py-1 bg-slate-100 rounded-full">
                              {recipe.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
           </div>
         )}

        {(activeTab === 'fridge' || activeTab === 'inventory') && (
          <div className="flex-1 h-full flex flex-col">
             <Inventory 
               ingredients={inventory}
               onAdd={handleAddIngredient}
               onUpdate={handleUpdateIngredient}
               onRemove={handleRemoveIngredient}
               customBackground={fridgeBg}
               onUpdateBackground={setFridgeBg}
               viewMode={activeTab === 'fridge' ? 'fridge' : 'list'}
               onSwitchView={(mode) => setActiveTab(mode === 'fridge' ? 'fridge' : 'inventory')}
             />
          </div>
        )}

        {activeTab === 'cook' && (
          <div className="flex-1 h-full">
            <CookTab
              inventory={inventory.map((i) => ({
                id: i.id,
                name: i.name,
                icon: ingredientIcon(i.category),
              }))}
              onCook={handleCookWithInventory}
              isLoading={cookGenerating}
            />
          </div>
        )}
      </div>

      {/* Bottom Section: Chat (selected tabs) + Nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex flex-col pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {['fridge', 'shopping', 'favorites'].includes(activeTab) && (
          <div className="px-4 py-3 border-b border-slate-100">
            <form onSubmit={handleHomeInputSubmit} className="flex gap-3 items-center bg-slate-100 p-2 rounded-full pl-5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
               <input 
                 value={homeInput}
                 onChange={e => setHomeInput(e.target.value)}
                 placeholder="Ask ChefMate for ideas..."
                 className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400 font-medium"
               />
               <button 
                 type="submit" 
                 disabled={!homeInput.trim() || favoritesGenerating}
                 className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-300"
               >
                 <Send className="w-4 h-4 ml-0.5" />
               </button>
            </form>
          </div>
        )}
        <div className="flex justify-around items-center px-2 pt-2 pb-3">
           <button 
             onClick={() => setActiveTab('fridge')}
             className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === 'fridge' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Refrigerator className="w-6 h-6" strokeWidth={activeTab === 'fridge' ? 2.5 : 2} />
             <span className="text-[10px]">Fridge</span>
           </button>

           <button 
             onClick={() => setActiveTab('inventory')}
             className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === 'inventory' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Package className="w-6 h-6" strokeWidth={activeTab === 'inventory' ? 2.5 : 2} />
             <span className="text-[10px]">Inventory</span>
           </button>

           <button 
             onClick={() => setActiveTab('cook')}
             className={`-mt-6 flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all ${activeTab === 'cook' ? 'text-white bg-indigo-600 shadow-xl shadow-indigo-200' : 'text-slate-500 bg-indigo-50'} w-14 h-14 justify-center border-2 border-white`}
           >
             <Flame className="w-6 h-6" strokeWidth={2.5} />
             <span className="text-[10px] font-bold">Cook</span>
           </button>

           <button 
             onClick={() => setActiveTab('shopping')}
             className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === 'shopping' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <ShoppingCart className="w-6 h-6" strokeWidth={activeTab === 'shopping' ? 2.5 : 2} />
             <span className="text-[10px]">Shopping</span>
           </button>

           <button 
             onClick={() => setActiveTab('favorites')}
             className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === 'favorites' ? 'text-rose-600 bg-rose-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Heart className="w-6 h-6" strokeWidth={activeTab === 'favorites' ? 2.5 : 2} />
             <span className="text-[10px]">Favorites</span>
           </button>
        </div>
      </div>
      {/* Settings / Preferences Modal */}
      {showPrefs && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowPrefs(false)} />
          <div className="relative w-full sm:w-[400px] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
            
            {/* Settings Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-xl text-slate-900">Settings</h3>
              <button onClick={() => setShowPrefs(false)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto pb-safe">
              {/* User Profile Section */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <div className="flex items-center gap-4 mb-3">
                   <div className="w-16 h-16 rounded-full shadow-sm border-2 border-white bg-indigo-50 text-indigo-700 flex items-center justify-center text-2xl font-bold">
                     {userInitial}
                   </div>
                   <div>
                     <h4 className="text-lg font-bold text-slate-900">{displayName}</h4>
                     <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                   </div>
                 </div>
                 <button
                   onClick={logout}
                   className="mt-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                 >
                   Sign out
                 </button>
              </div>

              {/* Cuisine Preferences */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Cuisine Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {availableCuisines.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all flex-grow text-center ${cuisinePrefs.includes(c) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Other Settings Placeholders */}
              <div className="px-6 pb-6 border-b border-slate-100">
                 <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">App Settings</h4>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                       <span className="font-medium text-slate-700">Notifications</span>
                       <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                       <span className="font-medium text-slate-700">Dark Mode</span>
                       <div className="w-10 h-6 bg-slate-300 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                    </div>
                 </div>
              </div>

              {/* Close Button */}
              <div className="p-6 bg-slate-50">
                <button 
                  onClick={() => setShowPrefs(false)}
                  className="w-full py-4 rounded-xl border border-indigo-100 bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Close
                </button>
                <p className="text-center text-xs text-slate-400 mt-4 font-medium">ChefMate v1.0.2 • Signed in as {displayName}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {showRecipePopup && (
        <RecipePopup
          isOpen={showRecipePopup}
          onClose={() => { setShowRecipePopup(false); setPopupSelectedId(null); }}
          recipes={cookRecipes}
          initialSelectedId={popupSelectedId}
          onRegenerate={handleRegenerateCook}
          isLoading={cookGenerating}
        />
      )}
    </div>
  );
};

export default App;
