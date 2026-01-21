import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export interface MainSetting {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    email: string | null;
    logo: {
        id: number;
        file_name: string;
        urls: {
            original: string;
        };
    } | null;
}

export interface MainSettingResponse {
    success: boolean;
    message: string;
    data: MainSetting;
}

class MainSettingsService {
    private getAuthHeader() {
        const token = localStorage.getItem("auth_token");
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    async getSettings(): Promise<MainSetting> {
        const response = await axios.get<MainSettingResponse>(
            `${API_BASE_URL}/main-settings`,
            this.getAuthHeader(),
        );
        return response.data.data;
    }

    async saveSettings(
        name: string,
        phone: string,
        address: string,
        email: string,
        logo: File | null,
        id?: number,
    ): Promise<{ success: boolean; message: string }> {
        const formData = new FormData();

        if (id) {
            formData.append("id", id.toString());
        }
        formData.append("name", name);
        formData.append("phone", phone || "");
        formData.append("address", address || "");
        formData.append("email", email || "");

        if (logo) {
            formData.append("logo", logo);
        }

        const config = {
            ...this.getAuthHeader(),
            headers: {
                ...this.getAuthHeader().headers,
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent: any) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                );
                // Dispatch custom event for progress tracking
                window.dispatchEvent(
                    new CustomEvent("upload-progress", {
                        detail: { progress: percentCompleted },
                    }),
                );
            },
        };

        const response = await axios.post<MainSettingResponse>(
            `${API_BASE_URL}/main-settings`,
            formData,
            config,
        );

        return {
            success: response.data.success,
            message: response.data.message,
        };
    }
}

export default new MainSettingsService();
