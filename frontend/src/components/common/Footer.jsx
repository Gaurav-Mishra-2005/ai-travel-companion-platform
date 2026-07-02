import React from "react";
import { Globe, Sparkles, ShieldAlert } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-200/10 dark:border-zinc-900 bg-zinc-950 text-zinc-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand & Logo */}
        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-650 to-violet-750 text-white shadow-md shadow-indigo-500/10">
              <Globe className="w-4.5 h-4.5 animate-[spin_12s_linear_infinite]" />
              <Sparkles className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-amber-300 animate-pulse" />
            </div>
            <span className="font-display font-extrabold text-sm text-white tracking-tight">
              AI Travel Companion
            </span>
          </div>
          <p className="text-xs text-zinc-550 leading-relaxed font-light mt-1">
            Synthesize customized day-by-day itineraries mapped dynamically via opennominatim coordinates.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-2.5 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">About</h4>
          <span className="text-xs text-zinc-500 leading-relaxed font-light">
            Generative AI travel planner powered by Gemini LLM model variables and geocoded via OpenStreetMap Nominatim APIs.
          </span>
        </div>

        {/* Column 3: Features */}
        <div className="flex flex-col gap-2.5 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Features</h4>
          <div className="flex flex-col gap-1.5 text-xs text-zinc-500 font-light">
            <span>• Custom Preferences & Budgeting</span>
            <span>• Single-Spot AI Regeneration</span>
            <span>• Nominatim Coordinate Enrichments</span>
            <span>• Interactive Route Path Leaflet Maps</span>
          </div>
        </div>

        {/* Column 4: Links & Integrations */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Links & Tech</h4>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>GitHub Repository</span>
            </a>
            <div className="flex items-center gap-1.5 text-xs text-zinc-550 font-light">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Privacy Agreement</span>
            </div>
            <div className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-2 flex flex-col gap-0.5 mt-1 font-mono">
              <span>Powered by Google Gemini</span>
              <span>Map data &copy; OpenStreetMap</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-zinc-600 font-mono">
          &copy; {new Date().getFullYear()} AI Travel Companion (ATC). All rights reserved.
        </span>
        <span className="text-[10px] text-zinc-600 font-mono">
          Designed for travel enthusiasts.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
