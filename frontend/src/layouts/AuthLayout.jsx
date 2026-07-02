import React from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Compass } from "lucide-react";

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-t-zinc-100 animate-spin" />
        </div>
      </div>
    );
  }

  // If already logged in, go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left Pane - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 border-r border-zinc-800/60 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Branding header */}
        <Link to="/" className="flex items-center gap-2.5 z-10 shrink-0">
          <div className="bg-zinc-100 text-zinc-950 p-1.5 rounded-lg">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg text-zinc-50 tracking-tight flex items-center gap-1.5">
            AI Travel Companion <span className="text-brand-success text-xs font-semibold">(ATC)</span>
          </span>
        </Link>

        {/* Branding Quote / USP */}
        <div className="z-10 max-w-md my-auto flex flex-col gap-6">
          <h1 className="text-3xl font-display font-bold text-zinc-100 leading-tight tracking-tight text-left">
            Let AI synthesize your next adventure.
          </h1>
          <p className="text-sm text-zinc-400 font-normal leading-relaxed text-left">
            Ditch the spreadsheets. Plan customized itineraries, enrich destinations with interactive OSM maps, and tailor schedules instantly with Gemini AI.
          </p>
        </div>

        {/* Footer info */}
        <div className="z-10 flex gap-4 text-xs text-zinc-500 shrink-0">
          <span>&copy; AI Travel Companion (ATC)</span>
          <span>&bull;</span>
          <span>Secure Authentication</span>
        </div>
      </div>

      {/* Right Pane - Form view */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Responsive Logo (Visible on mobile/tablet) */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-zinc-100 text-zinc-950 p-1.5 rounded-lg">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-base text-zinc-50 tracking-tight flex items-center gap-1.5">
              AI Travel Companion <span className="text-brand-success text-xs font-semibold">(ATC)</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm flex flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
