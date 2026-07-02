import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getTrips, deleteTrip } from "../services/trip.service";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { CardSkeleton } from "../components/ui/Skeleton";
import { 
  Plus, Calendar, Users, Briefcase, Trash2, 
  ArrowRight, Search, SlidersHorizontal, AlertCircle, 
  Map, Sparkles, DollarSign, Compass, IndianRupee
} from "lucide-react";
import Modal from "../components/ui/Modal";

// Curated Unsplash images for common destinations to keep it premium
const getDestinationImage = (destination) => {
  const dest = destination.toLowerCase();
  if (dest.includes("tokyo") || dest.includes("japan")) {
    return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"; // Tokyo
  }
  if (dest.includes("paris") || dest.includes("france")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"; // Paris
  }
  if (dest.includes("london") || dest.includes("uk") || dest.includes("england")) {
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80"; // London
  }
  if (dest.includes("new york") || dest.includes("nyc") || dest.includes("america") || dest.includes("usa")) {
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80"; // NY
  }
  if (dest.includes("bali") || dest.includes("beach") || dest.includes("island") || dest.includes("maldives")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"; // Beach
  }
  if (dest.includes("mountain") || dest.includes("swiss") || dest.includes("alps") || dest.includes("hike")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"; // Mountain
  }
  if (dest.includes("rome") || dest.includes("italy")) {
    return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80"; // Rome
  }
  if (dest.includes("sydney") || dest.includes("australia")) {
    return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80"; // Sydney
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"; // Default travel photo
};

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTripId, setDeleteTripId] = useState(null);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ["trips"],
    queryFn: getTrips,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      showToast("Trip plan deleted successfully", "success");
      setDeleteTripId(null);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || err.message || "Failed to delete trip plan", "error");
    }
  });

  const trips = data?.data || [];

  const handleConfirmDelete = () => {
    if (deleteTripId) {
      deleteMutation.mutate(deleteTripId);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
    const displayStatus = trip.status === "draft" ? "planned" : trip.status;
    const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalTrips = trips.length;
  const placesVisited = trips.filter((t) => t.status === "completed").length;
  const totalSpend = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);

  const getStatusBadge = (status) => {
    const colors = {
      draft: "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
      planned: "border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-400",
      completed: "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400",
      cancelled: "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-400",
    };
    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-semibold border rounded-full uppercase tracking-wider ${colors[status] || colors.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Title / Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Welcome back, {user?.name || "Explorer"}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Ready for your next adventure?</p>
        </div>
        <Link to="/create-trip">
          <Button icon={Plus} variant="primary" size="md">
            New Trip
          </Button>
        </Link>
      </div>

      {/* Cohesive Premium Space Indigo Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Trips */}
        <div className="bg-zinc-50 border border-zinc-200/80 dark:bg-zinc-900/40 dark:border-zinc-800/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm transition-all duration-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Total Trips</span>
            <span className="text-xl sm:text-2xl font-display font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {isLoading ? "..." : totalTrips}
            </span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg flex items-center justify-center shrink-0">
            <Map className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Metric 2: Places Visited */}
        <div className="bg-zinc-50 border border-zinc-200/80 dark:bg-zinc-900/40 dark:border-zinc-800/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm transition-all duration-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Places Visited</span>
            <span className="text-xl sm:text-2xl font-display font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {isLoading ? "..." : placesVisited}
            </span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 p-2 rounded-lg flex items-center justify-center shrink-0">
            <Compass className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Metric 3: Total Spend */}
        <div className="bg-zinc-50 border border-zinc-200/80 dark:bg-zinc-900/40 dark:border-zinc-800/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm transition-all duration-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Total Spend</span>
            <span className="text-xl sm:text-2xl font-display font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {isLoading ? "..." : `₹${totalSpend.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg flex items-center justify-center shrink-0">
            <IndianRupee className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Filters & search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between border-y border-zinc-100 dark:border-zinc-900 py-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-600" />
          <input
            type="text"
            placeholder="Search destination or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-100 rounded-lg pl-9 pr-3.5 py-2 text-xs transition-all placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500 mr-1.5 shrink-0" />
          {[
            { id: "all", label: "All" },
            { id: "planned", label: "Planned" },
            { id: "completed", label: "Completed" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium border cursor-pointer shrink-0 ${
                statusFilter === filter.id
                  ? "bg-zinc-900 text-zinc-50 border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100"
                  : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trip Lists */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : error ? (
        <div className="border border-red-900/30 bg-red-50 dark:border-red-950/40 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-6 rounded-2xl flex flex-col gap-2 items-center text-center">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          <h3 className="font-display font-semibold text-base mt-2">Failed to load plans</h3>
          <p className="text-xs text-red-500 max-w-sm">
            {error.response?.data?.message || error.message || "An unexpected error occurred while communicating with the server."}
          </p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center">
          <Compass className="h-10 w-10 text-zinc-400 dark:text-zinc-600 animate-pulse" />
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-semibold text-zinc-500 dark:text-zinc-300">No trips found</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
              {searchTerm || statusFilter !== "all"
                ? "No trips match your search filters. Try adjusting them."
                : "Generate your first tailored itinerary using Gemini AI."}
            </p>
          </div>
          {!searchTerm && statusFilter === "all" && (
            <Link to="/create-trip" className="mt-2">
              <Button icon={Plus} size="sm">
                Create First Plan
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const destImage = getDestinationImage(trip.destination);
            return (
              <Card
                key={trip._id}
                hoverable
                onClick={() => navigate(`/trip/${trip._id}`)}
                className="flex flex-col p-0 overflow-hidden group min-h-[330px] bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/5 hover:-translate-y-1.5 transition-all duration-350 cursor-pointer"
              >
                {/* Visual Unsplash Card Header Image */}
                <div className="h-46 w-full overflow-hidden relative border-b border-zinc-205 dark:border-zinc-900 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent z-10 dark:from-zinc-950" />
                  <img 
                    src={destImage} 
                    alt={trip.destination} 
                    className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-500"
                  />
                  
                  {/* Status & Destination overlay */}
                  <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
                    <div className="flex flex-col gap-0.5 truncate text-left">
                      <span className="text-[10px] text-white font-bold uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {trip.destination}
                      </span>
                    </div>
                    <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {getStatusBadge(trip.status === "draft" ? "planned" : trip.status)}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col text-left gap-3">
                    <CardTitle className="text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
                      {trip.title}
                    </CardTitle>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span>
                          {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Users className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span>
                          {trip.travelers} {trip.travelers === 1 ? "Traveler" : "Travelers"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Briefcase className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span className="capitalize font-light">{trip.tripType} Stay &bull; ₹{Number(trip.budget).toLocaleString("en-IN")} Limit</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-4 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTripId(trip._id);
                      }}
                      className="text-zinc-400 hover:text-red-500 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded-lg transition-colors cursor-pointer animate-none"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link to={`/trip/${trip._id}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="secondary" icon={ArrowRight}>
                        {trip.itineraryGenerated ? "View Plan" : "Generate AI"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTripId}
        onClose={() => setDeleteTripId(null)}
        title="Confirm Plan Deletion"
        size="sm"
      >
        <div className="flex flex-col gap-5 text-left bg-white dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to delete this trip plan? All generated itineraries, locations, and schedules will be permanently removed. This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTripId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteMutation.isLoading}
              onClick={handleConfirmDelete}
            >
              Delete Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
