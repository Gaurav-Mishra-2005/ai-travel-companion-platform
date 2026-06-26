import axios from "axios";

export const searchPlace = async (placeName) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: placeName,
                    format: "jsonv2",
                    limit: 1,
                },
                headers: {
                    "User-Agent": "AI-Travel-Planner",
                },
            }
        );

        return response.data[0] || null;
    } catch (error) {
        return null;
    }
};