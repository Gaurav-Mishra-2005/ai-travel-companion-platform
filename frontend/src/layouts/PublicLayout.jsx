import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Globe, Sparkles, Sun, Moon } from "lucide-react";
import Button from "../components/ui/Button";
import Footer from "../components/common/Footer";

const PublicLayout = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Public Navbar - Transparent at top, glass when scrolled */}
      <header className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-350 ${
        scrolled 
          ? "bg-zinc-950/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/20 dark:border-zinc-900/60 shadow-md text-zinc-100" 
          : "bg-transparent border-b border-transparent text-white"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-650 to-violet-750 text-white shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-all">
              <Globe className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
              <Sparkles className="absolute -top-0.5 -right-0.5 w-3 h-3 text-amber-300 animate-pulse" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              AI Travel Companion <span className="text-indigo-400 text-xs font-semibold">(ATC)</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[#2d2d2d]/80 hover:bg-[#3d3d3d] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {user ? (
              <Link to="/profile" className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 transition-colors">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-350 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-300">
                  {user.name}
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-[#242b47] hover:bg-[#2f395e] text-white border border-[#2f395e]/50">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main page body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
