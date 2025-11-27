
import React, { useState, useMemo, useRef } from 'react';
import { Ingredient, IngredientCategory } from '../types';
import { 
  Plus, X, Wand2, Loader2, 
  Leaf, Drumstick, Apple, Milk, Croissant, IceCream, Flame, Package,
  Refrigerator, Trash2, Settings2, Upload,
  Carrot, Fish, Beef, Cherry, Banana, Grape, Pizza, Coffee, Cookie, Sandwich
} from 'lucide-react';
import { generateFridgeBackground } from '../services/geminiService';

interface InventoryProps {
  ingredients: Ingredient[];
  onAdd: (name: string, category: IngredientCategory, expiryDate?: string) => void;
  onRemove: (id: string) => void;
  customBackground: string | null;
  onUpdateBackground: (bg: string) => void;
  viewMode: 'fridge' | 'list';
  onSwitchView: (mode: 'fridge' | 'list') => void;
}

// --- Configuration Constants ---

const INITIAL_STYLES: Record<IngredientCategory, { bg: string; border: string; text: string; iconName: string; shadow: string; label: string; customImage?: string }> = {
  'Vegetable': { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white', iconName: 'Leaf', shadow: 'shadow-emerald-900/20', label: 'Veg' },
  'Meat': { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white', iconName: 'Drumstick', shadow: 'shadow-rose-900/20', label: 'Meat' },
  'Fruit': { bg: 'bg-amber-400', border: 'border-amber-300', text: 'text-white', iconName: 'Apple', shadow: 'shadow-amber-900/20', label: 'Fruit' },
  'Dairy': { bg: 'bg-sky-400', border: 'border-sky-300', text: 'text-white', iconName: 'Milk', shadow: 'shadow-sky-900/20', label: 'Dairy' },
  'Grain': { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-white', iconName: 'Croissant', shadow: 'shadow-yellow-900/20', label: 'Grain' },
  'Snack': { bg: 'bg-pink-400', border: 'border-pink-300', text: 'text-white', iconName: 'IceCream', shadow: 'shadow-pink-900/20', label: 'Snack' },
  'Spice': { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-white', iconName: 'Flame', shadow: 'shadow-orange-900/20', label: 'Spice' },
  'Other': { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white', iconName: 'Package', shadow: 'shadow-slate-900/20', label: 'Other' },
};

const INITIAL_POSITIONS: Record<IngredientCategory, { top: number; left: number; rotate: number }> = {
  'Vegetable': { top: 5, left: 5, rotate: -6 },
  'Fruit': { top: 5, left: 55, rotate: 3 },
  'Meat': { top: 25, left: 10, rotate: 2 },
  'Dairy': { top: 25, left: 60, rotate: -2 },
  'Spice': { top: 45, left: 30, rotate: 12 },
  'Grain': { top: 65, left: 5, rotate: -3 },
  'Snack': { top: 65, left: 55, rotate: 6 },
  'Other': { top: 80, left: 35, rotate: -6 },
};

// Available Icons Map
const ICON_MAP: Record<string, React.ElementType> = {
  Leaf, Carrot,
  Drumstick, Fish, Beef,
  Apple, Cherry, Banana, Grape,
  Milk, Coffee,
  Croissant, Sandwich, Pizza,
  IceCream, Cookie,
  Flame, Package
};

// Color Palette for Customization
const COLOR_PALETTE = [
  { bg: 'bg-red-500', border: 'border-red-400', shadow: 'shadow-red-900/20' },
  { bg: 'bg-orange-500', border: 'border-orange-400', shadow: 'shadow-orange-900/20' },
  { bg: 'bg-amber-400', border: 'border-amber-300', shadow: 'shadow-amber-900/20' },
  { bg: 'bg-yellow-400', border: 'border-yellow-300', shadow: 'shadow-yellow-900/20' },
  { bg: 'bg-lime-500', border: 'border-lime-400', shadow: 'shadow-lime-900/20' },
  { bg: 'bg-green-500', border: 'border-green-400', shadow: 'shadow-green-900/20' },
  { bg: 'bg-emerald-500', border: 'border-emerald-400', shadow: 'shadow-emerald-900/20' },
  { bg: 'bg-teal-500', border: 'border-teal-400', shadow: 'shadow-teal-900/20' },
  { bg: 'bg-cyan-500', border: 'border-cyan-400', shadow: 'shadow-cyan-900/20' },
  { bg: 'bg-sky-500', border: 'border-sky-400', shadow: 'shadow-sky-900/20' },
  { bg: 'bg-blue-500', border: 'border-blue-400', shadow: 'shadow-blue-900/20' },
  { bg: 'bg-indigo-500', border: 'border-indigo-400', shadow: 'shadow-indigo-900/20' },
  { bg: 'bg-violet-500', border: 'border-violet-400', shadow: 'shadow-violet-900/20' },
  { bg: 'bg-purple-500', border: 'border-purple-400', shadow: 'shadow-purple-900/20' },
  { bg: 'bg-fuchsia-500', border: 'border-fuchsia-400', shadow: 'shadow-fuchsia-900/20' },
  { bg: 'bg-pink-500', border: 'border-pink-400', shadow: 'shadow-pink-900/20' },
  { bg: 'bg-rose-500', border: 'border-rose-400', shadow: 'shadow-rose-900/20' },
  { bg: 'bg-slate-500', border: 'border-slate-400', shadow: 'shadow-slate-900/20' },
];

export const Inventory: React.FC<InventoryProps> = ({ ingredients, onAdd, onRemove, customBackground, onUpdateBackground, viewMode, onSwitchView }) => {
  const [magnetPositions, setMagnetPositions] = useState(INITIAL_POSITIONS);
  const [magnetStyles, setMagnetStyles] = useState(INITIAL_STYLES);

  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false); 
  
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'All'>('All');
  
  // Form States
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>('Vegetable');
  const [newItemExpiry, setNewItemExpiry] = useState('');

  // Drag States
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    category: IngredientCategory | null;
    startX: number;
    startY: number;
    initialTop: number;
    initialLeft: number;
  }>({ isDragging: false, category: null, startX: 0, startY: 0, initialTop: 0, initialLeft: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragThreshold = 5; 

  const categories: IngredientCategory[] = ['Vegetable', 'Meat', 'Fruit', 'Dairy', 'Grain', 'Snack', 'Spice', 'Other'];

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    categories.forEach(cat => c[cat] = 0);
    ingredients.forEach(i => {
      if (c[i.category] !== undefined) c[i.category]++;
    });
    return c;
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    let items = ingredients;
    if (selectedCategory !== 'All') {
      items = items.filter(i => i.category === selectedCategory);
    }
    return items.sort((a, b) => {
      if (a.expiryDate && b.expiryDate) return a.expiryDate.localeCompare(b.expiryDate);
      if (a.expiryDate) return -1;
      if (b.expiryDate) return 1;
      return 0;
    });
  }, [ingredients, selectedCategory]);

  const handlePointerDown = (e: React.PointerEvent, category: IngredientCategory) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = magnetPositions[category];
    setDragState({
      isDragging: false, 
      category,
      startX: e.clientX,
      startY: e.clientY,
      initialTop: pos.top,
      initialLeft: pos.left,
    });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.category || !containerRef.current) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (!dragState.isDragging && Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
       setDragState(prev => ({ ...prev, isDragging: true }));
    }

    if (dragState.isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = (dx / rect.width) * 100;
      const deltaYPercent = (dy / rect.height) * 100;

      let newLeft = dragState.initialLeft + deltaXPercent;
      let newTop = dragState.initialTop + deltaYPercent;

      newLeft = Math.max(0, Math.min(85, newLeft));
      newTop = Math.max(0, Math.min(85, newTop));

      setMagnetPositions(prev => ({
        ...prev,
        [dragState.category!]: {
          ...prev[dragState.category!],
          top: newTop,
          left: newLeft
        }
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState.category) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      
      if (!dragState.isDragging) {
        setSelectedCategory(dragState.category);
        setIsCustomizing(false); 
        onSwitchView('list'); // Switch to list view directly
      }
      
      setDragState({ isDragging: false, category: null, startX: 0, startY: 0, initialTop: 0, initialLeft: 0 });
    }
  };

  const handleStyleUpdate = (updates: Partial<typeof INITIAL_STYLES['Vegetable']>) => {
    if (selectedCategory === 'All') return;
    setMagnetStyles(prev => ({
      ...prev,
      [selectedCategory]: { ...prev[selectedCategory as IngredientCategory], ...updates }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCategory !== 'All') {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleStyleUpdate({ customImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAdd(newItemName, newItemCategory, newItemExpiry || undefined);
    setNewItemName('');
    setNewItemExpiry('');
    setIsAdding(false);
  };

  const handleGenerateDesign = async () => {
    setIsGenerating(true);
    try {
      const bg = await generateFridgeBackground();
      if (bg) onUpdateBackground(bg);
    } catch (e) {
      alert('Failed to generate fridge design');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStyle = selectedCategory !== 'All' ? magnetStyles[selectedCategory] : null;

  // Render Fridge View
  if (viewMode === 'fridge') {
    return (
      <div className="relative w-full h-full flex flex-col select-none touch-none px-6 pt-2 pb-[180px]">
        {/* Fridge Container with Padding for Floating Bottom Elements */}
        
        {/* --- TOP DOOR (Freezer) --- */}
        <div 
           className="relative h-[32%] min-h-[120px] w-full rounded-t-[2.5rem] rounded-b-xl bg-sky-400 shadow-[0_10px_20px_rgba(0,0,0,0.15),inset_0_-4px_6px_rgba(0,0,0,0.1)] overflow-hidden border-x-4 border-t-4 border-sky-500/30 flex flex-col items-center justify-center z-10"
           style={{ 
             backgroundImage: customBackground ? `url(${customBackground})` : undefined,
             backgroundSize: 'cover',
             backgroundPosition: 'top center'
           }}
        >
           <div className="absolute top-1/4 left-5 w-3 h-20 bg-white/40 rounded-full shadow-sm backdrop-blur-sm border border-white/20"></div>

           <button 
            onClick={handleGenerateDesign}
            className="absolute top-4 right-4 p-2 bg-black/10 backdrop-blur rounded-full text-white/70 hover:bg-black/20 transition-colors z-30"
           >
             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
           </button>

           {/* THE FACE */}
           <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-500 transform scale-90">
              <div className="flex gap-10 mb-3">
                 <div className="w-3 h-5 bg-slate-800 rounded-full animate-bounce [animation-duration:3s]"></div>
                 <div className="w-3 h-5 bg-slate-800 rounded-full animate-bounce [animation-duration:3s] [animation-delay:0.1s]"></div>
              </div>
              <div className="w-12 h-6 border-b-4 border-slate-800 rounded-full"></div>
           </div>
        </div>
        
        {/* Gap */}
        <div className="h-[2%] min-h-[8px]"></div>

        {/* --- BOTTOM DOOR (Main Fridge) --- */}
        <div 
          ref={containerRef}
          className="relative flex-1 w-full rounded-t-xl rounded-b-[2rem] bg-sky-400 shadow-[0_10px_25px_rgba(0,0,0,0.15),inset_0_4px_6px_rgba(0,0,0,0.1)] overflow-hidden border-x-4 border-b-4 border-sky-500/30 z-10"
          style={{ 
            backgroundImage: customBackground ? `url(${customBackground})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center'
          }}
        >
           <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-3 bg-white/40 rounded-full shadow-sm backdrop-blur-sm border border-white/20"></div>

           {categories.map(cat => {
             const count = counts[cat];
             if (count === 0 && !['Vegetable', 'Meat', 'Fruit'].includes(cat)) return null;
             
             const style = magnetStyles[cat];
             const pos = magnetPositions[cat];
             const Icon = ICON_MAP[style.iconName] || Package;
 
             return (
               <div
                 key={cat}
                 onPointerDown={(e) => handlePointerDown(e, cat)}
                 onPointerMove={handlePointerMove}
                 onPointerUp={handlePointerUp}
                 style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                 className={`absolute cursor-grab active:cursor-grabbing transform ${pos.rotate} transition-transform active:scale-95 hover:scale-105 z-20 touch-none`}
               >
                 <div 
                    className={`${style.bg} ${style.shadow} border-2 border-white rounded-xl p-1.5 pr-3 flex items-center gap-2 shadow-lg min-w-[90px] relative overflow-hidden`}
                 >
                    {style.customImage && (
                      <div className="absolute inset-0 z-0">
                         <img src={style.customImage} alt="magnet" className="w-full h-full object-cover opacity-90" />
                         <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    )}

                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center relative z-10 backdrop-blur-sm">
                       <Icon className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                    <div className="flex flex-col leading-none relative z-10">
                      <span className="text-[8px] uppercase font-bold text-white/90 mb-0.5 drop-shadow-sm">{style.label}</span>
                      <span className="text-lg font-black text-white drop-shadow-sm">{count}</span>
                    </div>
                 </div>
               </div>
             );
           })}

           {/* Open Fridge Button */}
           <button 
             onClick={() => { setSelectedCategory('All'); onSwitchView('list'); setIsCustomizing(false); }}
             className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-sky-600 hover:bg-sky-50 px-6 py-2.5 rounded-full font-bold text-xs shadow-xl shadow-sky-900/20 flex items-center gap-2 transition-all active:scale-95 border border-sky-100 z-30"
           >
             <Refrigerator className="w-4 h-4" />
             Open Fridge
           </button>
        </div>

        {/* Fridge Feet */}
        <div className="flex justify-between px-8 -mt-1 z-0">
           <div className="w-8 h-4 bg-slate-300 rounded-b-lg shadow-sm"></div>
           <div className="w-8 h-4 bg-slate-300 rounded-b-lg shadow-sm"></div>
        </div>
      </div>
    );
  }

  // Render List/Inventory View
  return (
    <>
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="p-6 pb-4 bg-white border-b border-slate-100 flex justify-between items-center z-10 sticky top-0">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {selectedCategory === 'All' ? 'Kitchen Inventory' : `${magnetStyles[selectedCategory as IngredientCategory].label} Items`}
            </h3>
            <p className="text-sm text-slate-500">
              {selectedCategory === 'All' ? 'Manage your ingredients' : 'Manage or customize this magnet'}
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        {selectedCategory !== 'All' && (
           <div className="flex border-b border-slate-200 bg-white">
              <button 
                onClick={() => setIsCustomizing(false)}
                className={`flex-1 py-3 text-sm font-bold border-b-2 ${!isCustomizing ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                Ingredients
              </button>
              <button 
                onClick={() => setIsCustomizing(true)}
                className={`flex-1 py-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 ${isCustomizing ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                <Settings2 className="w-4 h-4" /> Customize Magnet
              </button>
           </div>
        )}

        {/* Categories Filter */}
        {selectedCategory === 'All' && (
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedCategory('All')} 
              className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors bg-slate-900 text-white"
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors bg-slate-100 text-slate-600"
              >
                {magnetStyles[cat].label}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 pb-32">
          
          {isCustomizing && selectedCategory !== 'All' && currentStyle ? (
            /* Customization UI */
            <div className="space-y-8">
               {/* ... Existing customization UI ... */}
               <div className="flex flex-col items-center">
                  <div className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Preview</div>
                  <div className={`transform scale-150 ${currentStyle.bg} ${currentStyle.shadow} border-2 border-white rounded-xl p-1.5 pr-3 flex items-center gap-2 shadow-lg min-w-[90px] relative overflow-hidden transition-all duration-300`}>
                      {currentStyle.customImage && (
                        <div className="absolute inset-0 z-0">
                          <img src={currentStyle.customImage} alt="magnet" className="w-full h-full object-cover opacity-90" />
                          <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                      )}
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center relative z-10 backdrop-blur-sm">
                         {React.createElement(ICON_MAP[currentStyle.iconName] || Package, { className: "w-5 h-5 text-white drop-shadow-md" })}
                      </div>
                      <div className="flex flex-col leading-none relative z-10">
                        <span className="text-[8px] uppercase font-bold text-white/90 mb-0.5 drop-shadow-sm">{currentStyle.label}</span>
                        <span className="text-lg font-black text-white drop-shadow-sm">{counts[selectedCategory]}</span>
                      </div>
                  </div>
               </div>

               <div>
                  <div className="mb-3 text-sm font-bold text-slate-400 uppercase tracking-wider">Magnet Color</div>
                  <div className="grid grid-cols-6 gap-3">
                    {COLOR_PALETTE.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleStyleUpdate({ bg: c.bg, border: c.border, shadow: c.shadow, customImage: undefined })}
                        className={`w-10 h-10 rounded-full ${c.bg} shadow-sm border-2 ${currentStyle.bg === c.bg && !currentStyle.customImage ? 'border-slate-900 scale-110' : 'border-transparent'} transition-all`}
                      />
                    ))}
                  </div>
               </div>

               <div>
                  <div className="mb-3 text-sm font-bold text-slate-400 uppercase tracking-wider">Icon</div>
                  <div className="grid grid-cols-6 gap-3">
                    {Object.keys(ICON_MAP).map((iconName) => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => handleStyleUpdate({ iconName })}
                          className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center border-2 ${currentStyle.iconName === iconName ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-100 text-slate-400'} transition-all`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      )
                    })}
                  </div>
               </div>

               <div>
                  <div className="mb-3 text-sm font-bold text-slate-400 uppercase tracking-wider">Custom Photo</div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <p className="text-xs text-slate-500">Click to upload image</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {currentStyle.customImage && (
                    <button onClick={() => handleStyleUpdate({ customImage: undefined })} className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1">
                      <X className="w-3 h-3" /> Remove Photo
                    </button>
                  )}
               </div>
            </div>
          ) : (
            /* Inventory List */
            <div className="space-y-3">
              {filteredIngredients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Package className="w-12 h-12 mb-3 opacity-20" />
                  <p>No ingredients found</p>
                </div>
              ) : (
                filteredIngredients.map(item => {
                   const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                   const itemStyle = magnetStyles[item.category];
                   return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${itemStyle.bg} bg-opacity-10`}>
                           {React.createElement(ICON_MAP[itemStyle.iconName] || Package, { className: `w-5 h-5 ${itemStyle.text.replace('text-white', 'text-current')} opacity-80` })}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{item.name}</h4>
                          <div className="flex items-center gap-2 text-xs">
                             {item.expiryDate && (
                              <span className={`font-medium px-1.5 py-0.5 rounded ${isExpiringSoon ? 'bg-amber-100 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                Exp: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                   );
                })
              )}
            </div>
          )}
        </div>

        {/* Add Button */}
        {!isCustomizing && (
          <div className="p-4 bg-white border-t border-slate-100">
             <button onClick={() => setIsAdding(true)} className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Add New Item</button>
          </div>
        )}
      </div>

      {/* --- ADD ITEM MODAL --- */}
      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300 mb-safe sm:mb-0">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl">Add to Fridge</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Item Name</label>
                 <input autoFocus value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g. Carrots" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map(cat => {
                      const style = magnetStyles[cat];
                      const Icon = ICON_MAP[style.iconName] || Package;
                      return (
                        <button key={cat} type="button" onClick={() => setNewItemCategory(cat)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${newItemCategory === cat ? `${style.bg} border-transparent text-white shadow-md` : 'bg-white border-slate-200 text-slate-400'}`}>
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-[9px] font-bold">{style.label}</span>
                        </button>
                      )
                    })}
                  </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                 <input type="date" value={newItemExpiry} onChange={e => setNewItemExpiry(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>
               <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg mt-2 active:scale-95 transition-transform">Confirm Add</button>
             </form>
          </div>
        </div>
      )}
    </>
  );
};
