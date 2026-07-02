import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createTrip } from "../services/trip.service";
import { useToast } from "../context/ToastContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ArrowLeft, Plus, X, Sparkles, MapPin, CheckCircle } from "lucide-react";

// Zod Schema
const tripSchema = zod.object({
  title: zod.string().min(1, "Trip Title is required").max(100),
  destination: zod.string().min(1, "Destination is required"),
  startDate: zod.string()
    .min(1, "Start Date is required")
    .refine((val) => {
      const year = val.split("-")[0];
      return year && year.length === 4;
    }, "Year must be exactly 4 digits (e.g. 2026)"),
  endDate: zod.string()
    .min(1, "End Date is required")
    .refine((val) => {
      const year = val.split("-")[0];
      return year && year.length === 4;
    }, "Year must be exactly 4 digits (e.g. 2026)"),
  budget: zod.preprocess(
    (val) => Number(val),
    zod.number().min(1, "Budget must be greater than 0")
  ),
  travelers: zod.preprocess(
    (val) => Number(val),
    zod.number().min(1, "Must have at least 1 traveler")
  ),
  tripType: zod.enum(["solo", "couple", "family", "friends", "business"], {
    errorMap: () => ({ message: "Select a trip type" }),
  }),
  transportMode: zod.enum(["flight", "train", "bus", "car", "any"]),
  accommodationType: zod.enum(["hostel", "hotel", "resort", "homestay", "any"]),
}).refine((data) => {
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: "End date cannot be before start date",
  path: ["endDate"],
});

