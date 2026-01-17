import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, className = "", ...props }, ref) => {
        return (
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <input
                        ref={ref}
                        type="checkbox"
                        className="
              peer sr-only
            "
                        {...props}
                    />
                    <div
                        className="
              w-5 h-5 rounded-md border-2 border-slate-300 dark:border-gray-600
              bg-white dark:bg-gray-800
              peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600
              peer-checked:border-transparent
              peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2
              transition-all duration-300
              group-hover:border-indigo-400
              flex items-center justify-center
            "
                    >
                        <svg
                            className="
                w-3 h-3 text-white
                opacity-0 peer-checked:opacity-100
                transition-opacity duration-300
              "
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {label && (
                    <span className="text-sm text-slate-700 dark:text-slate-300 select-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;