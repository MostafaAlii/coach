import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

export interface PaginatedResponse {
    data: ContactMessage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data: ContactMessage[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
}

class ContactMessagesService {
    async getAll(
        page: number = 1,
        perPage: number = 10,
    ): Promise<PaginatedResponse> {
        try {
            const response = await axios.get<ApiResponse>(
                `${API_BASE_URL}/contact-messages?page=${page}&per_page=${perPage}`,
            );
            console.log("API Response:", response.data);

            // Check if pagination exists
            if (!response.data.pagination) {
                console.error("Pagination data missing!");
                return {
                    data: response.data.data || [],
                    current_page: 1,
                    last_page: 1,
                    per_page: perPage,
                    total: response.data.data?.length || 0,
                    from: 1,
                    to: response.data.data?.length || 0,
                };
            }

            // Transform the response to match our interface
            return {
                data: response.data.data || [],
                current_page: response.data.pagination.current_page,
                last_page: response.data.pagination.last_page,
                per_page: response.data.pagination.per_page,
                total: response.data.pagination.total,
                from: response.data.pagination.from,
                to: response.data.pagination.to,
            };
        } catch (error) {
            console.error("Error fetching messages:", error);
            throw error;
        }
    }

    async delete(id: number): Promise<{ success: boolean; message: string }> {
        const response = await axios.post<{
            success: boolean;
            message: string;
        }>(`${API_BASE_URL}/contact-messages/delete`, { id });
        return {
            success: response.data.success,
            message: response.data.message,
        };
    }

    async bulkDelete(
        ids?: number[],
    ): Promise<{ success: boolean; message: string; deleted_count: number }> {
        const response = await axios.post<{
            success: boolean;
            message: string;
            data: { deleted_count: number };
        }>(`${API_BASE_URL}/contact-messages/bulk-delete`, { ids });
        return {
            success: response.data.success,
            message: response.data.message,
            deleted_count: response.data.data.deleted_count,
        };
    }
}

export default new ContactMessagesService();
