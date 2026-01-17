import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Basic validation
        const newErrors: { email?: string; password?: string } = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // TODO: Replace with your Laravel API endpoint
            const response = await fetch("http://your-laravel-api.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    remember: formData.remember,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token (use localStorage or cookies)
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // Redirect to dashboard
                window.location.href = "/dashboard";
            } else {
                // Handle Laravel validation errors
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ email: data.message || "Login failed" });
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrors({ email: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    {/* Logo & Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/50 animate-bounce-slow">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>

                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {/* Email Input */}
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="you@example.com"
                            icon={<EnvelopeIcon className="w-5 h-5" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                            autoComplete="email"
                            disabled={loading}
                        />

                        {/* Password Input */}
                        <Input
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            icon={<LockClosedIcon className="w-5 h-5" />}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                            autoComplete="current-password"
                            disabled={loading}
                        />

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <Checkbox
                                label="Remember me"
                                checked={formData.remember}
                                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                disabled={loading}
                            />

                            <Link
                                to="/forgot-password"
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            icon={!loading && <ArrowRightIcon className="w-5 h-5" />}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-white p-12">
                    <div className="max-w-md text-center space-y-6">
                        <h2 className="text-5xl font-bold leading-tight">
                            Start your journey with us
                        </h2>
                        <p className="text-xl text-white/80">
                            Discover the world's best business management platform
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}