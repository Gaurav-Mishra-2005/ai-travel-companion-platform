import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toasts portal/container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${
                  isSuccess
                    ? "bg-zinc-900/90 border-emerald-900/40 text-emerald-400"
                    : isError
                    ? "bg-zinc-900/90 border-red-900/40 text-red-400"
                    : "bg-zinc-900/90 border-amber-900/40 text-amber-400"
                }`}
              >
                {/* Icon */}
                {isSuccess && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />}
                {isError && <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />}
                {isWarning && <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />}

                {/* Content */}
                <div className="flex-1 text-xs font-medium text-zinc-200 leading-normal text-left">
                  {toast.message}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
