
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'Inventory', icon: 'fa-list-check' },
    { id: 'Cook', icon: 'fa-utensils', isPrimary: true },
    { id: 'Favorites', icon: 'fa-heart' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 pb-6 pt-3 flex justify-around items-end z-40 max-w-screen-xl mx-auto rounded-t-[40px] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        if (tab.isPrimary) {
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
                <i className={`fa-solid ${tab.icon} text-2xl`}></i>
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
              <i className={`fa-solid ${tab.icon} text-lg`}></i>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.id}</span>
          </button>
        );
      })}
    </nav>
  );
};
