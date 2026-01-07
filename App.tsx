
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { DatePicker } from './components/DatePicker';
import { CookTab } from './components/CookTab';
import { Inventory } from './_legacy_ui/components/Inventory';
import { FavoritesTab } from './components/FavoritesTab';
import { AuthScreen } from './components/AuthScreen';
import { Ingredient } from './types';
import { createInventoryItem, deleteInventoryItem, listInventoryItems, updateInventoryItem } from './services/inventoryService';
import { clearDisplayName, getDisplayName, saveDisplayName } from './services/secureStorage';
import { useAuth } from './services/auth/AuthProvider';

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Cook');
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const [inventoryItems, setInventoryItems] = useState<Ingredient[]>([]);
  const [displayName, setDisplayName] = useState('Chef');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');

  const headerName = useMemo(() => displayName || 'Chef', [displayName]);

  const loadInventory = useCallback(async () => {
    try {
      const items = await listInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to load inventory items', error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadInventory();
  }, [loadInventory, user]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!user) {
        setDisplayName('Chef');
        return;
      }
      const storedName = await getDisplayName();
      if (isMounted) {
        setDisplayName(storedName?.trim() || 'Chef');
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

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
          <CookTab selectedDate={selectedDate} />
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
          <FavoritesTab isActive={activeTab === 'Favorites'} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {loading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500">
          Loading...
        </div>
      )}
      {!loading && !user && <AuthScreen />}
      {!loading && user && (
        <>
      {/* App Bar Simulation */}
      <header className="relative bg-white px-6 pt-8 pb-2 flex justify-between items-center max-w-screen-xl mx-auto">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
               <i className="fa-solid fa-hat-chef text-lg"></i>
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Welcome back,</p>
               <h3 className="font-bold text-gray-800 leading-none">{headerName}</h3>
            </div>
         </div>
         <div className="flex gap-2">
            <button
              className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 hover:text-gray-600"
              aria-label="Settings"
              type="button"
              onClick={() => {
                setDraftName(displayName);
                setIsSettingsOpen((open) => !open);
              }}
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 hover:text-gray-600"
              aria-label="Logout"
              type="button"
              onClick={async () => {
                await clearDisplayName();
                await logout();
              }}
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
         {isSettingsOpen && (
           <div className="absolute right-6 top-[4.5rem] w-64 rounded-2xl bg-white shadow-xl border border-gray-100 p-4 z-40">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
               Display Name
             </label>
             <input
               value={draftName}
               onChange={(event) => setDraftName(event.target.value)}
               placeholder="Chef"
               className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
             />
             <div className="mt-3 flex gap-2">
               <button
                 type="button"
                 onClick={() => setIsSettingsOpen(false)}
                 className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 type="button"
                 onClick={async () => {
                   const nextName = draftName.trim() || 'Chef';
                   setDisplayName(nextName);
                   await saveDisplayName(nextName);
                   setIsSettingsOpen(false);
                 }}
                 className="flex-1 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-orange-100 hover:bg-orange-600"
               >
                 Save
               </button>
             </div>
           </div>
         )}
      </header>

      {/* Global Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Dynamic Content */}
      <main className="animate-in fade-in duration-500">
        {renderContent()}
      </main>

      {/* Global Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
};

export default App;
