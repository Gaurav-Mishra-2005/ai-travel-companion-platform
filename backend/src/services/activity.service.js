import ApiError from "../utils/apiError.js";
import {getAuthorizedTrip, enrichLocation } from "../utils/trip.helper.js"
import { generateTripPlan } from "./gemini.service.js";


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

export const regenerateActivityService = async (
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

    const prompt = `
                Generate an alternative activity for an existing travel itinerary.

                Trip Details:

                Destination: ${trip.destination}
                Budget: ${trip.budget}
                Travelers: ${trip.travelers}
                Trip Type: ${trip.tripType}
                Transport Mode: ${trip.transportMode}
                Accommodation Type: ${trip.accommodationType}
                Preferences: ${trip.preferences?.join(", ") || "None"}

                Current Day Schedule:

                ${JSON.stringify(day, null, 2)}

                Current Activity to Replace:

                ${JSON.stringify(activity, null, 2)}

                Requirements:

                - Replace ONLY the current activity.
                - Keep the same time (${activity.time}).
                - Do NOT change the day number.
                - Do NOT change the date.
                - Do NOT modify any other activities.
                - Generate a different attraction or experience.
                - Match the same budget.
                - Match the same travel style.
                - The location must be a real place in or very near ${trip.destination}. Avoid fictional, generic, or duplicate locations already present in the day's itinerary.
                -The new activity must be different from every activity already scheduled on this day. Do not repeat any attraction, restaurant, viewpoint, museum, beach, or experience already present in the day's itinerary.
                - Include transportation suggestion in the notes if appropriate.
                - Return ONLY one activity.

                Return ONLY valid JSON in exactly this format:

                {
                    "time": "${activity.time}",
                    "title": "Activity Name",
                    "location": "Place Name",
                    "notes": "Short description"
                }

                Do not include markdown.
                Do not include \`\`\`json.
                Do not include explanations.
                Do not include any text before or after the JSON.
                Return JSON only.
                `;

        let aiResponse;
    
        try {
            aiResponse = await generateTripPlan(prompt);
        } catch (error) {
    
            if (error.status === 503) {
                throw new ApiError( 503, "AI service is busy. Please try again.");
            }
    
            throw new ApiError( 500, "Failed to regenerate activity");
        }
    
        const cleanedResponse = aiResponse
                                .replace(/```json/g, "")
                                .replace(/```/g, "")
                                .trim();
    
        let regeneratedActivity;

        try {
            regeneratedActivity = JSON.parse(cleanedResponse);
        } catch (error) {
            throw new ApiError(500, "Failed to parse regenerated activity");
        }

    
        if (
            !regeneratedActivity || !regeneratedActivity.time || !regeneratedActivity.title || !regeneratedActivity.location || !regeneratedActivity.notes) {
            throw new ApiError(500, "Invalid regenerated activity structure");
        }

        await enrichLocation(regeneratedActivity);

        day.activities[activityIndex] = regeneratedActivity;

    trip.markModified("itinerary");
        await trip.save();

        return trip;
}