import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Login from "./pages/auth/Login";

// Dashboard Layout Component
function DashboardLayout() {
    const [darkMode, setDarkMode] = useState(false);
    const [rtl, setRtl] = useState(false);

    useEffect(() => {
        const html = document.documentElement;
        if (darkMode) {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        document.documentElement.dir = rtl ? "rtl" : "ltr";
    }, [rtl]);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar rtl={rtl} darkMode={darkMode} />
            <div className="flex-1 flex flex-col">
                <Navbar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    rtl={rtl}
                    setRtl={setRtl}
                />
                <main className="flex-1 p-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        Welcome to My Dashboard
                    </h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        This is your modern business dashboard.
                    </p>
                </main>
            </div>
        </div>
    );
}

// Main App with Routes
export default function App() {
    return (
        <Routes>
            {/* Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard Route */}
            <Route path="/dashboard" element={<DashboardLayout />} />

            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}