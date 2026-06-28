import {createTripService, getTripsService, getTripByIdService, updateTripService, deleteTripService, deleteAllTripsService} from "../services/trip.service.js";

import { generateItineraryService, regenerateDayService } from "../services/itinerary.service.js"
import { updateActivityService, addActivityService, deleteActivityService, regenerateActivityService } from "../services/activity.service.js"

export const createTrip = async (req, res) => {
    try {
        const trip = await createTripService(req.user._id, req.body);
        return res.status(201).json({
            success: true,
            message: "Trip created successfully",
            data: trip,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrips = async (req, res) => {
    try {
        const trips = await getTripsService(req.user._id);

        return res.status(200).json({
            success: true,
            count: trips.length,
            data: trips,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTripById = async (req, res) => {
    try {
        const trip = await getTripByIdService(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            data: trip,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        }); 
    }
};

export const updateTrip = async (req, res) => {
    try {
        const trip = await updateTripService(req.user._id, req.params.id, req.body);

        return res.status(200).json({
            success: true,
            message: "Trip updated successfully",
            data: trip,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        await deleteTripService(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            message: "Trip deleted successfully",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteAllTrips = async (req, res) => {
    try {
        await deleteAllTripsService(req.user._id);
        return res.status(200).json({
            success: true,
            message: "All trips deleted successfully",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const generateItinerary = async (req, res) => {
    try {
        const trip = await generateItineraryService(req.user._id, req.params.id);
        return res.status(200).json({
            success: true,
            message: "Itinerary generated successfully",
            data: trip,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const regenerateDay = async (req, res) => {
    try {

        const trip = await regenerateDayService( req.user._id, req.params.id, Number(req.params.dayNumber));

        return res.status(200).json({
            success: true,
            message: "Day regenerated successfully",
            data: trip
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateActivity = async (req, res) => {
    try {
        const trip = await updateActivityService(
            req.user._id,
            req.params.id,
            Number(req.params.dayNumber),
            Number(req.params.activityIndex),
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Activity updated successfully",
            data: trip
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const addActivity = async (req, res) => {
    try {
        const trip = await addActivityService(
        req.user._id,
        req.params.id,
        Number(req.params.dayNumber),
        req.body
        );

        return res.status(200).json({
            success: true,
            message: "Activity added successfully",
            data: trip
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteActivity = async (req, res) => {
    try {
        const trip = await deleteActivityService(
        req.user._id,
        req.params.id,
        Number(req.params.dayNumber),
        Number(req.params.activityIndex)
        );

        return res.status(200).json({
            success: true,
            message: "Activity deleted successfully",
            data: trip
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

export const regenerateActivity = async (req, res) => {
    try {
        const trip = await regenerateActivityService(
        req.user._id,
        req.params.id,
        Number(req.params.dayNumber),
        Number(req.params.activityIndex)
        );

        return res.status(200).json({
            success: true,
            message: "Activity regenerated successfully",
            data: trip
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}