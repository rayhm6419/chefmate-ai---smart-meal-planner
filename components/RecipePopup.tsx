import React, { useState, useEffect } from 'react';
import { X, Clock, Zap, ChevronLeft, ChefHat, Heart } from 'lucide-react';
import { CookIdea } from './CookTab';

interface RecipePopupProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: CookIdea[];
  initialSelectedId?: string | null;
  onRegenerate?: () => void;
  isLoading?: boolean;
  favorites?: { recipeId: string }[];
  onToggleFavorite?: (recipe: CookIdea) => Promise<void> | void;
}

const RecipePopup: React.FC<RecipePopupProps> = ({ isOpen, onClose, recipes, initialSelectedId, onRegenerate, isLoading, favorites = [], onToggleFavorite }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<CookIdea | null>(null);
  const [liked, setLiked] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipe(null);
      setLiked(false);
    } else if (initialSelectedId) {
      const found = recipes.find(r => r.id === initialSelectedId);
      setSelectedRecipe(found || null);
    }
  }, [isOpen, initialSelectedId, recipes]);

  useEffect(() => {
    if (selectedRecipe) {
      const isFav = favorites.some(f => f.recipeId === selectedRecipe.id);
      setLiked(isFav);
    }
  }, [favorites, selectedRecipe]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
       {/* Backdrop */}
       <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Main Content Area */}
      <div className="relative w-full max-w-md h-full max-h-[90vh] flex flex-col pointer-events-none z-10">
        
        {/* VIEW 1: The 3 Windows (Selection Mode) */}
        {!selectedRecipe && (
             <div className="flex-1 flex flex-col justify-center space-y-5 pointer-events-auto pb-10">
                 <div className="text-center mb-2 animate-slide-in-down">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3 backdrop-blur-md">
                        <ChefHat className="text-white" size={24} />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">ChefMate found matches!</h2>
                     <p className="text-white/80 text-sm">Select a dish to view details</p>
                     {onRegenerate && (
                       <button
                         onClick={onRegenerate}
                         disabled={isLoading}
                         className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-xs font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isLoading ? 'Generating…' : 'Regenerate dishes'}
                       </button>
                     )}
                 </div>
                 
                 {recipes.map((recipe, index) => (
                     <div 
                        key={index}
                        onClick={() => setSelectedRecipe(recipe)}
                        className={`
                            relative bg-white rounded-2xl p-4 shadow-xl transform transition-all duration-300 cursor-pointer
                            hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5B4DFF]/30
                            active:scale-95
                            animate-pop-up overflow-hidden group
                        `}
                        style={{ animationDelay: `${index * 150}ms` }}
                     >
                        {/* Interactive "Window" Look */}
                        <div className="flex gap-4 items-center">
                            {/* Small Image */}
                            <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                                <img 
                                    src={recipe.imageUrl || `https://picsum.photos/200/200?random=${index + 10}`} 
                                    alt={recipe.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg truncate pr-2">{recipe.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{recipe.shortDescription}</p>
                                
                                <div className="flex items-center gap-2">
                                     <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        <Clock size={10} />
                                        {recipe.estimatedTime ? `${recipe.estimatedTime} min` : '—'}
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${
                                        (recipe.difficulty || '').toLowerCase() === 'easy' ? 'bg-green-100 text-green-700' :
                                        (recipe.difficulty || '').toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        <Zap size={10} />
                                        {recipe.difficulty}
                                    </div>
                                </div>
                            </div>

                            {/* Chevron / CTA */}
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#5B4DFF] group-hover:text-white transition-colors">
                                <ChevronLeft size={18} className="rotate-180" />
                            </div>
                        </div>
                     </div>
                 ))}
                 
                 <button 
                    onClick={onClose} 
                    className="mx-auto mt-6 px-6 py-2 bg-white/10 rounded-full text-white/70 text-sm font-medium hover:bg-white/20 hover:text-white transition-colors pointer-events-auto backdrop-blur-sm"
                 >
                     Close Menu
                 </button>
             </div>
        )}

        {/* VIEW 2: Detail Window (Selected Mode) */}
        {selectedRecipe && (
            <div className="flex-1 flex flex-col justify-end sm:justify-center pointer-events-auto">
                <div className="bg-white w-full h-[85vh] sm:h-auto sm:max-h-[650px] rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-scale-up relative">
                    
                    {/* Hero Image */}
                    <div className="relative h-60 w-full flex-shrink-0">
                        <img 
                            src={selectedRecipe.imageUrl || `https://picsum.photos/600/400?random=${recipes.indexOf(selectedRecipe) + 10}`}
                            className="w-full h-full object-cover"
                            alt={selectedRecipe.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        
                        <button 
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute top-4 left-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10 z-10"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-center justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold leading-tight">{selectedRecipe.title}</h2>
                                </div>
                                <button
                                  onClick={async () => {
                                    if (selectedRecipe && onToggleFavorite) {
                                      try {
                                        setLiked((prev) => !prev);
                                        await onToggleFavorite(selectedRecipe);
                                      } catch (e) {
                                        // rollback on failure
                                        setLiked((prev) => !prev);
                                      }
                                    }
                                  }}
                                  className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-colors ${liked ? 'text-rose-500' : 'text-white'}`}
                                >
                                  <Heart size={20} fill={liked ? '#f43f5e' : 'transparent'} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Details */}
                    <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 no-scrollbar">
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Time</div>
                                    <div className="text-sm font-bold text-gray-900">{selectedRecipe.estimatedTime ? `${selectedRecipe.estimatedTime} min` : '—'}</div>
                                </div>
                             </div>
                             <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Difficulty</div>
                                    <div className="text-sm font-bold text-gray-900">{selectedRecipe.difficulty}</div>
                                </div>
                             </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">About this dish</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {selectedRecipe.shortDescription}
                            </p>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3">Ingredients</h3>
                            <div className="space-y-2">
                                {selectedRecipe.ingredients.map((ing, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#5B4DFF]" />
                                        <span className="text-sm text-gray-600 font-medium">{ing}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedRecipe.steps && selectedRecipe.steps.length > 0 && (
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3">Steps</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                              {selectedRecipe.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                    </div>

                    {/* Footer CTA */}
                    <div className="p-6 pt-4 border-t border-gray-100 bg-white z-20">
                        <button className="w-full py-4 bg-[#1E2030] text-white font-bold rounded-2xl shadow-lg shadow-gray-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                            <ChefHat size={20} />
                            Start Cooking
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes pop-up {
            0% { transform: translateY(100px) scale(0.9); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-pop-up {
            animation: pop-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        @keyframes scale-up {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
            animation: scale-up 0.3s ease-out forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
         @keyframes slide-in-down {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-down {
            animation: slide-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RecipePopup;
