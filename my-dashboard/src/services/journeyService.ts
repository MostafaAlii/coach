import api from "../api/axios";

export interface JourneyPayload {
    title: string;
    type: "service" | "certificate" | "";
    status: "active" | "inactive";
    children?: { title: string }[];
}

const getJourneys = async () => {
    const response = await api.get("/journeys");
    return response.data.data.data;
};

const createJourney = async (payload: JourneyPayload) => {
    const response = await api.post("/journeys", payload);
    return response.data;
};

const updateJourney = async (id: number, payload: JourneyPayload) => {
    const response = await api.put(`/journeys/${id}`, payload);
    return response.data;
};

const deleteJourney = async (id: number) => {
    const response = await api.delete(`/journeys/${id}`);
    return response.data;
};

export const journeyService = {
    getJourneys,
    createJourney,
    updateJourney,
    deleteJourney,
};
