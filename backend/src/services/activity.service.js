import ApiError from "../utils/apiError.js";
import {getAuthorizedTrip, enrichLocation } from "../utils/trip.helper.js"


export const updateActivityService = async (
        userId,
        tripId,
        dayNumber,
        activityIndex,
        updateData
    ) => {

    const trip = await getAuthorizedTrip(userId, tripId);

    if (!trip.itineraryGenerated || !trip.itinerary) {
        throw new ApiError( 400, "Generate itinerary first");
    }

    const day = trip.itinerary.find(d => d.day === dayNumber);
    if (!day) {
        throw new ApiError(404, `Day ${dayNumber} not found`);
    }

    const activity = day.activities[activityIndex];
    if (!activity) {
        throw new ApiError(404, "Activity not found");
    }

    const oldLocation = activity.location;
    Object.assign(activity, updateData);

    if ( updateData.location && updateData.location !== oldLocation) {
        await enrichLocation(activity);
    }

    trip.markModified("itinerary"); // for ref - check this in addActivityService
    await trip.save();

    return trip;

};

export const addActivityService = async (
        userId,
        tripId,
        dayNumber,
        activityData
    ) => {
    const trip = await getAuthorizedTrip(userId, tripId);

    if (!trip.itineraryGenerated || !trip.itinerary) {
        throw new ApiError( 400, "Generate itinerary first");
    }

    const day = trip.itinerary.find(d => d.day === dayNumber);
    if (!day) {
        throw new ApiError(404, `Day ${dayNumber} not found`);
    }

    const { time, title, location, notes } = activityData;
    if(!location || !title || !time){
        throw new ApiError( 400, "Time, title, and location are required.");
    }

    const newActivity = {
        time,
        title,
        location,
        notes
    };

        await enrichLocation(newActivity);

        day.activities.push(newActivity);
        day.activities.sort((a, b) => a.time.localeCompare(b.time));

        trip.markModified("itinerary");
          // type: Object is treated by Mongoose as a Mixed object. 
        // For Mixed types, Mongoose does not detect deep changes like -> day.activities.push(...) or activity.title = ... ,unless you explicitly tell it.

        await trip.save();

        // const freshTrip = await Trip.findById(tripId);
        // console.log("Fresh Trip :" , freshTrip.itinerary.find(d => d.day === dayNumber).activities);
      
        return trip;
       

};

export const deleteActivityService = async (
        userId,
        tripId,
        dayNumber,
        activityIndex
    ) => {
    const trip = await getAuthorizedTrip(userId, tripId);

    if (!trip.itineraryGenerated || !trip.itinerary) {
        throw new ApiError( 400, "Generate itinerary first");
    }

    const day = trip.itinerary.find(d => d.day === dayNumber);
    if (!day) {
        throw new ApiError(404, `Day ${dayNumber} not found`);
    }

    const activity = day.activities[activityIndex];
    if (!activity) {
        throw new ApiError(404, "Activity not found");
    }

    day.activities.splice(activityIndex, 1);

        trip.markModified("itinerary");
        await trip.save();

        return trip;
       

};