import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const [darkMode, setDarkMode] = useState(false);
    const [rtl, setRtl] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        document.documentElement.dir = rtl ? "rtl" : "ltr";
    }, [rtl]);

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-gray-900">
            <Sidebar darkMode={darkMode} rtl={rtl} />
            <div className="flex flex-col flex-1">
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} rtl={rtl} setRtl={setRtl} />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
