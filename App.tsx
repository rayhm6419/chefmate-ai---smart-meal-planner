
import React, { useCallback, useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { DatePicker } from './components/DatePicker';
import { CookTab } from './components/CookTab';
import { Inventory } from './_legacy_ui/components/Inventory';
import { Ingredient } from './types';
import { createInventoryItem, deleteInventoryItem, listInventoryItems, updateInventoryItem } from './services/inventoryService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Cook');
  const [selectedDate, setSelectedDate] = useState('Mon');
  const [inventoryItems, setInventoryItems] = useState<Ingredient[]>([]);

  const loadInventory = useCallback(async () => {
    try {
      const items = await listInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to load inventory items', error);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAddInventory = useCallback(async (
    name: string,
    category: Ingredient['category'],
    expiryDate?: string,
    quantity?: number,
    unit?: string
  ) => {
    try {
      const created = await createInventoryItem(name, category, expiryDate, quantity, unit);
      setInventoryItems(prev => [...prev, created]);
    } catch (error) {
      console.error('Failed to add inventory item', error);
      alert('Failed to add inventory item.');
    }
  }, []);

  const handleUpdateInventory = useCallback(async (
    id: string,
    name: string,
    category: Ingredient['category'],
    expiryDate?: string,
    quantity?: number,
    unit?: string
  ) => {
    try {
      const updated = await updateInventoryItem(id, name, category, expiryDate, quantity, unit);
      setInventoryItems(prev => prev.map(item => (item.id === id ? updated : item)));
    } catch (error) {
      console.error('Failed to update inventory item', error);
      alert('Failed to update inventory item.');
    }
  }, []);

  const handleRemoveInventory = useCallback(async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setInventoryItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove inventory item', error);
      alert('Failed to remove inventory item.');
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Cook':
        return (
          <CookTab />
        );
      case 'Inventory':
        return (
          <Inventory
            ingredients={inventoryItems}
            onAdd={handleAddInventory}
            onRemove={handleRemoveInventory}
            onUpdate={handleUpdateInventory}
          />
        );
      case 'Favorites':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
               <i className="fa-solid fa-heart text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Favorite Recipes</h2>
            <p className="text-gray-500 mt-2 max-w-xs">Your most loved dishes saved for later.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* App Bar Simulation */}
      <header className="bg-white px-6 pt-8 pb-2 flex justify-between items-center max-w-screen-xl mx-auto">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
               <i className="fa-solid fa-hat-chef text-lg"></i>
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Welcome back,</p>
               <h3 className="font-bold text-gray-800 leading-none">Chef Alex</h3>
            </div>
         </div>
         <div className="flex gap-2">
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
               <i className="fa-solid fa-bell"></i>
            </button>
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
               <i className="fa-solid fa-magnifying-glass"></i>
            </button>
         </div>
      </header>

      {/* Global Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Dynamic Content */}
      <main className="animate-in fade-in duration-500">
        {renderContent()}
      </main>

      {/* Global Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
