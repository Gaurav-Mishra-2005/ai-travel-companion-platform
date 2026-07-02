import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery } from "@tanstack/react-query";
import { getTrips } from "../services/trip.service";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowLeft, Camera, Settings, Calendar, Compass, MapPin, IndianRupee, Globe, Award, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Zod Schema
const profileSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [avatarBase64, setAvatarBase64] = useState(user?.picture || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all trips for computing stats
  const { data: tripsData } = useQuery({
    queryKey: ["trips"],
    queryFn: getTrips,
  });

  const trips = tripsData?.data || [];

  // Calculate statistics from real trip data
  const tripsCreated = trips.length;
  
  // Robust destination stats mapper to prevent unique cities/countries equaling total trips
  const getDestinationStats = (tripsList) => {
    const countries = new Set();
    const cities = new Set();
    
    tripsList.forEach(t => {
      if (!t.destination) return;
      const dest = t.destination.trim();
      const parts = dest.split(",").map(p => p.trim());
      
      if (parts.length > 1) {
        cities.add(parts[0]);
        countries.add(parts[parts.length - 1]);
      } else {
        cities.add(dest);
        const lower = dest.toLowerCase();
        if (lower.includes("japan") || lower.includes("tokyo") || lower.includes("kyoto")) {
          countries.add("Japan");
        } else if (lower.includes("india") || lower.includes("goa") || lower.includes("bhopal") || lower.includes("rewa") || lower.includes("mumbai") || lower.includes("delhi")) {
          countries.add("India");
        } else if (lower.includes("france") || lower.includes("paris")) {
          countries.add("France");
        } else if (lower.includes("uk") || lower.includes("london")) {
          countries.add("United Kingdom");
        } else if (lower.includes("usa") || lower.includes("america") || lower.includes("new york")) {
          countries.add("United States");
        } else if (lower.includes("italy") || lower.includes("rome") || lower.includes("venice")) {
          countries.add("Italy");
        } else {
          countries.add("India"); 
        }
      }
    });
    
    return {
      citiesCount: cities.size,
      countriesCount: countries.size
    };
  };

  const { citiesCount, countriesCount } = getDestinationStats(trips);
  const totalBudgetPlanned = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);

  // Dynamic achievement calculations
  const achievements = [
    {
      id: "trailblazer",
      title: "First Steps",
      desc: "Planned 1+ trips",
      icon: "🗺️",
      current: tripsCreated,
      target: 1,
      gradient: "from-amber-450 to-orange-500",
      glowColor: "rgba(245, 158, 11, 0.4)",
      unlocked: tripsCreated >= 1,
    },
    {
      id: "budget_savvy",
      title: "Budget Savvy",
      desc: "Trip cost <= ₹25k",
      icon: "🪙",
      current: trips.some(t => Number(t.budget || 0) <= 25000) ? 1 : 0,
      target: 1,
      gradient: "from-emerald-450 to-teal-500",
      glowColor: "rgba(16, 185, 129, 0.4)",
      unlocked: trips.some(t => Number(t.budget || 0) <= 25000),
    },
    {
      id: "nomad",
      title: "Group Leader",
      desc: "Trip with >= 3 travelers",
      icon: "🎒",
      current: trips.some(t => Number(t.travelers || 0) >= 3) ? 1 : 0,
      target: 1,
      gradient: "from-blue-450 to-indigo-500",
      glowColor: "rgba(59, 130, 246, 0.4)",
      unlocked: trips.some(t => Number(t.travelers || 0) >= 3),
    },
    {
      id: "globetrotter",
      title: "Explorer",
      desc: "Visit 3+ unique cities",
      icon: "✈️",
      current: citiesCount,
      target: 3,
      gradient: "from-purple-450 to-pink-500",
      glowColor: "rgba(168, 85, 247, 0.4)",
      unlocked: citiesCount >= 3,
    }
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Compress image client-side to fit within body-parser payload limits (< 100kb)
  const compressImage = (base64Str, maxWidth = 100, maxHeight = 100) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file.", "error");
        return;
      }

      const reader = new FileReader();
      setUploading(true);
      reader.onload = async (event) => {
        try {
          const rawBase64 = event.target.result;
          const compressed = await compressImage(rawBase64, 100, 100);
          setAvatarBase64(compressed);
          showToast("Image loaded and optimized.", "info");
        } catch (err) {
          showToast("Failed to optimize image.", "error");
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        showToast("Failed to read image file.", "error");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(data.name, avatarBase64);
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const formattedJoinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "June 2026";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 text-left w-full max-h-[85vh] overflow-hidden"
    >
      {/* Back button */}
      <div className="flex items-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      {/* Header (More compact) */}
      <div className="flex flex-col gap-0.5 border-b border-zinc-200 dark:border-zinc-900 pb-2">
        <div className="flex items-center gap-1.5">
          <Settings className="h-4.5 w-4.5 text-indigo-500" />
          <h1 className="text-xl font-display font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Account Profile
          </h1>
        </div>
      </div>

      {/* Main Split Grid (Reduced gap to fit 1080p viewport height) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left Column: Avatar Card & Badges */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="relative group w-18 h-18 select-none">
                <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-indigo-500/20 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center shadow-md">
                  {uploading ? (
                    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : avatarBase64 ? (
                    <img src={avatarBase64} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <label 
                  htmlFor="picture-upload" 
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                >
                  <Camera className="h-4.5 w-4.5 text-white" />
                </label>
                
                <input
                  type="file"
                  id="picture-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-150 leading-snug">{user?.name}</h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]">{user?.email}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5 w-full justify-center">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Joined {formattedJoinDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements badge card - 2x2 layout for height saving */}
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
            <CardContent className="p-3.5 flex flex-col gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-indigo-500" />
                <span>Collectible Badges</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2.5">
                {achievements.map((badge) => (
                  <motion.div 
                    key={badge.id}
                    whileHover={badge.unlocked ? { scale: 1.03, y: -1 } : {}}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      badge.unlocked 
                        ? "bg-zinc-50/40 border-zinc-200/60 dark:bg-zinc-950/20 dark:border-zinc-850/60" 
                        : "bg-zinc-50/10 border-zinc-100 dark:bg-zinc-950/5 dark:border-zinc-900/40 opacity-40 select-none"
                    }`}
                    style={badge.unlocked ? { boxShadow: `0 4px 12px -2px ${badge.glowColor}` } : {}}
                  >
                    {/* Circle icon with gradient */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 shadow-sm mb-1 bg-gradient-to-br ${badge.gradient} ${
                      !badge.unlocked ? "filter grayscale contrast-75" : ""
                    }`}>
                      {badge.icon}
                    </div>
                    
                    <div className="flex flex-col min-w-0 w-full items-center">
                      <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-0.5 justify-center">
                        {badge.title}
                        {badge.unlocked && <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />}
                      </span>
                      <span className="text-[8px] text-zinc-500 leading-none truncate w-full mt-0.5" title={badge.desc}>
                        {badge.desc}
                      </span>
                      
                      {/* Badge progress bar */}
                      <div className="w-full bg-zinc-200/80 dark:bg-zinc-950 rounded-full h-1 mt-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (badge.current / badge.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[7px] text-zinc-400 mt-0.5 font-mono">
                        {badge.current}/{badge.target}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile Name Form & Dashboard Stats */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
              <CardContent className="p-3 flex flex-col gap-1 text-left">
                <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-550 font-semibold uppercase tracking-wider mt-1">Trips Created</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">{tripsCreated}</span>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
              <CardContent className="p-3 flex flex-col gap-1 text-left">
                <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-550 font-semibold uppercase tracking-wider mt-1">Countries Visited</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">{countriesCount}</span>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
              <CardContent className="p-3 flex flex-col gap-1 text-left">
                <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-550 font-semibold uppercase tracking-wider mt-1">Cities Planned</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">{citiesCount}</span>
              </CardContent>
            </Card>

            <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
              <CardContent className="p-3 flex flex-col gap-1 text-left">
                <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <IndianRupee className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-555 font-semibold uppercase tracking-wider mt-1">Total Spend</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display truncate">₹{totalBudgetPlanned.toLocaleString("en-IN")}</span>
              </CardContent>
            </Card>
          </div>

          {/* Edit settings card (Height optimized) */}
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-display flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Profile Settings</span>
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Your Full Name"
                  id="name"
                  placeholder="e.g. John Doe"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <div className="flex justify-end pt-1">
                  <Button type="submit" loading={loading} className="px-5 py-2 text-xs">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
