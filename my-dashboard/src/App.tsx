import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Login from "./pages/auth/Login";

// Import Pages
import Dashboard from "./pages/dashboard/Dashboard";
import MainSettings from "./pages/settings/MainSettings";
import HeroSection from "./pages/sections/HeroSection";
import AboutSection from "./pages/sections/AboutSection";
import JourneySection from "./pages/sections/JourneySection";
import GalleryManagement from "./pages/gallery/GalleryManagement";
import MessagesManagement from "./pages/contact/MessagesManagement";

// Dashboard Layout Component
function DashboardLayout({ children }: { children: React.ReactNode }) {
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
        document.documentElement.dir = rtl ? "ar" : "en";
    }, [rtl]);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar rtl={rtl} darkMode={darkMode} />
            <div className="flex flex-col flex-1">
                <Navbar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    rtl={rtl}
                    setRtl={setRtl}
                />
                <main className="flex-1 p-6">
                    {children}
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

            {/* Dashboard Routes - wrapped in DashboardLayout */}
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/settings/main" element={<DashboardLayout><MainSettings /></DashboardLayout>} />
            {/* Sections Routes */}
            <Route path="/sections/hero" element={<DashboardLayout><HeroSection /></DashboardLayout>} />
            <Route path="/sections/about" element={<DashboardLayout><AboutSection /></DashboardLayout>} />
            <Route path="/sections/journey" element={<DashboardLayout><JourneySection /></DashboardLayout>} />

            {/* Gallery Routes */}
            <Route path="/gallery/management" element={<DashboardLayout><GalleryManagement /></DashboardLayout>} />

            {/* Contact Routes */}
            <Route path="/contact/messages" element={<DashboardLayout><MessagesManagement /></DashboardLayout>} />

            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
