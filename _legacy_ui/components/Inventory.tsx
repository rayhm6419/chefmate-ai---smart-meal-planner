
import React, { useState, useMemo } from 'react';
import { Ingredient, IngredientCategory } from '../../types';
import {
  Plus, X,
  Leaf, Drumstick, Apple, Milk, IceCream, Package,
  Trash2, Settings2, Upload,
  Carrot, Fish, Beef, Cherry, Banana, Grape, Pizza, Coffee, Cookie, Sandwich
} from 'lucide-react';

interface InventoryProps {
  ingredients: Ingredient[];
  onAdd: (name: string, category: IngredientCategory, expiryDate?: string, quantity?: number, unit?: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string, category: IngredientCategory, expiryDate?: string, quantity?: number, unit?: string) => void;
}

// --- Configuration Constants ---

const INITIAL_STYLES: Record<IngredientCategory, { bg: string; border: string; text: string; iconName: string; shadow: string; label: string; customImage?: string }> = {
  'Vegetable': { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white', iconName: 'Leaf', shadow: 'shadow-emerald-900/20', label: 'Veg' },
  'Meat': { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white', iconName: 'Drumstick', shadow: 'shadow-rose-900/20', label: 'Meat' },
  'Seafood': { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-white', iconName: 'Fish', shadow: 'shadow-cyan-900/20', label: 'Seafood' },
  'Fruit': { bg: 'bg-amber-400', border: 'border-amber-300', text: 'text-white', iconName: 'Apple', shadow: 'shadow-amber-900/20', label: 'Fruit' },
  'Dairy': { bg: 'bg-sky-400', border: 'border-sky-300', text: 'text-white', iconName: 'Milk', shadow: 'shadow-sky-900/20', label: 'Dairy' },
  'Frozen': { bg: 'bg-indigo-500', border: 'border-indigo-400', text: 'text-white', iconName: 'IceCream', shadow: 'shadow-indigo-900/20', label: 'Frozen' },
  'Other': { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white', iconName: 'Package', shadow: 'shadow-slate-900/20', label: 'Other' },
};

// Available Icons Map
const ICON_MAP: Record<string, React.ElementType> = {
  Leaf, Carrot,
  Drumstick, Fish, Beef,
  Apple, Cherry, Banana, Grape,
  Milk, Coffee,
  Sandwich, Pizza,
  IceCream, Cookie,
  Package
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

export const Inventory: React.FC<InventoryProps> = ({ ingredients, onAdd, onRemove, onUpdate }) => {
  const [magnetStyles, setMagnetStyles] = useState(INITIAL_STYLES);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false); 
  
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'All'>('All');
  
  // Editor form state (shared create/edit)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<IngredientCategory>('Vegetable');
  const [formExpiry, setFormExpiry] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('');

  const categories: IngredientCategory[] = ['Vegetable', 'Meat', 'Seafood', 'Fruit', 'Dairy', 'Frozen', 'Other'];

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

  const openCreateEditor = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Vegetable');
    setFormExpiry('');
    setFormQuantity('');
    setFormUnit('');
    setIsEditorOpen(true);
  };
  
  const openEditEditor = (item: Ingredient) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormExpiry(item.expiryDate || '');
    setFormQuantity(item.quantity?.toString() || '');
    setFormUnit(item.unit || '');
    setIsEditorOpen(true);
  };
  
  const handleEditorSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim()) return;
    const quantity = formQuantity ? parseInt(formQuantity) : undefined;
    console.log('[Inventory UI] Add clicked', { formName, formCategory, formExpiry, quantity, formUnit });
    
    if (editingItem) {
      onUpdate(editingItem.id, formName, formCategory, formExpiry || undefined, quantity, formUnit || undefined);
    } else {
      onAdd(formName, formCategory, formExpiry || undefined, quantity, formUnit || undefined);
    }

    setIsEditorOpen(false);
  };
  
  const handleEditorCancel = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
  };

  const currentStyle = selectedCategory !== 'All' ? magnetStyles[selectedCategory] : null;

  // Render List/Inventory View
  return (
    <>
      <div className="flex flex-col h-[calc(100vh-220px)] bg-slate-50 pb-16">
        {/* Header */}
        <div className="p-6 pb-3 bg-white border-b border-slate-100 flex justify-between items-center gap-4 z-10 sticky top-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-slate-900 truncate">
              {selectedCategory === 'All'
                ? 'Kitchen Inventory'
                : `${magnetStyles[selectedCategory as IngredientCategory].label} Items`}
            </h3>
            <p className="text-sm text-slate-500">
              {selectedCategory === 'All'
                ? 'Manage your ingredients'
                : 'Manage or customize this magnet'}
            </p>
          </div>
          <button
            onClick={openCreateEditor}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold shadow-md active:scale-95 transition-transform flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>

        {/* Category Pills - always visible so you can switch freely */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setIsCustomizing(false);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {magnetStyles[cat].label}
              </button>
            );
          })}
        </div>

        {/* Tabs for Ingredients / Customize Magnet (only for specific category) */}
        {selectedCategory !== 'All' && (
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setIsCustomizing(false)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 ${
                !isCustomizing
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setIsCustomizing(true)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 flex items-center justify-center gap-2 ${
                isCustomizing
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <Settings2 className="w-4 h-4" /> Customize Magnet
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50 pb-16">
          
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
            const itemStyle = magnetStyles[item.category as keyof typeof magnetStyles] ?? magnetStyles.Other ?? magnetStyles['Vegetable'] ?? magnetStyles['Other'];
            const Icon = ICON_MAP[itemStyle?.iconName as keyof typeof ICON_MAP] || Package;
                   return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between group">
                        <div 
                          className="flex items-center gap-4 flex-1 cursor-pointer"
                          onClick={() => openEditEditor(item)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${itemStyle.bg} bg-opacity-10 flex-shrink-0`}>
                             {React.createElement(ICON_MAP[itemStyle.iconName] || Package, { className: `w-5 h-5 ${itemStyle.text.replace('text-white', 'text-current')} opacity-80` })}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">{item.name}</h4>
                            <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
                              {(item.quantity !== undefined && item.quantity !== null) && (
                                <span className="font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                                  {item.quantity} {item.unit || 'pcs'}
                                </span>
                              )}
                              {item.expiryDate && (
                                <span className={`font-medium px-1.5 py-0.5 rounded ${isExpiringSoon ? 'bg-amber-100 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                  Exp: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('[Inventory UI] delete id', item.id, item);
                            onRemove(item.id);
                          }} 
                          type="button"
                          disabled={false}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                   );
                })
              )}
            </div>
          )}
          
        </div>
      </div>

      {/* --- EDIT/ADD SHEET --- */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleEditorCancel} />
          <div className="relative w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300 mb-safe sm:mb-0">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl">
                  {editingItem ? `Edit ${editingItem.name}` : 'Add New Item'}
                </h3>
                <button onClick={handleEditorCancel} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
             </div>
             <form onSubmit={handleEditorSave} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Item Name</label>
                 <input autoFocus value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Carrots" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map(cat => {
                      const style = magnetStyles[cat];
                      const Icon = ICON_MAP[style.iconName] || Package;
                      return (
                        <button key={cat} type="button" onClick={() => setFormCategory(cat)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${formCategory === cat ? `${style.bg} border-transparent text-white shadow-md` : 'bg-white border-slate-200 text-slate-400'}`}>
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-[9px] font-bold">{style.label}</span>
                        </button>
                      )
                    })}
                  </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Quantity & Unit</label>
                 <div className="flex gap-2">
                   <input 
                     type="number" 
                     value={formQuantity} 
                     onChange={e => setFormQuantity(e.target.value)} 
                     placeholder="Quantity (optional)"
                     min="0"
                     className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                   />
                   <input 
                     type="text" 
                     value={formUnit} 
                     onChange={e => setFormUnit(e.target.value)} 
                     placeholder="Unit (e.g. kg, pcs)"
                     className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                 <input type="date" value={formExpiry} onChange={e => setFormExpiry(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" />
               </div>
               <div className="flex gap-3 pt-2">
                 <button type="button" onClick={handleEditorCancel} className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl bg-white hover:bg-slate-50 transition-colors">Cancel</button>
                 <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform">Save</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
};
