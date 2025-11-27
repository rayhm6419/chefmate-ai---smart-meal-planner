
import React, { useState } from 'react';
import { ShoppingItem } from '../types';
import { Plus, Trash2, Check, ShoppingCart } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  onAddItem: (name: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, onAddItem, onToggleItem, onRemoveItem }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName);
    setNewItemName('');
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-6 pb-4 bg-white border-b border-slate-100 sticky top-0 z-10">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-indigo-600" />
          Shopping List
        </h3>
        <p className="text-sm text-slate-500">Don't forget what you need</p>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-b border-slate-100">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add item (e.g. Milk)..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="bg-indigo-600 disabled:bg-slate-300 text-white w-12 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
            <p>Your list is empty</p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                item.checked
                  ? 'bg-slate-100 border-transparent opacity-60'
                  : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <button
                onClick={() => onToggleItem(item.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  item.checked
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 text-transparent hover:border-indigo-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              
              <span className={`flex-1 font-bold text-lg ${item.checked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {item.name}
              </span>

              <button 
                onClick={() => onRemoveItem(item.id)} 
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
