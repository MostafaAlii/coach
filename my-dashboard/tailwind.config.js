/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#6366F1",
            },
            keyframes: {
                "bounce-once": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.25)" },
                },
                "draw-check": {
                    "0%": { strokeDashoffset: "100", strokeDasharray: "100" },
                    "100%": { strokeDashoffset: "0", strokeDasharray: "100" },
                },
            },
            animation: {
                "bounce-once": "bounce-once 0.5s ease-in-out",
                "draw-check": "draw-check 0.3s ease-in-out forwards",
            },
        },
    },
    plugins: [],
};
