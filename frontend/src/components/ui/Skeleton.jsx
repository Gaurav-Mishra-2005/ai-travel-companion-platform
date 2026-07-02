import React from "react";

export const Skeleton = ({
  className = "",
  variant = "text",
  width,
  height,
  ...props
}) => {
  const baseStyles = "skeleton-shimmer rounded-md bg-zinc-900";
  
  const variants = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "h-24 w-full",
  };

  const style = {
    width: width,
    height: height,
  };

  const variantClass = variants[variant] || variants.text;

  return (
    <div
      className={`${baseStyles} ${variantClass} ${className}`}
      style={style}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 shadow-lg flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-2 w-3/4">
        <Skeleton variant="text" className="h-5 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
      <Skeleton variant="circular" className="h-8 w-8" />
    </div>
    <div className="flex flex-col gap-2 mt-2">
      <Skeleton variant="text" className="h-3.5" />
      <Skeleton variant="text" className="h-3.5" />
    </div>
    <div className="mt-4 pt-4 border-t border-zinc-800/60 flex justify-between items-center">
      <Skeleton variant="text" className="h-3.5 w-1/4" />
      <Skeleton variant="text" className="h-4 w-1/6" />
    </div>
  </div>
);

export const ItinerarySkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="flex gap-2 pb-2 border-b border-zinc-900 overflow-x-auto">
      {[1, 2, 3].map((n) => (
        <Skeleton key={n} variant="text" className="h-10 w-24 rounded-lg shrink-0" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4 p-4 border border-zinc-900 bg-zinc-950/20 rounded-xl">
            <Skeleton variant="text" className="h-8 w-12 shrink-0 rounded-lg" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton variant="text" className="h-5 w-1/3" />
              <Skeleton variant="text" className="h-3.5 w-1/2" />
              <Skeleton variant="text" className="h-12 w-full mt-1" />
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <Skeleton variant="rectangular" className="h-96 rounded-xl" />
      </div>
    </div>
  </div>
);
