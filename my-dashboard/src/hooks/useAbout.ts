import { useState } from "react";
import aboutService, {
    About,
    AboutApiResponse,
} from "../services/aboutService";

interface UseAboutReturn {
    about: About | null;
    loading: boolean;
    error: string | null;
    fetchAbout: () => Promise<void>;
    saveAbout: (
        title: string,
        paragraphs: string[],
        image: File,
        status: "active" | "inactive",
    ) => Promise<any>;
}

/**
 * Custom Hook for About Section
 */
export const useAbout = (): UseAboutReturn => {
    const [about, setAbout] = useState<About | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch About Data
     */
    const fetchAbout = async () => {
        try {
            setLoading(true);
            setError(null);

            const response: AboutApiResponse = await aboutService.get();

            if (response.success && response.data.length > 0) {
                // We only expect ONE parent about
                setAbout(response.data[0]);
            } else {
                setAbout(null);
            }
        } catch (err) {
            console.error("Fetch About Error:", err);
            setError("Failed to load about data");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save (Create / Update) About
     */
    const saveAbout = async (
        title: string,
        paragraphs: string[],
        image: File,
        status: "active" | "inactive",
    ) => {
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();

            // Parent
            if (about?.id) {
                formData.append("id", String(about.id));
            }

            formData.append("title", title);
            formData.append("status", status);
            formData.append("about", image);

            // Children (Paragraphs)
            paragraphs.forEach((text, index) => {
                formData.append(`children[${index}][title]`, text);
                formData.append(`children[${index}][status]`, "active");

                // Important: send child id on update
                if (about?.children?.[index]?.id) {
                    formData.append(
                        `children[${index}][id]`,
                        String(about.children[index].id),
                    );
                }
            });

            const response = await aboutService.upsert(formData);

            // Refresh data after save
            await fetchAbout();

            return response;
        } catch (err) {
            console.error("Save About Error:", err);
            setError("Failed to save about data");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        about,
        loading,
        error,
        fetchAbout,
        saveAbout,
    };
};

