import { useState } from "react";
import contactMessagesService, {
    ContactMessage,
    PaginatedResponse,
} from "../services/contactMessagesService";

export function useContactMessages() {
    const [messages, setMessages] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = async (page: number = 1, perPage: number = 10) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching messages...");
            const data = await contactMessagesService.getAll(page, perPage);
            console.log("Messages fetched:", data);
            setMessages(data);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch messages";
            setError(errorMessage);
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await contactMessagesService.delete(id);
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to delete message";
            setError(errorMessage);
            console.error("Error deleting message:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const bulkDeleteMessages = async (ids?: number[]) => {
        setLoading(true);
        setError(null);
        try {
            const response = await contactMessagesService.bulkDelete(ids);
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to delete messages";
            setError(errorMessage);
            console.error("Error bulk deleting messages:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        loading,
        error,
        fetchMessages,
        deleteMessage,
        bulkDeleteMessages,
    };
}