const CreateTrip = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState([]);
  const [prefInput, setPrefInput] = useState("");
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: 1000,
      travelers: 1,
      tripType: "solo",
      transportMode: "any",
      accommodationType: "any",
    },
  });

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (response) => {
      if (response.data?._id) {
        showToast("Trip plan created successfully!", "success");
        navigate(`/trip/${response.data._id}`);
      }
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create trip plan");
      showToast("Failed to create trip plan", "error");
    },
  });

  const onSubmit = (data) => {
    setFormError("");
    const payload = {
      ...data,
      preferences,
      status: "planned",
    };
    mutation.mutate(payload);
  };

  const handleAddPreference = (e) => {
    e.preventDefault();
    const cleanPref = prefInput.trim();
    if (cleanPref && !preferences.includes(cleanPref)) {
      setPreferences([...preferences, cleanPref]);
      setPrefInput("");
    }
  };

  const handleRemovePreference = (index) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const addPopularPreference = (pref) => {
    if (!preferences.includes(pref)) {
      setPreferences([...preferences, pref]);
    }
  };

  const popularPrefs = [
    "Museums", "Beaches", "Foodie tour", "Nightlife", "Shopping",
    "Nature hikes", "Historical sites", "Photography", "Relaxation", "Local Markets"
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h1 className="text-3xl font-display font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Plan a New Journey
          </h1>
        </div>
        <p className="text-xs text-zinc-500">
          Set your configurations. Gemini AI will handle the scheduling.
        </p>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg text-xs">
          {formError}
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">
          {/* Card 1: Trip Overview (40%) */}
          <Card className="lg:col-span-4 bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3.5 h-full">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 font-display flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>Trip Overview</span>
              </h3>

              <Input
                label="Trip Title"
                id="title"
                placeholder="e.g. Kyoto Sakura Getaway"
                error={errors.title?.message}
                {...register("title")}
              />

              <Input
                label="Destination"
                id="destination"
                placeholder="e.g. Kyoto, Japan"
                error={errors.destination?.message}
                {...register("destination")}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Start Date"
                  id="startDate"
                  type="date"
                  error={errors.startDate?.message}
                  {...register("startDate")}
                />
                <Input
                  label="End Date"
                  id="endDate"
                  type="date"
                  error={errors.endDate?.message}
                  {...register("endDate")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Budget Limit (Rs)"
                  id="budget"
                  type="number"
                  placeholder="e.g. 50000"
                  error={errors.budget?.message}
                  {...register("budget")}
                />
                <Input
                  label="Total Travelers"
                  id="travelers"
                  type="number"
                  placeholder="e.g. 1"
                  error={errors.travelers?.message}
                  {...register("travelers")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Custom Preferences & Interests (30%) */}
          <Card className="lg:col-span-3 bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3 h-full justify-between">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 font-display flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span>Custom Preferences</span>
                </h3>

                <div className="flex gap-1.5">
                  <div className="w-full">
                    <input
                      type="text"
                      placeholder="e.g. Fine dining, Art history..."
                      value={prefInput}
                      onChange={(e) => setPrefInput(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-905 dark:bg-zinc-900 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/10 dark:text-zinc-100 rounded-lg px-3 py-2 text-xs transition-all placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPreference(e);
                        }
                      }}
                    />
                  </div>
                  <Button variant="secondary" size="xs" onClick={handleAddPreference} className="shrink-0 h-[34px]">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Tag pool */}
                {preferences.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-900 max-h-16 overflow-y-auto">
                    {preferences.map((pref, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-white border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-full shadow-sm"
                      >
                        <span>{pref}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePreference(i)}
                          className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-0.5"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested list */}
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Suggested Focuses</span>
                <div className="flex flex-wrap gap-1">
                  {popularPrefs.map((pref) => {
                    const isAdded = preferences.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        disabled={isAdded}
                        onClick={() => addPopularPreference(pref)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          isAdded
                            ? "bg-indigo-50 border-indigo-150 text-indigo-650 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-400 opacity-60"
                            : "bg-transparent border-zinc-200 text-zinc-550 hover:text-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-700"
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Style Settings (30%) */}
          <Card className="lg:col-span-3 bg-white border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800/80 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3 h-full">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 font-display flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                <CheckCircle className="h-4 w-4 text-indigo-500" />
                <span>Style Settings</span>
              </h3>

              {/* Trip Type selection */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wide uppercase select-none">
                  Travel Companion Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "solo", label: "Solo" },
                    { id: "couple", label: "Couple" },
                    { id: "family", label: "Family" },
                    { id: "friends", label: "Friends" },
                    { id: "business", label: "Work" },
                  ].map((type) => (
                    <label
                      key={type.id}
                      className="cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={type.id}
                        className="peer sr-only"
                        {...register("tripType")}
                      />
                      <div className="border border-zinc-200 bg-zinc-50 dark:border-zinc-805 dark:bg-zinc-900/40 rounded-lg py-1 px-0.5 text-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 peer-checked:border-indigo-500 dark:peer-checked:border-indigo-400 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-950/20 peer-checked:text-indigo-650 dark:peer-checked:text-indigo-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/30">
                        {type.label}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.tripType?.message && (
                  <span className="text-xs text-rose-500 font-medium">
                    {errors.tripType.message}
                  </span>
                )}
              </div>

              {/* Transport mode selection */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="transportMode" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 tracking-wide uppercase">
                  Preferred Transport Mode
                </label>
                <select
                  id="transportMode"
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-905 dark:bg-zinc-900 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs rounded-lg px-2.5 py-1.5 transition-all dark:text-zinc-100 cursor-pointer focus:outline-none"
                  {...register("transportMode")}
                >
                  <option value="any">Any / Combination</option>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="car">Rental Car</option>
                </select>
              </div>

              {/* Accommodation selection */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="accommodationType" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 tracking-wide uppercase">
                  Preferred Stay Type
                </label>
                <select
                  id="accommodationType"
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-905 dark:bg-zinc-900 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs rounded-lg px-2.5 py-1.5 transition-all dark:text-zinc-100 cursor-pointer focus:outline-none"
                  {...register("accommodationType")}
                >
                  <option value="any">Any / Custom</option>
                  <option value="hotel">Hotel</option>
                  <option value="hostel">Hostel</option>
                  <option value="resort">Resort</option>
                  <option value="homestay">Homestay</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit panel */}
        <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-1">
          <Button
            type="submit"
            className="w-full sm:w-auto px-7 py-2 text-xs"
            loading={mutation.isLoading}
          >
            Configure & Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
