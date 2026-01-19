// src/services/heroService.ts
import api from "../api/axios";

export interface HeroMedia {
    id: number;
    file_name: string;
    urls: {
        original: string;
    };
}

export interface HeroResponse {
    id: number;
    title: string;
    description: string;
    status: string;
    media: HeroMedia[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const heroService = {
    // Get hero section
    async getHero(): Promise<ApiResponse<HeroResponse>> {
        const response = await api.get("/hero");
        return response.data;
    },

    // Create or Update hero section
    async saveHero(
        title: string,
        description: string,
        image: File,
        status: string = "active"
    ): Promise<ApiResponse<HeroResponse>> {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("status", status);
        formData.append("image", image);

        const response = await api.post("/hero", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = progressEvent.total
                    ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    : 0;
                window.dispatchEvent(
                    new CustomEvent("upload-progress", {
                        detail: { progress: percentCompleted },
                    })
                );
            },
        });

        return response.data;
    },

    // Update hero section
    async updateHero(
        id: number,
        title: string,
        description: string,
        image?: File,
        status: string = "active"
    ): Promise<ApiResponse<HeroResponse>> {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("status", status);
        if (image) {
            formData.append("image", image);
        }

        const response = await api.post(`/hero/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = progressEvent.total
                    ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    : 0;
                window.dispatchEvent(
                    new CustomEvent("upload-progress", {
                        detail: { progress: percentCompleted },
                    })
                );
            },
        });

        return response.data;
    },

    // Delete hero section
    async deleteHero(id: number): Promise<ApiResponse<void>> {
        const response = await api.delete(`/hero/${id}`);
        return response.data;
    }
};

// تصدير Types فقط
export type { HeroResponse, HeroMedia, ApiResponse };
