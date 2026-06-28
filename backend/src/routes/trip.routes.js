import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip, deleteAllTrips,
         generateItinerary, regenerateDay, updateActivity, addActivity, deleteActivity } from "../controllers/trip.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getTrips);
router.get("/:id", authMiddleware, getTripById);
router.patch("/:id", authMiddleware, updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);
router.delete("/", authMiddleware, deleteAllTrips);
router.post("/:id/itinerary", authMiddleware, generateItinerary);
router.post("/:id/regenerate-day/:dayNumber",authMiddleware,regenerateDay);

router.patch("/:id/day/:dayNumber/activity/:activityIndex", authMiddleware, updateActivity);
router.post("/:id/day/:dayNumber/activity", authMiddleware, addActivity);
router.delete("/:id/day/:dayNumber/activity/:activityIndex", authMiddleware, deleteActivity);



export default router;
