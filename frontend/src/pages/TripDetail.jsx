import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  getTripById,
  updateTrip,
  generateItinerary,
  regenerateDay,
  regenerateActivity,
  updateActivity,
  addActivity,
  deleteActivity,
} from "../services/trip.service";
import { useToast } from "../context/ToastContext";
import { Tabs } from "../components/ui/Tabs";
import { Card, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { ItinerarySkeleton } from "../components/ui/Skeleton";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";

// Icon imports
import {
  ArrowLeft,
  Calendar,
  Compass,
  IndianRupee,
  Users,
  MapPin,
  Sparkles,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Dynamic map view centering hook
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Fit bounds to all markers dynamically
const FitBounds = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [coords, map]);
  return null;
};

// Create custom index pin icon matching Space Indigo theme with highlight options
const createIndexIcon = (index, isHighlighted) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-full ${
      isHighlighted 
        ? "bg-indigo-500 text-white ring-4 ring-indigo-400/40 border-2 border-indigo-200 scale-120 animate-bounce" 
        : "bg-indigo-650 text-zinc-150 border-2 border-white dark:border-zinc-950"
    } shadow-md font-display text-[10px] font-bold transition-all duration-300">${index}</div>`,
    className: "custom-leaflet-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Curated Unsplash images for common destinations to keep it premium
