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


export const generateItineraryService = async (userId, tripId) => {
    const trip = await getAuthorizedTrip(userId, tripId);

    const prompt = `
                Generate a personalized travel itinerary.

                The itinerary should:
                - Match the user's budget
                - Match the trip type
                - Match user preferences
                - Include realistic timings
                - Include famous attractions
                - Include meal suggestions
                - Include transportation recommendations

                Trip Details:
                Title: ${trip.title}
                Start Date: ${trip.startDate.toISOString().split("T")[0]}
                End Date: ${trip.endDate.toISOString().split("T")[0]}
                Destination: ${trip.destination}
                Budget: ${trip.budget}
                Travelers: ${trip.travelers}
                Trip Type: ${trip.tripType}
                Transport Mode: ${trip.transportMode}
                Accommodation Type: ${trip.accommodationType}
                Preferences: ${trip.preferences?.join(", ") || "None"}

                IMPORTANT:

                Return ONLY valid JSON.

                Use exactly this format:

                {
                "days": [
                    {
                    "day": 1,
                    "date": "YYYY-MM-DD",
                    "activities": [
                        {
                        "time": "09:00",
                        "title": "Activity Name",
                        "location": "Place",
                        "notes": "Description"
                        }
                    ]
                    }
                ]
                }

                Do not include markdown.
                Do not include \`\`\`json.
                Do not include explanations.
                Do not include any text before or after JSON.
                Return JSON only.
                `;

    let aiResponse;

    try {
        console.log("About to call Gemini");
        aiResponse = await generateTripPlan(prompt);
        console.log("Gemini returned response");
    } catch(error){
        console.error(error);

        if(error.status === 503){
            throw new ApiError(503, "AI service is busy. Please try again.");
        }
        throw new ApiError(500, "Failed to generate itinerary from AI service");
}


    //  Debug logs (development only)
    if (process.env.NODE_ENV === "development") {
        console.log("========== AI RESPONSE ==========");
        console.log(aiResponse);
        console.log("=================================");
    }

    // Remove markdown wrappers if Gemini adds them
    const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    // Parse JSON
    let parsedItinerary;

    try {
        parsedItinerary = JSON.parse(cleanedResponse);
    } catch (error) {
        throw new ApiError(500, "Failed to parse AI itinerary response");
    }

    //  Validate structure
    if ( !parsedItinerary.days || !Array.isArray(parsedItinerary.days)) {
        throw new ApiError( 500, "AI response does not contain a valid days array");
    }

    // location enrichment 
/*    for (const day of parsedItinerary.days) {
    for (const activity of day.activities) {

        if (!activity.location) continue;

        const place = await searchPlace(activity.location);

        if (place) {
            activity.coordinates = {
                lat: Number(place.lat),
                lng: Number(place.lon)
            };

            activity.displayAddress = place.display_name;
            activity.osmId = place.osm_id;
        }
    }
}       */
// If itinerary has:   5 days x 6 activities/day = 30 API calls
// they happen one by one.
// That explains your : POST /itinerary 60848 ms , which is about 60 seconds.
// Faster Version - use promise -> This runs searches concurrently and can reduce: 60 sec → 5-10 sec ,depending on Nominatim rate limits.

    await Promise.all(
        parsedItinerary.days.flatMap(day => day.activities.map(enrichLocation))
    );

    // Save itinerary
    trip.itinerary = parsedItinerary.days;
    trip.itineraryGenerated = true;

    await trip.save();
    // console.log("Iternary", trip.itinerary);

    //  Return updated trip
    return trip;
};

export const regenerateDayService = async ( userId, tripId, dayNumber ) => {
    const trip = await getAuthorizedTrip(userId, tripId);

    if (!trip.itineraryGenerated || !trip.itinerary) {
        throw new ApiError( 400, "Generate itinerary first");
    }

    const dayIndex = trip.itinerary.findIndex( day => day.day === dayNumber);

    if (dayIndex === -1) {
        throw new ApiError( 404, `Day ${dayNumber} not found`);
    }

    const existingDay = trip.itinerary[dayIndex];
    
    const prompt = `
                Generate an alternative itinerary for Day ${dayNumber}.

                Trip Details:

                Destination: ${trip.destination}
                Budget: ${trip.budget}
                Travelers: ${trip.travelers}
                Trip Type: ${trip.tripType}
                Transport Mode: ${trip.transportMode}
                Accommodation Type: ${trip.accommodationType}
                Preferences: ${trip.preferences?.join(", ") || "None"}

                Current Day ${dayNumber}:

                ${JSON.stringify(existingDay, null, 2)}

                Requirements:

                - Generate a completely different version of this day
                - Match the same budget
                - Match the same travel style
                - Include realistic timings
                - Include attractions, meals and transportation suggestions
                - Keep the same date

                Return ONLY valid JSON.

                Format:

                {
                "day": ${dayNumber},
                "date": "${existingDay.date.split("T")[0]}",
                "activities": [
                    {
                    "time": "09:00",
                    "title": "Activity Name",
                    "location": "Place",
                    "notes": "Description"
                    }
                ]
                }

                Do not include markdown.
                Do not include explanations.
                Return JSON only.
                `;
            
    let aiResponse;

    try {
        console.log("For Regenerate : About to call Gemini");
        aiResponse = await generateTripPlan(prompt);
        console.log("For Regenerate : Gemini returned response");
    } catch (error) {

        if (error.status === 503) {
            throw new ApiError( 503, "AI service is busy. Please try again.");
        }

        throw new ApiError( 500, "Failed to regenerate day");
    }

    const cleanedResponse = aiResponse
                            .replace(/```json/g, "")
                            .replace(/```/g, "")
                            .trim();

    let regeneratedDay;

    try {
        regeneratedDay = JSON.parse(cleanedResponse);
    } catch (error) {
        throw new ApiError( 500, "Failed to parse regenerated day");
    }

    if ( !regeneratedDay || !Array.isArray(regeneratedDay.activities) ) {
        throw new ApiError( 500, "Invalid regenerated day structure");
    }

    await Promise.all(
        regeneratedDay.activities.map(enrichLocation)
    );

    trip.itinerary[dayIndex] = regeneratedDay;
    trip.markModified("itinerary");     // for ref - check this in addActivityService
    await trip.save();
    return trip;

};

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