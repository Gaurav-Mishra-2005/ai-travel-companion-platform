import { searchPlace } from "./location.service.js";

const getAuthorizedTrip = async (userId, tripId) => {
    const trip = await Trip.findById(tripId);

    if (!trip)
        throw new ApiError(404, "Trip not found");

    if (trip.userId.toString() !== userId.toString())
        throw new ApiError(403, "Unauthorized access to trip");

    return trip;
};

const enrichLocation = async (activity) => {
    if (!activity.location) return;

    const place = await searchPlace(activity.location);

    if (place) {
        activity.coordinates = {
            lat: Number(place.lat),
            lng: Number(place.lon),
        };

        activity.displayAddress = place.display_name;
        activity.osmId = place.osm_id;
    } else {
        activity.coordinates = null;
        activity.displayAddress = null;
        activity.osmId = null;
    }
};

export default {getAuthorizedTrip, enrichLocation};