const getDestinationHeroImage = (destination = "") => {
  const dest = destination.toLowerCase();
  if (dest.includes("tokyo") || dest.includes("japan")) {
    return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"; // Tokyo
  }
  if (dest.includes("paris") || dest.includes("france")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"; // Paris
  }
  if (dest.includes("london") || dest.includes("uk") || dest.includes("england")) {
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80"; // London
  }
  if (dest.includes("new york") || dest.includes("nyc") || dest.includes("america") || dest.includes("usa")) {
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80"; // NY
  }
  if (dest.includes("goa") || dest.includes("beach")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"; // Goa
  }
  if (dest.includes("italy") || dest.includes("rome") || dest.includes("venice")) {
    return "https://images.unsplash.com/photo-1529260818870-931f1619856d?auto=format&fit=crop&w=1200&q=80"; // Italy
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"; // Default
};

// Map activity categories to visual icons/emojis for a premium look
const getActivityIcon = (title = "", location = "") => {
  const t = title.toLowerCase();
  if (t.includes("hotel") || t.includes("check-in") || t.includes("stay") || t.includes("accommodation") || t.includes("hostel") || t.includes("resort")) {
    return "🏨";
  }
  if (t.includes("eat") || t.includes("lunch") || t.includes("dinner") || t.includes("food") || t.includes("restaurant") || t.includes("thali") || t.includes("ramen") || t.includes("sushi")) {
    return "🍽️";
  }
  if (t.includes("cafe") || t.includes("coffee") || t.includes("tea") || t.includes("breakfast") || t.includes("brunch")) {
    return "☕";
  }
  if (t.includes("flight") || t.includes("airport") || t.includes("plane")) {
    return "✈️";
  }
  if (t.includes("train") || t.includes("station") || t.includes("subway") || t.includes("metro")) {
    return "🚆";
  }
  if (t.includes("bus") || t.includes("transit") || t.includes("cab") || t.includes("taxi") || t.includes("ride") || t.includes("car")) {
    return "🚗";
  }
  if (t.includes("bar") || t.includes("drink") || t.includes("club") || t.includes("nightlife") || t.includes("beer") || t.includes("pub")) {
    return "🍺";
  }
  if (t.includes("museum") || t.includes("art") || t.includes("gallery") || t.includes("exhibition") || t.includes("temple") || t.includes("shrine") || t.includes("castle") || t.includes("historical")) {
    return "🏛️";
  }
  if (t.includes("park") || t.includes("garden") || t.includes("walk") || t.includes("hike") || t.includes("nature") || t.includes("lake") || t.includes("river") || t.includes("beach") || t.includes("mountain")) {
    return "🌲";
  }
  if (t.includes("shop") || t.includes("market") || t.includes("mall") || t.includes("souvenir") || t.includes("shopping")) {
    return "🛍️";
  }
  return "📍";
};

// Activity detail helpers for premium metadata display
const getActivityDetails = (act, nextAct) => {
  const title = act.title.toLowerCase();
  let category = "Sightseeing";
  let duration = "1.5 hours";
  let travelTime = "";
  let tags = ["Explore"];
  
  if (title.includes("hotel") || title.includes("stay") || title.includes("check-in") || title.includes("lodging")) {
    category = "Accommodation";
    duration = "Stay";
    tags = ["Lodging", "Check-in"];
  } else if (title.includes("eat") || title.includes("lunch") || title.includes("dinner") || title.includes("food") || title.includes("restaurant") || title.includes("ramen") || title.includes("thali")) {
    category = "Meal";
    duration = "1 hour";
    tags = ["Foodie", "Local Dish"];
  } else if (title.includes("cafe") || title.includes("coffee") || title.includes("tea") || title.includes("breakfast")) {
    category = "Cafe";
    duration = "45 mins";
    tags = ["Snacks", "Beverages"];
  } else if (title.includes("flight") || title.includes("train") || title.includes("bus") || title.includes("transit") || title.includes("travel") || title.includes("drive")) {
    category = "Transit";
    duration = "Variable";
    tags = ["Transfer", "Routing"];
  }
  
  if (nextAct) {
    if (act.coordinates && nextAct.coordinates) {
      const dist = Math.sqrt(
        Math.pow(act.coordinates.lat - nextAct.coordinates.lat, 2) +
        Math.pow(act.coordinates.lng - nextAct.coordinates.lng, 2)
      );
      const mins = Math.max(5, Math.round(((dist * 111) / 35) * 60)); // 35 km/h avg speed
      if (mins < 90) {
        travelTime = `${mins} mins drive`;
      } else {
        travelTime = `${Math.round(mins / 60)} hrs drive`;
      }
    } else {
      travelTime = "15 mins drive";
    }
  }
  
  return { category, duration, travelTime, tags };
};

const TravelEmptyStateIllustration = () => (
  <svg className="w-24 h-24 text-indigo-500/20 dark:text-indigo-400/20 mb-2 animate-[pulse_3s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="35" y="40" width="30" height="24" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M45 40V34C45 32.8954 45.8954 32 47 32H53C54.1046 32 55 32.8954 55 34V40" stroke="currentColor" strokeWidth="2" />
    <line x1="40" y1="46" x2="40" y2="58" stroke="currentColor" strokeWidth="1.5" />
    <line x1="60" y1="46" x2="60" y2="58" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="28" cy="68" r="14" stroke="currentColor" strokeWidth="2" />
    <path d="M28 58L31 68L28 71L25 68L28 58Z" fill="currentColor" opacity="0.6" />
    <path d="M28 78L25 68L28 65L31 68L28 78Z" fill="currentColor" opacity="0.4" />
    <path d="M68 25L70 38L78 40L70 41L68 52L64 49L66 41L58 40L64 38L62 25L68 25Z" fill="currentColor" opacity="0.5" />
    <path d="M55 20C75 22 80 40 85 45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

// Activity form validation schema
const activitySchema = zod.object({
  time: zod.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use 24h format (HH:MM)"),
  title: zod.string().min(1, "Title is required").max(100),
  location: zod.string().min(1, "Location is required"),
  notes: zod.string().max(500).optional(),
});

const TripDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // State variables
  const [activeDay, setActiveDay] = useState(1);
  const [aiStatusMessage, setAiStatusMessage] = useState("");
  const [resolvedActivities, setResolvedActivities] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [hoveredActivityIdx, setHoveredActivityIdx] = useState(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);

  // Loading indicator step rotations
  const [loadingStep, setLoadingStep] = useState(0);
  const [regenStep, setRegenStep] = useState(0);

  const loadingMessages = [
    "Understanding your preferences...",
    "Finding attractions...",
    "Checking weather...",
    "Optimizing travel routes...",
    "Scheduling meals...",
    "Almost done..."
  ];

  const regenMessages = [
    "Finding a better attraction...",
    "Optimizing your schedule...",
    "Replacing activity...",
    "Updating itinerary...",
    "Almost done..."
  ];

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTripById(id),
  });

  const trip = data?.data;

  // React Hook Form for Activity Modals
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors: formErrors },
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: { time: "", title: "", location: "", notes: "" },
  });

  // Mutations
  const generateItineraryMutation = useMutation({
    mutationFn: () => generateItinerary(id),
    onMutate: () => {
      setAiStatusMessage("Consulting Gemini AI to generate custom plan...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast("Itinerary generated successfully by Gemini AI!", "success");
      setAiStatusMessage("");
    },
    onError: (err) => {
      setAiStatusMessage("");
      showToast(err.response?.data?.message || err.message || "Failed to generate itinerary", "error");
    },
  });

  const regenerateDayMutation = useMutation({
    mutationFn: (dayNum) => regenerateDay(id, dayNum),
    onMutate: () => {
      setAiStatusMessage("Regenerating day details...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast(`Day ${activeDay} regenerated successfully`, "success");
      setAiStatusMessage("");
    },
    onError: (err) => {
      setAiStatusMessage("");
      showToast(err.response?.data?.message || err.message || "Failed to regenerate day", "error");
    },
  });

  const updateTripStatusMutation = useMutation({
    mutationFn: (newStatus) => updateTrip(id, { status: newStatus }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast(`Trip status updated to ${res.data?.status || "planned"}`, "success");
    },
    onError: (err) => {
      showToast(err.response?.data?.message || err.message || "Failed to update status", "error");
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ dayNum, actIdx, actData }) => updateActivity(id, dayNum, actIdx, actData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast("Activity updated successfully", "success");
      setIsEditModalOpen(false);
      reset();
    },
    onError: (err) => {
      showToast(err.response?.data?.message || err.message || "Failed to update activity", "error");
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: ({ dayNum, actData }) => addActivity(id, dayNum, actData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast("Activity added to schedule", "success");
      setIsAddModalOpen(false);
      reset();
    },
    onError: (err) => {
      showToast(err.response?.data?.message || err.message || "Failed to add activity", "error");
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: ({ dayNum, actIdx }) => deleteActivity(id, dayNum, actIdx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast("Activity deleted", "success");
    },
    onError: (err) => {
      showToast(err.response?.data?.message || err.message || "Failed to delete activity", "error");
    },
  });

  const regenerateActivityMutation = useMutation({
    mutationFn: ({ dayNum, actIdx }) => regenerateActivity(id, dayNum, actIdx),
    onMutate: () => {
      showToast("Regenerating activity...", "info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      showToast("Activity regenerated successfully", "success");
    },
    onError: (err) => {
      showToast(err.response?.data?.message || err.message || "Failed to regenerate activity", "error");
    },
  });

  // AI loading check
  const isAiWorking =
    generateItineraryMutation.isLoading ||
    regenerateDayMutation.isLoading ||
    regenerateActivityMutation.isLoading;

  useEffect(() => {
    let interval;
    if (isAiWorking) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isAiWorking]);

  useEffect(() => {
    let interval;
    if (regenerateActivityMutation.isLoading) {
      interval = setInterval(() => {
        setRegenStep((prev) => (prev + 1) % regenMessages.length);
      }, 2000);
    } else {
      setRegenStep(0);
    }
    return () => clearInterval(interval);
  }, [regenerateActivityMutation.isLoading]);

  // Automatically adjust active day tab if itinerary is generated
  useEffect(() => {
    if (trip?.itinerary && trip.itinerary.length > 0) {
      const dayNumbers = trip.itinerary.map(d => d.day);
      if (!dayNumbers.includes(activeDay)) {
        setActiveDay(dayNumbers[0]);
      }
    }
  }, [trip, activeDay]);

  // Itinerary details
  const itinerary = trip?.itinerary || [];
  const currentDayData = itinerary.find((d) => d.day === activeDay);
  
  // Chronological sorting on the frontend to guarantee chronological route
  const rawActivities = currentDayData?.activities || [];
  const activities = [...rawActivities].sort((a, b) => a.time.localeCompare(b.time));

  // Client-side Geocode Correction Effect
  useEffect(() => {
    const resolveMapCoords = async () => {
      if (!activities || activities.length === 0) {
        setResolvedActivities([]);
        return;
      }
      
      setIsMapLoading(true);
      
      const resolved = await Promise.all(
        activities.map(async (act) => {
          const query = trip.destination 
            ? `${act.location}, ${trip.destination}` 
            : act.location;
          
          const cacheKey = `geo_${query.replace(/[^a-zA-Z0-9]/g, "_")}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              return {
                ...act,
                coordinates: parsed.coords,
                displayAddress: parsed.address,
              };
            } catch (e) {}
          }
          
          try {
            const res = await axios.get("https://nominatim.openstreetmap.org/search", {
              params: {
                q: query,
                format: "jsonv2",
                limit: 1,
              }
            });
            
            if (res.data && res.data[0]) {
              const coords = {
                lat: Number(res.data[0].lat),
                lng: Number(res.data[0].lon),
              };
              const address = res.data[0].display_name;
              
              localStorage.setItem(cacheKey, JSON.stringify({ coords, address }));
              
              return {
                ...act,
                coordinates: coords,
                displayAddress: address,
              };
            } else {
              const fallbackKey = `geo_city_${trip.destination.replace(/[^a-zA-Z0-9]/g, "_")}`;
              const cachedCity = localStorage.getItem(fallbackKey);
              if (cachedCity) {
                const parsed = JSON.parse(cachedCity);
                return {
                  ...act,
                  coordinates: parsed.coords,
                  displayAddress: `[Approximate] ${trip.destination}`,
                };
              }

              const cityRes = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                  q: trip.destination,
                  format: "jsonv2",
                  limit: 1,
                }
              });

              if (cityRes.data && cityRes.data[0]) {
                const coords = {
                  lat: Number(cityRes.data[0].lat),
                  lng: Number(cityRes.data[0].lon),
                };
                const address = cityRes.data[0].display_name;
                
                localStorage.setItem(fallbackKey, JSON.stringify({ coords, address }));
                
                return {
                  ...act,
                  coordinates: coords,
                  displayAddress: `[Approximate] ${trip.destination}`,
                };
              }
            }
          } catch (error) {
            console.error("Client geocode override failed:", error);
          }
          
          return act;
        })
      );
      
      setResolvedActivities(resolved);
      setIsMapLoading(false);
    };

    if (trip?.destination) {
      resolveMapCoords();
    }
  }, [activeDay, currentDayData, trip?.destination]);

  if (isLoading) {
    return <ItinerarySkeleton />;
  }

  if (error || !trip) {
    return (
      <div className="border border-red-950 bg-red-950/20 text-red-400 p-6 rounded-2xl flex flex-col gap-2 items-center text-center">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <h3 className="font-display font-semibold text-base mt-2">Trip details unavailable</h3>
        <p className="text-xs text-red-500 max-w-sm">
          {error?.response?.data?.message || error?.message || "Plan not found."}
        </p>
        <Link to="/dashboard" className="mt-2">
          <Button size="sm" variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  // Extract coords for leaflet rendering from client-resolved list (excluding Null Island placeholders)
  const activitiesWithCoords = resolvedActivities.filter(
    (act) => act.coordinates && 
             act.coordinates.lat && 
             act.coordinates.lng && 
             !(Number(act.coordinates.lat) === 0 && Number(act.coordinates.lng) === 0)
  );

  const defaultCenter = [35.6762, 139.6503]; // Tokyo fallback
  let mapCenter = defaultCenter;
  if (activitiesWithCoords.length > 0) {
    mapCenter = [
      activitiesWithCoords[0].coordinates.lat,
      activitiesWithCoords[0].coordinates.lng,
    ];
  }

  const polylineCoords = activitiesWithCoords.map((act) => [
    act.coordinates.lat,
    act.coordinates.lng,
  ]);

  // Open Edit Dialog
  const openEditModal = (activity, index) => {
    setSelectedActivity(activity);
    setSelectedActivityIndex(index);
    setValue("time", activity.time);
    setValue("title", activity.title);
    
    let inputLoc = activity.location;
    if (trip.destination && inputLoc.toLowerCase().endsWith(`, ${trip.destination.toLowerCase()}`)) {
      inputLoc = inputLoc.slice(0, -(trip.destination.length + 2));
    }
    setValue("location", inputLoc);
    setValue("notes", activity.notes || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (data) => {
    updateActivityMutation.mutate({
      dayNum: activeDay,
      actIdx: selectedActivityIndex,
      actData: data,
    });
  };

  // Open Add Dialog
  const openAddModal = () => {
    reset({
      time: "09:00",
      title: "",
      location: "",
      notes: "",
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (data) => {
    addActivityMutation.mutate({
      dayNum: activeDay,
      actData: data,
    });
  };

  // Delete activity confirmation
  const handleDeleteActivity = (index) => {
    if (confirm("Delete this activity from the day schedule?")) {
      deleteActivityMutation.mutate({
        dayNum: activeDay,
        actIdx: index,
      });
    }
  };

  // Regenerate activity
  const handleRegenerateActivity = (index) => {
    regenerateActivityMutation.mutate({
      dayNum: activeDay,
      actIdx: index,
    });
  };

  // Tabs layout mappings
  const tabsList = itinerary.map((d) => ({
    id: d.day,
    label: `Day ${d.day}`,
  }));

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate dynamic travel progress
  const getProgress = () => {
    if (trip.status === "completed") return 100;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const today = new Date();
    if (today < start) return 0;
    if (today > end) return 100;
    const total = end - start;
    const elapsed = today - start;
    return Math.round((elapsed / total) * 100);
  };

  const travelProgress = getProgress();
  const totalDuration = itinerary.length || Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  const totalActivitiesCount = itinerary.reduce((sum, d) => sum + (d.activities?.length || 0), 0);

  return (
    <div className="flex flex-col gap-6 text-left w-full">
      
      {/* DESTINATION HERO COMPONENT */}
      <div 
        className="w-full rounded-3xl overflow-hidden relative min-h-[220px] flex flex-col justify-between p-6 sm:p-8 bg-cover bg-center shadow-lg border border-zinc-200 dark:border-zinc-800/80"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%), url('${getDestinationHeroImage(trip.destination)}')` }}
      >
        {/* Back Link overlay */}
        <div className="flex justify-between items-center w-full z-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-colors border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border backdrop-blur-md ${
              trip.status === "completed"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                : "bg-indigo-950/40 border-indigo-500/30 text-indigo-400"
            }`}>
              {trip.status === "draft" ? "planned" : trip.status}
            </span>
            <button
              onClick={() => {
                const nextStatus = trip.status === "completed" ? "planned" : "completed";
                updateTripStatusMutation.mutate(nextStatus);
              }}
              disabled={updateTripStatusMutation.isLoading}
              className="px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer select-none"
            >
              {trip.status === "completed" ? "Set Active" : "Complete Trip"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-12 sm:mt-16 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 font-mono tracking-widest uppercase">
            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
            <span>{trip.destination}</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-none">
            {trip.title}
          </h1>

          <p className="text-xs text-white/70 max-w-xl font-light mt-1">
            Custom {trip.tripType} adventure plan with a budget of ₹{trip.budget.toLocaleString("en-IN")} mapped dynamically via OpenStreetMap Nominatim logs.
          </p>
        </div>
      </div>

      {/* QUICK FACTS & PROGRESS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        
        {/* Quick Facts Card (Col 1-3) */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm p-4 text-left">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Duration</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">{totalDuration} Days</span>
          </Card>
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm p-4 text-left">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Budget Max</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">₹{trip.budget.toLocaleString("en-IN")}</span>
          </Card>
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm p-4 text-left">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Travelers</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">{trip.travelers} {trip.travelers === 1 ? "Person" : "People"}</span>
          </Card>
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm p-4 text-left">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Activities</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">{totalActivitiesCount} Stops</span>
          </Card>
        </div>

        {/* Progress Card (Col 4) */}
        <Card className="md:col-span-1 bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
            <span>Travel Progress</span>
            <span className="text-indigo-650 dark:text-indigo-400">{travelProgress}%</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-2 mt-2 overflow-hidden border border-zinc-200 dark:border-zinc-850">
            <div 
              className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${travelProgress}%` }}
            />
          </div>
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-2 block italic text-left">
            {travelProgress === 100 ? "Trip completed! 🎉" : "Itinerary tracking active."}
          </span>
        </Card>
      </div>

      {/* TOOLBAR CONTROLS */}
      {trip.itineraryGenerated && (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-900 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-450 dark:text-zinc-500">Day Timeline</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              icon={RefreshCw}
              size="xs"
              loading={regenerateDayMutation.isLoading}
              onClick={() => regenerateDayMutation.mutate(activeDay)}
              disabled={isAiWorking}
            >
              Regenerate Day {activeDay}
            </Button>
            <Button
              variant="outline"
              icon={Plus}
              size="xs"
              onClick={openAddModal}
              disabled={isAiWorking}
            >
              Add Activity
            </Button>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTROLLER */}
      {isAiWorking || aiStatusMessage ? (
        <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center min-h-[400px] shadow-sm">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-zinc-200 dark:border-zinc-850" />
            <div className="absolute inset-0 rounded-full border-[3px] border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-indigo-500 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <h3 className="font-display font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              {regenerateActivityMutation.isLoading 
                ? "Regenerating Activity Details" 
                : "Gemini Synthesis in Progress"}
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 max-w-sm">
              {regenerateActivityMutation.isLoading 
                ? regenMessages[regenStep]
                : loadingMessages[loadingStep]}
            </p>
          </div>
        </div>
      ) : !trip.itineraryGenerated || itinerary.length === 0 ? (
        <div className="border border-dashed border-zinc-250 dark:border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center gap-5 text-center max-w-2xl mx-auto my-6 bg-zinc-55/30 dark:bg-transparent">
          <TravelEmptyStateIllustration />
          <div className="flex flex-col gap-1.5">
            <h3 className="font-display font-semibold text-zinc-800 dark:text-zinc-250 text-base">Generate your custom itinerary</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-sm leading-relaxed font-light">
              This trip plan currently has no schedule configured. Let Gemini AI synthesize a custom travel timeline tailored to your preferences.
            </p>
          </div>
          
          {trip.preferences?.length > 0 && (
            <div className="flex flex-col gap-2 w-full max-w-xs border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-lg text-left mt-2">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Loaded Preferences</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {trip.preferences.map((p, i) => (
                  <span key={i} className="text-[10px] bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="primary"
            icon={Sparkles}
            onClick={() => generateItineraryMutation.mutate()}
            loading={generateItineraryMutation.isLoading}
            className="mt-2 px-6"
          >
            Synthesize Itinerary
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Day Navigation Tabs */}
          <Tabs
            tabs={tabsList}
            activeTab={activeDay}
            onChange={(id) => setActiveDay(Number(id))}
          />

          {/* Grid Layout containing Timeline & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Timeline Column (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6 relative pl-4 border-l border-zinc-200 dark:border-zinc-900/80">
              {activities.length === 0 ? (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
                  No activities planned for this day. Click "Add Activity" or "Regenerate Day" to construct one.
                </div>
              ) : (
                resolvedActivities.map((act, index) => {
                  const details = getActivityDetails(act, index < resolvedActivities.length - 1 ? resolvedActivities[index + 1] : null);
                  const isHovered = hoveredActivityIdx === index;
                  
                  return (
                    <div 
                      key={index} 
                      className="relative flex flex-col sm:flex-row gap-4 group"
                      onMouseEnter={() => setHoveredActivityIdx(index)}
                      onMouseLeave={() => setHoveredActivityIdx(null)}
                    >
                      {/* Time indicator dot */}
                      <div className={`absolute left-[-21px] top-4.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 transition-all z-10 shrink-0 ${
                        isHovered 
                          ? "bg-indigo-500 scale-125 ring-4 ring-indigo-400/20" 
                          : "bg-zinc-200 dark:bg-zinc-800"
                      }`} />
                      
                      {/* Time Indicator label */}
                      <div className="flex items-center gap-1.5 sm:flex-col sm:items-start shrink-0 sm:w-20 mt-3.5">
                        <Clock className={`h-3 w-3 sm:hidden ${isHovered ? "text-indigo-500" : "text-zinc-400"}`} />
                        <span className={`text-xs font-mono font-bold tracking-wider ${isHovered ? "text-indigo-500 font-extrabold" : "text-zinc-500 dark:text-zinc-400"}`}>
                          {act.time}
                        </span>
                      </div>

                      {/* Activity Details Box */}
                      <Card className={`w-full relative overflow-hidden group/card bg-white border p-4 transition-all duration-300 ${
                        isHovered 
                          ? "border-indigo-400/40 dark:border-indigo-500/30 shadow-md translate-x-1" 
                          : "border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800/80"
                      }`}>
                        <div className="flex gap-4 items-start">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border transition-all duration-300 ${
                            isHovered 
                              ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/60" 
                              : "bg-zinc-55 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                          }`}>
                            {getActivityIcon(act.title, act.location)}
                          </div>

                          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                            
                            {/* Action Row */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-0.5 text-left truncate">
                                <h4 className={`text-sm font-bold tracking-tight leading-snug truncate ${isHovered ? "text-indigo-650 dark:text-indigo-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                                  {act.title}
                                </h4>
                                
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-450 font-light truncate mt-0.5">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-650 shrink-0" />
                                  <span className="truncate text-left">{act.location}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-800/80 rounded-lg p-0.5 shadow-sm">
                                <button
                                  onClick={() => handleRegenerateActivity(index)}
                                  disabled={isAiWorking}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 rounded-md transition-colors cursor-pointer"
                                  title="Regenerate single activity with Gemini"
                                >
                                  <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                                  <span className="hidden sm:inline">Regenerate</span>
                                </button>
                                
                                <button
                                  onClick={() => openEditModal(act, index)}
                                  disabled={isAiWorking}
                                  className="text-zinc-455 dark:text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 p-1 hover:bg-zinc-150 dark:hover:bg-zinc-850 rounded-md transition-colors cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(index)}
                                  disabled={isAiWorking}
                                  className="text-zinc-455 dark:text-zinc-500 hover:text-red-500 p-1 hover:bg-zinc-150 dark:hover:bg-zinc-850 rounded-md transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Nominatim Geocode Details */}
                            {act.displayAddress && (
                              <div className="bg-zinc-50 dark:bg-zinc-950/30 p-2 rounded border border-zinc-100 dark:border-zinc-900/60 flex items-start gap-1.5 text-[10px] text-zinc-500 text-left">
                                <Info className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-650 shrink-0 mt-0.5" />
                                <span className="leading-normal">{act.displayAddress}</span>
                              </div>
                            )}

                            {/* Category Metadata tags & duration */}
                            <div className="flex flex-wrap gap-1.5 items-center mt-1">
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-zinc-150 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 text-zinc-500">{details.category}</span>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-zinc-150 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 text-zinc-500">{details.duration}</span>
                              {details.tags.map((t, idx) => (
                                <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 dark:bg-indigo-950/10 dark:border-indigo-900/50 dark:text-indigo-400">{t}</span>
                              ))}
                            </div>

                            {/* Description Notes */}
                            {act.notes && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-405 font-light leading-relaxed text-left whitespace-pre-line mt-2 border-t border-zinc-100 dark:border-zinc-850 pt-2">
                                {act.notes}
                              </p>
                            )}

                            {/* Simulated Travel Info block */}
                            {details.travelTime && index < resolvedActivities.length - 1 && (
                              <div className="absolute bottom-[-24px] left-[-36px] sm:left-[-116px] text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-850" />
                                <span className="italic">{details.travelTime} to next stop</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>

            {/* Map Column (Leaflet maps panel, 2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-4 lg:sticky lg:top-20 z-10">
              <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-md h-96 relative">
                {isMapLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2 bg-white/60 dark:bg-zinc-950/60 z-30">
                    <svg className="animate-spin h-6 w-6 text-indigo-650 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold tracking-wide">Syncing map coordinates...</span>
                  </div>
                ) : null}

                {activitiesWithCoords.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2 bg-zinc-55/10 dark:bg-zinc-950/20">
                    <MapPin className="h-8 w-8 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                    <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">Map Coordinates Unavailable</span>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 max-w-xs mt-1 leading-relaxed">
                      Coordinates resolve dynamically via OpenStreetMap. Try editing activities to use real, well-known locations in {trip.destination}.
                    </p>
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <FitBounds coords={polylineCoords} />
                    <ChangeMapView center={mapCenter} />
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    
                    {activitiesWithCoords.map((act, idx) => {
                      const absoluteIndex = activities.findIndex(
                        (a) => a.title === act.title && a.time === act.time
                      ) + 1;
                      const isHighlighted = hoveredActivityIdx === idx;
                      
                      return (
                        <Marker
                          key={idx}
                          position={[act.coordinates.lat, act.coordinates.lng]}
                          icon={createIndexIcon(absoluteIndex, isHighlighted)}
                        >
                          <Popup>
                            <div className="text-left font-sans">
                              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">{act.time}</span>
                              <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 leading-snug">{act.title}</h5>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-550 truncate mt-1">{act.location}</p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {polylineCoords.length > 1 && (
                      <Polyline
                        positions={polylineCoords}
                        pathOptions={{
                          color: "#6366f1",
                          weight: 3,
                          opacity: 0.85,
                          dashArray: "6, 6",
                        }}
                      />
                    )}
                  </MapContainer>
                )}
              </div>

              {activitiesWithCoords.length > 0 && (
                <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-900 p-3 rounded-lg flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Enriched locations: {activitiesWithCoords.length} / {activities.length}</span>
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(trip.destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                  >
                    <span>View OSM Search</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Activity Dialog Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Activity Details"
        size="md"
      >
        <form onSubmit={handleSubmit(handleEditSubmit)} className="flex flex-col gap-4 text-left">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Input
                label="Time (HH:MM)"
                id="edit-time"
                placeholder="09:00"
                error={formErrors.time?.message}
                {...register("time")}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Activity Title"
                id="edit-title"
                placeholder="Sensoji Temple"
                error={formErrors.title?.message}
                {...register("title")}
              />
            </div>
          </div>

          <Input
            label="Location Name"
            id="edit-location"
            placeholder="Asakusa"
            error={formErrors.location?.message}
            {...register("location")}
          />

          <div className="flex flex-col gap-1.5 w-full text-left">
            <label htmlFor="edit-notes" className="text-xs font-medium text-zinc-500 dark:text-zinc-450 tracking-wide">
              Description & Notes
            </label>
            <textarea
              id="edit-notes"
              rows={3}
              placeholder="Detail comments or transportation recommendations..."
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-100 rounded-lg px-3.5 py-2.5 text-xs transition-all placeholder-zinc-450 dark:placeholder-zinc-650 focus:outline-none focus:ring-2"
              {...register("notes")}
            />
            {formErrors.notes?.message && (
              <span className="text-xs text-rose-500 font-medium">{formErrors.notes.message}</span>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800/60 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={updateActivityMutation.isLoading}>
              Update Activity
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Activity Dialog Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Custom Activity (Day ${activeDay})`}
        size="md"
      >
        <form onSubmit={handleSubmit(handleAddSubmit)} className="flex flex-col gap-4 text-left">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Input
                label="Time (HH:MM)"
                id="add-time"
                placeholder="09:00"
                error={formErrors.time?.message}
                {...register("time")}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Activity Title"
                id="add-title"
                placeholder="Sensoji Temple"
                error={formErrors.title?.message}
                {...register("title")}
              />
            </div>
          </div>

          <Input
            label="Location Name"
            id="add-location"
            placeholder="Asakusa"
            error={formErrors.location?.message}
            {...register("location")}
          />

          <div className="flex flex-col gap-1.5 w-full text-left">
            <label htmlFor="add-notes" className="text-xs font-medium text-zinc-500 dark:text-zinc-450 tracking-wide">
              Description & Notes
            </label>
            <textarea
              id="add-notes"
              rows={3}
              placeholder="Detail comments or recommendations..."
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-100 rounded-lg px-3.5 py-2.5 text-xs transition-all placeholder-zinc-455 dark:placeholder-zinc-655 focus:outline-none focus:ring-2"
              {...register("notes")}
            />
            {formErrors.notes?.message && (
              <span className="text-xs text-rose-500 font-medium">{formErrors.notes.message}</span>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800/60 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={addActivityMutation.isLoading}>
              Add Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TripDetail;
