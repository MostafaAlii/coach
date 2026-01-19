import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request interceptor (for adding token if needed later)
api.interceptors.request.use(
    (config) => {
        // TODO: Add auth token here if needed
        // const token = localStorage.getItem("token");
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        if (error.response?.status === 401) {
            // TODO: Handle unauthorized
            console.error("Unauthorized");
        }
        return Promise.reject(error);
    }
);

export default api;
