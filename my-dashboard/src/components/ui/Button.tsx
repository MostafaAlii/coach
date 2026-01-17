import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = "primary",
            size = "md",
            loading = false,
            fullWidth = false,
            icon,
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
      ${fullWidth ? "w-full" : ""}
    `;

        const variants = {
            primary: `
        bg-gradient-to-r from-indigo-600 to-purple-600
        hover:from-indigo-700 hover:to-purple-700
        text-white shadow-lg shadow-indigo-500/50
        hover:shadow-xl hover:shadow-indigo-600/50
        focus:ring-indigo-500
      `,
            secondary: `
        bg-slate-200 dark:bg-gray-700
        hover:bg-slate-300 dark:hover:bg-gray-600
        text-slate-900 dark:text-white
        focus:ring-slate-500
      `,
            outline: `
        border-2 border-indigo-600 dark:border-indigo-400
        text-indigo-600 dark:text-indigo-400
        hover:bg-indigo-50 dark:hover:bg-indigo-900/20
        focus:ring-indigo-500
      `,
            ghost: `
        text-slate-700 dark:text-slate-300
        hover:bg-slate-100 dark:hover:bg-gray-800
        focus:ring-slate-500
      `,
            danger: `
        bg-gradient-to-r from-red-600 to-pink-600
        hover:from-red-700 hover:to-pink-700
        text-white shadow-lg shadow-red-500/50
        hover:shadow-xl hover:shadow-red-600/50
        focus:ring-red-500
      `,
        };

        const sizes = {
            sm: "px-3 py-2 text-sm",
            md: "px-5 py-3 text-base",
            lg: "px-6 py-4 text-lg",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && <span className="flex-shrink-0">{icon}</span>}
                        {children}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;