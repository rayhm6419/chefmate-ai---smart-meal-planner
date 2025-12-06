import React from 'react';
import { X } from 'lucide-react';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<Props> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[520px] max-h-[90vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-rose-500 font-bold">Recipe</p>
            <h3 className="text-lg font-bold text-slate-900 truncate">{recipe.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {recipe.shortDescription && (
            <p className="text-sm text-slate-600">{recipe.shortDescription}</p>
          )}

          <div className="flex gap-2 flex-wrap text-xs text-slate-600">
            {recipe.cookTimeMinutes && (
              <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold">
                {recipe.cookTimeMinutes} mins
              </span>
            )}
            {recipe.difficulty && (
              <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold">
                {recipe.difficulty}
              </span>
            )}
            {recipe.servings && (
              <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold">
                {recipe.servings} servings
              </span>
            )}
          </div>

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Ingredients</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-semibold text-slate-900">{ing.name}</span>
                    {(ing.quantity || ing.note || ing.unit) && (
                      <span className="text-slate-600">
                        {ing.quantity ? `${ing.quantity} ` : ''}
                        {ing.unit ? `${ing.unit} ` : ''}
                        {ing.note || ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                {recipe.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {recipe.tips && recipe.tips.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {recipe.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
