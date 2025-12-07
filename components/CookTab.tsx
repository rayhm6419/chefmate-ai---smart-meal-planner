import React, { useState } from 'react';

type CookItem = {
  id: string;
  name: string;
  icon?: string;
};

type Props = {
  inventory: CookItem[];
};

export const CookTab: React.FC<Props> = ({ inventory }) => {
  const [potItems, setPotItems] = useState<CookItem[]>([]);
  const [cooking, setCooking] = useState(false);
  const [recipe, setRecipe] = useState<{ name: string; desc: string } | null>(null);

  const addToPot = (item: CookItem) => {
    if (!potItems.find((i) => i.id === item.id)) {
      setPotItems((prev) => [...prev, item]);
    }
  };

  const cook = () => {
    if (potItems.length === 0) return;
    setCooking(true);
    setTimeout(() => {
      setCooking(false);
      setRecipe({
        name: 'ChefMate Special Stir-Fry',
        desc: `A delicious mix of ${potItems.map((i) => i.name).join(' & ')}!`,
      });
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-b from-indigo-50/50 to-white pb-32">
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {recipe ? (
          <div className="mx-6 bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 animate-fade-in text-center">
            <div className="text-4xl mb-2">🥘</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{recipe.name}</h3>
            <p className="text-slate-500 text-sm mb-4">{recipe.desc}</p>
            <button
              onClick={() => {
                setRecipe(null);
                setPotItems([]);
              }}
              className="bg-indigo-600 text-white w-full py-3 rounded-xl font-bold"
            >
              Cook Again
            </button>
          </div>
        ) : (
          <>
            <div
              className={`w-48 h-40 bg-slate-800 rounded-b-[3rem] rounded-t-xl relative flex items-center justify-center transition-all duration-300 ${
                cooking ? 'animate-bounce' : ''
              }`}
            >
              <div className="flex gap-8 mt-4">
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="absolute top-24 w-8 h-4 border-b-2 border-white/50 rounded-full" />

              {potItems.length > 0 && (
                <div className="absolute -top-8 flex gap-2 opacity-40">
                  <div className="w-1 h-6 bg-slate-400 rounded-full animate-pulse" />
                  <div className="w-1 h-8 bg-slate-400 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-5 bg-slate-400 rounded-full animate-pulse delay-150" />
                </div>
              )}

              {potItems.length > 0 && (
                <div className="absolute -right-2 -top-2 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {potItems.length}
                </div>
              )}
            </div>

            <button
              onClick={cook}
              disabled={potItems.length === 0}
              className={`mt-8 px-10 py-3 rounded-full font-bold shadow-lg transition-all ${
                potItems.length > 0 ? 'bg-indigo-600 text-white hover:scale-105' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {cooking ? 'Cooking...' : 'Start Cooking'}
            </button>
          </>
        )}
      </div>

      <div className="bg-white border-t border-slate-100 p-4 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add from Fridge</h4>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {inventory.map((item) => {
            const added = potItems.find((i) => i.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => addToPot(item)}
                className={`flex-shrink-0 p-3 rounded-2xl border flex flex-col items-center w-20 transition-all ${
                  added ? 'bg-indigo-50 border-indigo-200 opacity-50' : 'bg-white border-slate-100 hover:border-indigo-300'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon || '🥕'}</span>
                <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
