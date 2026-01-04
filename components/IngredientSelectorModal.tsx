import React, { useEffect, useMemo, useState } from "react";
import { listInventoryItems } from "../services/inventoryService";
import { Ingredient } from "../types";

export type SelectedIngredient = { id: string; name: string };

interface IngredientSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: SelectedIngredient[]) => void;
  initialSelected?: SelectedIngredient[];
}

export const IngredientSelectorModal: React.FC<IngredientSelectorModalProps> = ({
  open,
  onClose,
  onConfirm,
  initialSelected = [],
}) => {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(initialSelected.map((item) => item.id)));
    setIsLoading(true);
    setError(null);
    listInventoryItems()
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        console.error("Failed to load inventory items", err);
        setError("Failed to load inventory items.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open, initialSelected]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)).map((item) => ({ id: item.id, name: item.name })),
    [items, selectedIds]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300 mb-safe sm:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Select Ingredients</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Close ingredient selector"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {isLoading && (
          <div className="py-10 text-center text-gray-400 text-sm">Loading inventory...</div>
        )}
        {error && !isLoading && (
          <div className="py-6 text-center text-red-500 text-sm">{error}</div>
        )}

        {!isLoading && !error && (
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2">
            {items.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No inventory items found.</div>
            ) : (
              items.map((item) => {
                const checked = selectedIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer ${
                      checked ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-orange-500"
                        checked={checked}
                        onChange={() => toggleSelected(item.id)}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                        <div className="text-[11px] text-gray-400">{item.category}</div>
                      </div>
                    </div>
                    {item.expiryDate && (
                      <span className="text-[11px] text-gray-400">
                        Exp {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedItems)}
            className="flex-1 bg-orange-500 text-white font-semibold py-3 rounded-2xl shadow-md hover:bg-orange-600 transition-colors"
            disabled={isLoading}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
