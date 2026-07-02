import React from "react";

export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-900 pb-px overflow-x-auto w-full">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              active
                ? "border-indigo-600 dark:border-indigo-450 text-indigo-600 dark:text-indigo-400 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
