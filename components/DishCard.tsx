
import React from 'react';
import { Dish } from '../types';
import { getRecipeImageUrl } from '../utils/recipeImageMap';
import { RecipeThumbnail } from './RecipeThumbnail';

interface DishCardProps {
  dish: Dish;
  onClick: (dish: Dish) => void;
  layout: 'list' | 'grid';
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onClick, layout }) => {
  const isGrid = layout === 'grid';
  const imageUrl = getRecipeImageUrl(dish);

  return (
    <div 
      onClick={() => onClick(dish)}
      className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex ${isGrid ? 'flex-col' : 'flex-row h-32 md:h-40'}`}
    >
      <div className={`relative ${isGrid ? 'w-full aspect-[4/3]' : 'w-1/3 md:w-1/4'}`}>
        <RecipeThumbnail
          title={dish.title}
          imageUrl={imageUrl}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play overlay for video-first feel */}
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-play text-orange-500 ml-1"></i>
          </div>
        </div>
      </div>

      <div className={`p-4 flex flex-col justify-between ${isGrid ? 'flex-1' : 'w-2/3 md:w-3/4'}`}>
        <div>
          <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {dish.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{dish.description}</p>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center text-[11px] font-medium text-gray-600">
            <i className="fa-regular fa-clock mr-1 text-gray-400"></i>
            {dish.timeMins} min
          </div>
          <div className="flex items-center text-[11px] font-medium text-gray-600">
            <i className="fa-solid fa-fire-flame-curved mr-1 text-gray-400"></i>
            {dish.calories} kcal
          </div>
          <div className="flex items-center text-[11px] font-medium text-gray-600">
            <i className="fa-solid fa-star mr-1 text-yellow-400"></i>
            {dish.rating}
          </div>
        </div>
      </div>
    </div>
  );
};
