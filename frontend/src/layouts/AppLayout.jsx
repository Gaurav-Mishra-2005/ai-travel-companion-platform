import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Compass, LayoutDashboard, PlusSquare, 
  User, LogOut, Menu, X, Sun, Moon, Globe, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on path change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create-trip", label: "Create Trip", icon: PlusSquare },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path.includes("?tab=")) {
      const [basePath, search] = path.split("?");
      return location.pathname === basePath && location.search === `?${search}`;
    }
    return location.pathname === path && !location.search;
  };

  // Get dynamic page title for breadcrumb
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/create-trip") return "Plan New Journey";
    if (path.startsWith("/trip/")) return "Trip Details";
    if (path === "/profile") return "Account Profile";
    return "AI Travel Companion";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-8">
        {/* App Title Header */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-650 to-violet-700 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Globe className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            <Sparkles className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-extrabold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              AI Travel Companion
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              (ATC)
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="flex flex-col gap-4 border-t border-zinc-200 dark:border-zinc-900 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 transition-all text-left cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex w-64 bg-zinc-50 border-r border-zinc-200 dark:bg-zinc-950 dark:border-zinc-900/60 p-6 flex-col justify-between h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden border-b border-zinc-200 dark:border-zinc-900 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 w-full shrink-0">
        <Link to="/" className="flex items-center gap-2 group select-none">
          <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-650 to-violet-700 text-white shadow-md shadow-indigo-500/10">
            <Globe className="w-4 h-4 animate-[spin_12s_linear_infinite]" />
            <Sparkles className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-amber-300 animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
            ATC Companion
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Mobile Profile Photo */}
          {user && (
            <Link to="/profile" className="shrink-0">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Slide drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-zinc-50 dark:bg-zinc-950 p-6 border-r border-zinc-200 dark:border-zinc-900 z-50 shadow-2xl h-screen"
            >
              <div className="absolute top-4 right-4 lg:hidden">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-zinc-400 hover:text-zinc-100 p-1 hover:bg-zinc-900 rounded-lg cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area with sticky Content Header (Profile Badge & Theme Toggle) */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] lg:min-h-screen relative">
        {/* Main Content Header (Desktop Sticky top bar) */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 w-full border-b border-zinc-200 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-8 sm:px-10 items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-400">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User Profile Badge next to Dashboard content */}
            {user && (
              <Link
                to="/profile"
                className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 focus:outline-none transition-colors cursor-pointer"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none">
                  {user.name}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="flex-1 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
