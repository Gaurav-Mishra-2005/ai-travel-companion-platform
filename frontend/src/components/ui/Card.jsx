import React from "react";

export const Card = ({
  children,
  className = "",
  onClick,
  hoverable = false,
  ...props
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`bg-zinc-50/30 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm dark:shadow-lg transition-all ${
        hoverable || isClickable 
          ? "hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700/80 cursor-pointer" 
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-zinc-800 dark:text-zinc-100 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-xs text-zinc-400 dark:text-zinc-550 mt-0.5 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between ${className}`}>
    {children}
  </div>
);
