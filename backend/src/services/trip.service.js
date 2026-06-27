import Trip from "../models/trip.model.js";
import ApiError from "../utils/apiError.js";
import { generateTripPlan } from "../services/gemini.service.js"
import {getAuthorizedTrip, enrichLocation } from "../utils/trip.helper.js"

export const createTripService = async ( userId, tripData ) => {
    const {
        title,
        destination,
        startDate,
        endDate,
        budget,
        travelers,
        tripType,
        transportMode,
        accommodationType,
        preferences,
    } = tripData;

    if (!title || !destination || !startDate || !endDate || !budget || !tripType) {
        throw new ApiError(400, "Missing required fields");
    }

    if (new Date(endDate) < new Date(startDate)) {
        throw new ApiError(400, "End date cannot be before start date");
    }

    const trip = new Trip({
        userId,
        title,
        destination,
        startDate,
        endDate,
        budget,
        travelers,
        tripType,
        transportMode,
        accommodationType,
        preferences,
    });

    await trip.save();

    return trip;
};

export const getTripsService = async (userId) => {
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    return trips;
};

export const getTripByIdService = (userId, tripId) => getAuthorizedTrip(userId, tripId);

export const updateTripService = async (userId, tripId, updateData) => {
    const trip = await getAuthorizedTrip(userId, tripId);

    const startDate =  updateData.startDate || trip.startDate;
    const endDate =  updateData.endDate || trip.endDate;

    if (new Date(endDate) < new Date(startDate)) {
        throw new ApiError(400, "End date cannot be before start date");
    } 

    Object.assign(trip, updateData);

    await trip.save();
    return trip;
};

export const deleteTripService = async (userId, tripId) => {
    const trip = await getAuthorizedTrip(userId, tripId);

    await trip.deleteOne();
};

export const deleteAllTripsService = async (userId) => {
    await Trip.deleteMany({ userId });
};
