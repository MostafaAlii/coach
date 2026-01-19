interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export default function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={`
                        w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                        ${checked
                            ? "bg-indigo-600"
                            : "bg-slate-300 dark:bg-gray-600"
                        }
                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                />
                <div
                    className={`
                        absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full
                        transition-transform duration-200 ease-in-out
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                />
            </div>
            {label && (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </span>
            )}
        </label>
    );
}
