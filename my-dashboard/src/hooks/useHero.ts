import { useState } from "react";
import { heroService, type HeroResponse, type ApiResponse } from "../services/heroService";

export const useHero = () => {
    const [hero, setHero] = useState<HeroResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch hero data
    const fetchHero = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await heroService.getHero();
            if (response.success) {
                setHero(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch hero data");
            console.error("Error fetching hero:", err);
        } finally {
            setLoading(false);
        }
    };

    // Save hero (create or update)
    const saveHero = async (
        title: string,
        description: string,
        image: File,
        status: string = "active"
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await heroService.saveHero(title, description, image, status);
            if (response.success) {
                setHero(response.data);
                return response;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save hero data");
            console.error("Error saving hero:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        hero,
        loading,
        error,
        fetchHero,
        saveHero,
    };
};
