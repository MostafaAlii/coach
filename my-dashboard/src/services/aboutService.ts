import api from "../api/axios";

/**
 * Types
 */
export interface AboutMedia {
    id: number;
    urls: {
        original: string;
    };
}

export interface AboutChild {
    id?: number;
    title: string;
    status?: "active" | "inactive";
}

export interface About {
    id: number;
    title: string;
    status: "active" | "inactive";
    media?: AboutMedia[];
    children: AboutChild[];
}

export interface AboutApiResponse {
    success: boolean;
    message: string;
    data: About[];
}

/**
 * About API Service
 */
const aboutService = {
    /**
     * Get About Tree (parent + children)
     */
    async get(): Promise<AboutApiResponse> {
        const response = await api.get<AboutApiResponse>("/about");
        return response.data;
    },

    /**
     * Create or Update About Section (Upsert)
     */
    async upsert(formData: FormData) {
        const response = await api.post("/about", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (event) => {
                if (!event.total) return;
                const progress = Math.round((event.loaded * 100) / event.total);
                window.dispatchEvent(
                    new CustomEvent("upload-progress", {
                        detail: { progress },
                    }),
                );
            },
        });

        return response.data;
    },
};

export default aboutService;
