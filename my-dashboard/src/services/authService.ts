// Auth API Service for Laravel Backend

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
    };
}

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// Get CSRF token for Laravel Sanctum
async function getCsrfToken() {
    try {
        await fetch(`${API_BASE_URL.replace("/api", "")}/sanctum/csrf-cookie`, {
            credentials: "include",
        });
    } catch (error) {
        console.error("Failed to get CSRF token:", error);
    }
}

// Helper function to make authenticated requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Important for cookies
    });

    const data = await response.json();

    if (!response.ok) {
        throw data as ApiError;
    }

    return data as T;
}

// Auth Service
export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Get CSRF token first (for Sanctum)
        await getCsrfToken();

        const response = await apiRequest<AuthResponse>("/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });

        // Store token and user in localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        return response;
    },

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        await getCsrfToken();

        const response = await apiRequest<AuthResponse>("/register", {
            method: "POST",
            body: JSON.stringify(data),
        });

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        return response;
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await apiRequest("/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<AuthResponse["user"]> {
        return await apiRequest<AuthResponse["user"]>("/user", {
            method: "GET",
        });
    },

    /**
     * Forgot password - send reset link
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        return await apiRequest<{ message: string }>("/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    },

    /**
     * Reset password
     */
    async resetPassword(data: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<{ message: string }> {
        return await apiRequest<{ message: string }>("/reset-password", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem("token");
        return !!token;
    },

    /**
     * Get stored user data
     */
    getUser(): AuthResponse["user"] | null {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get token
     */
    getToken(): string | null {
        return localStorage.getItem("token");
    },
};

export default authService;
