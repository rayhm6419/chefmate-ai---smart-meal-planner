import React, { useEffect, useMemo, useState } from "react";
import { CookIdea } from "../types";
import { getRecipeVideoUrl } from "../utils/recipeVideoMap";
import { X } from "lucide-react";
import { getRecipeImageUrl } from "../utils/recipeImageMap";
import { RecipeThumbnail } from "./RecipeThumbnail";

interface CookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: CookIdea;
}

const STORAGE_KEY = "activeCookingSession";

const getFallbackSteps = (recipe: CookIdea): string[] => {
  if (recipe.steps?.length) {
    return recipe.steps;
  }
  if (recipe.ingredients?.length) {
    return [
      "Prep ingredients and tools.",
      "Cook according to the recipe details.",
      "Plate and serve.",
    ];
  }
  return ["Follow the recipe details."];
};

export const CookingModal: React.FC<CookingModalProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const steps = useMemo(() => getFallbackSteps(recipe), [recipe]);
  const totalSteps = steps.length;

  useEffect(() => {
    if (!isOpen) return;
    setVideoError(false);
    const sessionRaw = localStorage.getItem(STORAGE_KEY);
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        const sessionId = session?.recipeId;
        const recipeId = recipe.id || recipe.title;
        if (sessionId && sessionId === recipeId) {
          const restoredIndex = Number(session?.stepIndex ?? 0);
          if (!Number.isNaN(restoredIndex)) {
            setStepIndex(Math.min(Math.max(restoredIndex, 0), totalSteps - 1));
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to restore cooking session", error);
      }
    }
    setStepIndex(0);
  }, [isOpen, recipe, totalSteps]);

  useEffect(() => {
    if (!isOpen) return;
    const session = {
      recipeId: recipe.id || recipe.title,
      stepIndex,
      startedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [isOpen, recipe, stepIndex]);

  if (!isOpen) return null;

  const providedVideoUrl = recipe.videoUrl?.trim();
  const videoUrl = providedVideoUrl || getRecipeVideoUrl(recipe);
  const imageUrl = getRecipeImageUrl(recipe);
  const currentStep = steps[stepIndex] || "";
  const hasVideo = Boolean(videoUrl);
  const showNoVideoBanner = !providedVideoUrl;

  const handleNextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePrevStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-all animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-slide-up">
        <div className="relative h-64 bg-gray-100">
          {!hasVideo || videoError ? (
            <RecipeThumbnail title={recipe.title} imageUrl={imageUrl} className="h-full w-full rounded-none" />
          ) : (
            <video
              className="h-full w-full object-cover"
              src={videoUrl}
              muted
              loop
              autoPlay
              playsInline
              onError={() => setVideoError(true)}
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            aria-label="Close"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {showNoVideoBanner && (
            <div className="mb-4 rounded-2xl bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-500">
              No video available for this recipe yet.
            </div>
          )}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Step {stepIndex + 1} of {totalSteps}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{currentStep}</h3>

          <div className="flex gap-3">
            <button
              onClick={handlePrevStep}
              disabled={stepIndex === 0}
              className="flex-1 border border-gray-200 text-gray-700 font-bold py-4 rounded-3xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (stepIndex >= totalSteps - 1) {
                  onClose();
                  return;
                }
                handleNextStep();
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-3xl shadow-xl shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stepIndex >= totalSteps - 1 ? "Finish" : "Next Step"}
            </button>
          </div>
        </div>
      </div>

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
