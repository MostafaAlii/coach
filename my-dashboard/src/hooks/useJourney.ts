import { useState, useEffect } from "react";
import { journeyService, JourneyPayload } from "../services/journeyService";
import api from "../api/axios";
export interface JourneyItem {
  id: number;
  title: string;
  type: "service" | "certificate" | "";
  status: "active" | "inactive";
  parent_id: number | null;
  points?: JourneyItem[];
  isChild?: boolean;
  level?: number;
  parentTitle?: string;
}

export const useJourney = () => {
    const [journeys, setJourneys] = useState<JourneyItem[]>([]);
    const [flattenedJourneys, setFlattenedJourneys] = useState<JourneyItem[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const flattenJourneys = (
        items: JourneyItem[],
        parentId: number | null = null,
        level = 0,
    ): JourneyItem[] => {
        let result: JourneyItem[] = [];
        items.forEach((item) => {
            const parentItem = {
                ...item,
                parent_id: parentId,
                isChild: level > 0,
                level: level,
            };
            result.push(parentItem);
            if (item.points && item.points.length > 0) {
                const childItems = flattenJourneys(
                    item.points,
                    item.id,
                    level + 1,
                );
                result = [...result, ...childItems];
            }
        });
        return result;
    };

    // Fetch all journeys
    const fetchJourneys = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await journeyService.getJourneys();
            setJourneys(data);
            const flattened = flattenJourneys(data);
            setFlattenedJourneys(flattened);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch journeys");
        } finally {
            setLoading(false);
        }
    };

    // Save journey (create new)
    const saveJourney = async (formData: {
        mainTitle: string;
        type: "service" | "certificate" | "";
        status: boolean;
        points: string[];
    }) => {
        setLoading(true);
        setError(null);
        try {
            const payload: JourneyPayload = {
                title: formData.mainTitle,
                type: formData.type,
                status: formData.status ? "active" : "inactive",
                children: formData.points.map((p) => ({ title: p })),
            };
            await journeyService.createJourney(payload);
            // Refresh journeys list
            await fetchJourneys();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save journey");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update journey
    const updateJourney = async (id: number, data: Partial<JourneyItem>) => {
        setLoading(true);
        setError(null);
        try {
            const payload: JourneyPayload = {
                title: data.title || "",
                type: data.type || "service",
                status: data.status || "active",
            };
            if (data.parent_id) {
                payload.children = undefined;
            }
            await journeyService.updateJourney(id, payload);
            await fetchJourneys();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to update journey");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteJourney = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await journeyService.deleteJourney(id);
            await fetchJourneys();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to delete journey");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addPointsToJourney = async (journeyId: number, points: string[]) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/journeys/${journeyId}/points`,{points: points.map(p => ({ title: p })),});
            await fetchJourneys();
            return response.data;
        } catch (err: any) {
            console.error(err.response?.data);
            setError(err.response?.data?.message || "Failed to add points");
            throw err;
        } finally {
            setLoading(false);
        }
    };
    return {
        journeys,
        flattenedJourneys,
        loading,
        error,
        fetchJourneys,
        saveJourney,
        updateJourney,
        deleteJourney,
        addPointsToJourney,
    };
};
