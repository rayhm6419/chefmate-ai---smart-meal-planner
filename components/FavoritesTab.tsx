import React, { useEffect, useState } from "react";
import { CookIdea } from "../types";
import { DishCard } from "./DishCard";
import { RecipeModal } from "./RecipeModal";
import { getFavorites, toggleFavorite } from "../services/favoritesStore";

interface FavoritesTabProps {
  isActive: boolean;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ isActive }) => {
  const [favorites, setFavorites] = useState<CookIdea[]>([]);
  const [selectedDish, setSelectedDish] = useState<CookIdea | null>(null);

  useEffect(() => {
    if (!isActive) return;
    let isMounted = true;
    getFavorites().then((items) => {
      if (!isMounted) return;
      setFavorites(items);
    });
    return () => {
      isMounted = false;
    };
  }, [isActive]);

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-screen-xl mx-auto px-4 sm:px-6">
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">Favorites</h1>
        <p className="text-sm text-gray-500">Your saved recipes.</p>
      </div>

      <div className="flex-1">
        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="text-4xl mb-3 opacity-20">⭐️</div>
            <p className="text-gray-400 font-medium">No favorites yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((idea) => (
              <DishCard
                key={idea.id}
                dish={idea}
                layout="list"
                onClick={setSelectedDish}
                isFavorite
                onToggleFavorite={async (item) => {
                  const next = await toggleFavorite(item);
                  setFavorites(next);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <RecipeModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onFavoritesUpdated={(next) => setFavorites(next)}
      />
    </div>
  );
};
