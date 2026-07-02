import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  icon: Icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";
  
  const variants = {
    primary: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white focus:ring-zinc-300 dark:focus:ring-zinc-400",
    secondary: "bg-zinc-100 text-zinc-800 border border-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 focus:ring-zinc-200 dark:focus:ring-zinc-800",
    outline: "bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 focus:ring-zinc-200 dark:focus:ring-zinc-800",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30 focus:ring-red-200 dark:focus:ring-red-900",
    ghost: "bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:ring-zinc-200 dark:focus:ring-zinc-800",
    accent: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-600",
  };

  const sizes = {
    xs: "px-2.5 py-1 text-[10px] gap-1 rounded-md",
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.01 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={`${size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0`} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;
