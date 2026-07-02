import React, { forwardRef } from "react";

const Input = forwardRef(({
  label,
  type = "text",
  error,
  placeholder,
  className = "",
  containerClassName = "",
  id,
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 tracking-wide select-none"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        placeholder={placeholder}
        className={`w-full bg-zinc-50 dark:bg-zinc-900 border ${
          error
            ? "border-red-300 dark:border-red-900 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950"
            : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/10"
        } text-zinc-900 dark:text-zinc-100 rounded-lg px-3.5 py-3 text-sm transition-all placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-4 focus:ring-offset-0 shadow-sm dark:shadow-inner ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 font-medium select-none">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
