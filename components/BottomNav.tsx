
import React from 'react';
import { ChefHat, Heart, ListChecks } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'Inventory', icon: ListChecks },
    { id: 'Cook', icon: ChefHat, isPrimary: true },
    { id: 'Favorites', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 pb-6 pt-3 flex justify-around items-end z-40 max-w-screen-xl mx-auto rounded-t-[40px] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        if (tab.isPrimary) {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center group"
            >
              <div className={`
                w-16 h-16 mb-2 flex items-center justify-center rounded-full transition-all duration-300 transform
                ${isActive 
                  ? 'bg-orange-500 text-white shadow-xl shadow-orange-200 -translate-y-8 scale-110' 
                  : 'bg-white text-gray-400 border-4 border-gray-50 shadow-lg -translate-y-6 hover:-translate-y-7'}
              `}>
                <Icon className="w-7 h-7" />
              </div>
              <span className={`
                absolute -bottom-1 text-[10px] font-black uppercase tracking-widest transition-colors
                ${isActive ? 'text-orange-600' : 'text-gray-400 opacity-0 group-hover:opacity-100'}
              `}>
                {tab.id}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 mb-1 transition-all flex-1 ${
              isActive ? 'text-orange-500' : 'text-gray-300 hover:text-gray-500'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-orange-50' : ''}`}>
              {(() => {
                const Icon = tab.icon;
                return <Icon className="w-5 h-5" />;
              })()}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.id}</span>
          </button>
        );
      })}
    </nav>
  );
};
