
import React, { useState, useCallback, useRef } from 'react';
import { Planner } from './components/Planner';
import { Inventory } from './components/Inventory';
import { AIChat } from './components/AIChat';
import { ShoppingList } from './components/ShoppingList';
import { AuthScreen } from './components/AuthScreen';
import { Ingredient, IngredientCategory, MealPlan, ChatMessage, CuisineType, ShoppingItem } from './types';
import { createChatSession, generateMealSuggestion } from './services/geminiService';
import { Chat } from "@google/genai";
import { Settings, X, Send, Refrigerator, Package, ShoppingCart, LogOut, User, Heart } from 'lucide-react';

type Tab = 'fridge' | 'inventory' | 'shopping' | 'favorites';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string; email: string; avatar?: string} | null>(null);

  // --- App Data State ---
  const [inventory, setInventory] = useState<Ingredient[]>([
    { id: '1', name: 'Chicken Breast', category: 'Meat', expiryDate: '2023-11-25' },
    { id: '2', name: 'Bok Choy', category: 'Vegetable', expiryDate: '2023-11-23' },
    { id: '3', name: 'Rice', category: 'Grain' },
    { id: '4', name: 'Soy Sauce', category: 'Spice' },
    { id: '5', name: 'Eggs', category: 'Dairy', expiryDate: '2023-11-28' },
    { id: '6', name: 'Apples', category: 'Fruit', expiryDate: '2023-12-05' },
    { id: '7', name: 'Milk', category: 'Dairy', expiryDate: '2023-11-30' },
    { id: '8', name: 'Chili Oil', category: 'Spice' },
  ]);

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    { id: '1', name: 'Garlic', checked: false },
    { id: '2', name: 'Oyster Sauce', checked: true },
  ]);

  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [homeInput, setHomeInput] = useState('');
  
  const chatSessionRef = useRef<Chat | null>(null);
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

  const handleLogin = (user: { name: string; email: string; avatar?: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowPrefs(false);
    // Reset tab to fridge just in case
    setActiveTab('fridge');
  };

  const toggleCuisine = (c: CuisineType) => {
    setCuisinePrefs(prev => 
      prev.includes(c) ? prev.filter(i => i !== c) : [...prev, c]
    );
  };

  const handleAddIngredient = (name: string, category: IngredientCategory, expiryDate?: string) => {
    const newItem: Ingredient = {
      id: Date.now().toString(),
      name,
      category,
      expiryDate
    };
    setInventory(prev => [...prev, newItem]);
  };

  const handleRemoveIngredient = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
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


  const handleSendMessage = useCallback(async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }

    // Call API
    const responseText = await generateMealSuggestion(
      chatSessionRef.current,
      text,
      inventory,
      mealPlan,
      selectedDate,
      cuisinePrefs
    );

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, modelMsg]);
    setIsChatLoading(false);
  }, [inventory, mealPlan, selectedDate, cuisinePrefs]);

  const handleHomeInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;
    
    setIsChatOpen(true);
    handleSendMessage(homeInput);
    setHomeInput('');
  };

  // If not authenticated, show Auth Screen
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
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
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
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
               <div className="border border-dashed border-rose-200 rounded-2xl p-4 bg-white shadow-sm">
                 <p className="text-slate-700 font-medium mb-2">No favorites yet</p>
                 <p className="text-sm text-slate-500 mb-3">Chat with ChefMate or add recipes to pin them here for fast planning.</p>
                 <button 
                   onClick={() => setIsChatOpen(true)}
                   className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
                 >
                   <Heart className="w-4 h-4" /> Ask for a recipe
                 </button>
               </div>
             </div>
           </div>
         )}

         {(activeTab === 'fridge' || activeTab === 'inventory') && (
           <div className="flex-1 h-full flex flex-col">
              <Inventory 
                ingredients={inventory}
                onAdd={handleAddIngredient}
                onRemove={handleRemoveIngredient}
                customBackground={fridgeBg}
                onUpdateBackground={setFridgeBg}
                viewMode={activeTab === 'fridge' ? 'fridge' : 'list'}
                onSwitchView={(mode) => setActiveTab(mode === 'fridge' ? 'fridge' : 'inventory')}
              />
           </div>
         )}
      </div>

      {/* Bottom Section: Input + Nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex flex-col pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        
        {/* Chat Input Bar (Floating above tabs) */}
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
               disabled={!homeInput.trim()}
               className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-300"
             >
               <Send className="w-4 h-4 ml-0.5" />
             </button>
          </form>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
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

      {/* Chat Modal Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
           <AIChat 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              onClose={() => setIsChatOpen(false)}
           />
        </div>
      )}

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
                   <img 
                     src={currentUser?.avatar} 
                     alt="Profile" 
                     className="w-16 h-16 rounded-full shadow-sm border-2 border-white" 
                   />
                   <div>
                     <h4 className="text-lg font-bold text-slate-900">{currentUser?.name}</h4>
                     <p className="text-sm text-slate-500 font-medium">{currentUser?.email}</p>
                   </div>
                 </div>
                 <button className="text-sm text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1">
                   Edit Profile
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

              {/* Logout Button */}
              <div className="p-6 bg-slate-50">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 rounded-xl border border-red-100 bg-white text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogOut className="w-5 h-5" /> Log Out
                </button>
                <p className="text-center text-xs text-slate-400 mt-4 font-medium">ChefMate v1.0.2</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
