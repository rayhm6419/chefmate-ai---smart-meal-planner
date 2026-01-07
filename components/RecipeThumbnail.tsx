import React, { useEffect, useState } from "react";

interface RecipeThumbnailProps {
  title?: string;
  imageUrl?: string;
  className?: string;
}

export const RecipeThumbnail: React.FC<RecipeThumbnailProps> = ({
  title,
  imageUrl,
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gray-100 text-gray-500 ${className ?? ""}`}
      >
        <div className="text-[11px] uppercase tracking-widest text-gray-400">No image</div>
        <div className="mt-2 max-w-[90%] text-center text-sm font-semibold line-clamp-2">
          {title?.trim() ? title : "Recipe"}
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title || "Recipe"}
      className={`h-full w-full rounded-2xl object-cover ${className ?? ""}`}
      onError={() => setHasError(true)}
    />
  );
};
