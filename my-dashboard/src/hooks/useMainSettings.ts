import { useState } from "react";
import mainSettingsService, {
    MainSetting,
} from "../services/mainSettingsService";

export function useMainSettings() {
    const [settings, setSettings] = useState<MainSetting | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await mainSettingsService.getSettings();
            setSettings(data);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch settings";
            setError(errorMessage);
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (
        name: string,
        phone: string,
        address: string,
        email: string,
        logo: File | null,
        id?: number,
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await mainSettingsService.saveSettings(
                name,
                phone,
                address,
                email,
                logo,
                id,
            );

            // Refresh settings after save
            await fetchSettings();

            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to save settings";
            setError(errorMessage);
            console.error("Error saving settings:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        settings,
        loading,
        error,
        fetchSettings,
        saveSettings,
    };
}
