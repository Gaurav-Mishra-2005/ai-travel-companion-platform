import api from "./api";

export const getTrips = async () => {
  const response = await api.get("/api/trips");
  return response.data;
};

export const getTripById = async (id) => {
  const response = await api.get(`/api/trips/${id}`);
  return response.data;
};

export const createTrip = async (tripData) => {
  const response = await api.post("/api/trips", tripData);
  return response.data;
};

export const updateTrip = async (id, tripData) => {
  const response = await api.patch(`/api/trips/${id}`, tripData);
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await api.delete(`/api/trips/${id}`);
  return response.data;
};

export const deleteAllTrips = async () => {
  const response = await api.delete("/api/trips");
  return response.data;
};

export const generateItinerary = async (id) => {
  const response = await api.post(`/api/trips/${id}/itinerary`);
  return response.data;
};

export const regenerateDay = async (id, dayNumber) => {
  const response = await api.post(`/api/trips/${id}/regenerate-day/${dayNumber}`);
  return response.data;
};

export const updateActivity = async (id, dayNumber, activityIndex, activityData) => {
  const response = await api.patch(
    `/api/trips/${id}/day/${dayNumber}/activity/${activityIndex}`,
    activityData
  );
  return response.data;
};

export const addActivity = async (id, dayNumber, activityData) => {
  const response = await api.post(
    `/api/trips/${id}/day/${dayNumber}/activity`,
    activityData
  );
  return response.data;
};

export const deleteActivity = async (id, dayNumber, activityIndex) => {
  const response = await api.delete(
    `/api/trips/${id}/day/${dayNumber}/activity/${activityIndex}`
  );
  return response.data;
};

export const regenerateActivity = async (id, dayNumber, activityIndex) => {
  const response = await api.post(
    `/api/trips/${id}/day/${dayNumber}/activity/${activityIndex}/regenerate`
  );
  return response.data;
};
