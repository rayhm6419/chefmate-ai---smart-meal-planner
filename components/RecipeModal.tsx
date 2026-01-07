
import React, { useEffect, useState } from 'react';
import { CookIdea } from '../types';
import { Heart, X } from 'lucide-react';
import { getRecipeImageUrl } from '../utils/recipeImageMap';
import { RecipeThumbnail } from './RecipeThumbnail';
import { CookingModal } from './CookingModal';
import { getFavorites, toggleFavorite } from '../services/favoritesStore';

interface RecipeModalProps {
  dish: CookIdea | null;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ dish, onClose }) => {
  if (!dish) return null;
  const imageUrl = getRecipeImageUrl(dish);
  const [isCookingOpen, setIsCookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getFavorites().then((favs) => {
      if (!isMounted) return;
      setIsFavorite(favs.some((idea) => idea.id === dish.id));
    });
    return () => {
      isMounted = false;
    };
  }, [dish.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-all animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-slide-up"
      >
        <div className="relative h-64">
          <RecipeThumbnail title={dish.title} imageUrl={imageUrl} className="h-full w-full rounded-none" />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Close"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={async () => {
              const next = await toggleFavorite(dish);
              setIsFavorite(next.some((idea) => idea.id === dish.id));
            }}
            className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
              isFavorite ? "bg-white/90 text-orange-500" : "bg-white/20 text-white hover:bg-white/40"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            type="button"
          >
            <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {dish.category || "Dish"}
            </span>
            <div className="flex items-center text-[11px] font-medium text-gray-400 ml-auto">
              <i className="fa-solid fa-star text-yellow-400 mr-1"></i>
              {(dish.rating ?? 4.6).toFixed(1)} (124 reviews)
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{dish.title}</h2>
          <p className="text-gray-500 leading-relaxed mb-6">{dish.shortDescription}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mr-3">
                <i className="fa-regular fa-clock text-orange-500"></i>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium">PREP TIME</div>
                <div className="text-sm font-bold text-gray-800">{dish.estimatedTime} min</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mr-3">
                <i className="fa-solid fa-fire-flame-curved text-orange-500"></i>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium">CALORIES</div>
                <div className="text-sm font-bold text-gray-800">{dish.calories ?? 420} kcal</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
             <h4 className="font-bold text-gray-800 mb-3">Key Ingredients</h4>
             <div className="flex flex-wrap gap-2">
               {dish.ingredients.map((ing, idx) => (
                 <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                    {ing}
                 </span>
               ))}
             </div>
          </div>

          <button
            onClick={() => setIsCookingOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <i className="fa-solid fa-bowl-food"></i>
            Start Cooking
          </button>
        </div>
      </div>

      <CookingModal
        isOpen={isCookingOpen}
        onClose={() => setIsCookingOpen(false)}
        recipe={dish}
      />
      
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};
