import { ReactNode, ButtonHTMLAttributes } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    loading?: boolean;
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    loading = false,
    fullWidth = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    // Variant styles
    const variantStyles = {
        primary:
            "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent",
        secondary:
            "bg-slate-600 hover:bg-slate-700 text-white border-transparent",
        danger:
            "bg-red-600 hover:bg-red-700 text-white border-transparent",
        success:
            "bg-green-600 hover:bg-green-700 text-white border-transparent",
        outline:
            "bg-transparent border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700",
    };

    // Size styles
    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    // Icon size based on button size
    const iconSizeClass = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    return (
        <button
            className={`
                inline-flex items-center justify-center gap-2
                rounded-lg border font-medium
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className={`animate-spin ${iconSizeClass[size]}`}
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
                    Loading...
                </>
            ) : (
                <>
                    {icon && iconPosition === "left" && (
                        <span className={iconSizeClass[size]}>{icon}</span>
                    )}
                    {children}
                    {icon && iconPosition === "right" && (
                        <span className={iconSizeClass[size]}>{icon}</span>
                    )}
                </>
            )}
        </button>
    );
}

// Pre-made button variants for common use cases
export function AddButton({
    children = "Add New",
    onClick,
    ...props
}: Omit<ButtonProps, "icon" | "variant">) {
    return (
        <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={onClick}
            {...props}
        >
            {children}
        </Button>
    );
}
