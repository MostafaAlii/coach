import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { CloudArrowUpIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useMainSettings } from "../../hooks/useMainSettings";

interface SettingsData {
    name: string;
    phone: string;
    address: string;
    email: string;
    logo: File | null;
}

interface FormErrors {
    name?: string;
    phone?: string;
    address?: string;
    email?: string;
    logo?: string;
}

export default function MainSettings() {
    const { settings, loading: apiLoading, error: apiError, fetchSettings, saveSettings } = useMainSettings();

    const [formData, setFormData] = useState<SettingsData>({
        name: "",
        phone: "",
        address: "",
        email: "",
        logo: null,
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    // Populate form with existing data
    useEffect(() => {
        if (settings) {
            setFormData({
                name: settings.name,
                phone: settings.phone || "",
                address: settings.address || "",
                email: settings.email || "",
                logo: null,
            });
            // Set logo preview from existing data
            if (settings.logo) {
                setLogoPreview(settings.logo.urls.original);
            }
        }
    }, [settings]);

    // Listen for upload progress
    useEffect(() => {
        const handleProgress = (event: any) => {
            setUploadProgress(event.detail.progress);
        };

        window.addEventListener("upload-progress", handleProgress);
        return () => {
            window.removeEventListener("upload-progress", handleProgress);
        };
    }, []);

    // Handle text inputs
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    // Handle blur to show validation
    const handleBlur = (field: string) => {
        setTouched((prev) => ({
            ...prev,
            [field]: true,
        }));
        validateField(field);
    };

    // Validate single field
    const validateField = (field: string) => {
        const newErrors: FormErrors = { ...errors };

        switch (field) {
            case "name":
                if (!formData.name.trim()) {
                    newErrors.name = "Name is required";
                } else if (formData.name.trim().length < 3) {
                    newErrors.name = "Name must be at least 3 characters";
                } else {
                    delete newErrors.name;
                }
                break;
            case "phone":
                if (formData.phone && formData.phone.trim().length < 10) {
                    newErrors.phone = "Phone must be at least 10 characters";
                } else {
                    delete newErrors.phone;
                }
                break;
            case "email":
                if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    newErrors.email = "Please enter a valid email address";
                } else {
                    delete newErrors.email;
                }
                break;
            case "address":
                if (formData.address && formData.address.trim().length < 5) {
                    newErrors.address = "Address must be at least 5 characters";
                } else {
                    delete newErrors.address;
                }
                break;
        }

        setErrors(newErrors);
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        }

        if (formData.phone && formData.phone.trim().length < 10) {
            newErrors.phone = "Phone must be at least 10 characters";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (formData.address && formData.address.trim().length < 5) {
            newErrors.address = "Address must be at least 5 characters";
        }

        setErrors(newErrors);
        setTouched({
            name: true,
            phone: true,
            address: true,
            email: true,
            logo: true,
        });

        return Object.keys(newErrors).length === 0;
    };

    // Handle logo selection
    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if it's an image
            if (!file.type.startsWith("image/")) {
                setErrors((prev) => ({
                    ...prev,
                    logo: "Please select an image file (PNG, JPG, GIF)",
                }));
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    logo: "Logo size must be less than 5MB",
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                logo: file,
            }));

            // Clear logo error
            setErrors((prev) => ({
                ...prev,
                logo: undefined,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove logo
    const handleRemoveLogo = () => {
        setFormData((prev) => ({
            ...prev,
            logo: null,
        }));
        setLogoPreview(settings?.logo?.urls?.original || null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (!validateForm()) {
            return;
        }

        setUploadProgress(0);

        try {
            const response = await saveSettings(
                formData.name,
                formData.phone,
                formData.address,
                formData.email,
                formData.logo,
                settings?.id
            );

            if (response?.success) {
                setSuccessMessage(response.message || "Settings saved successfully!");
                // Reset touched states
                setTouched({});
                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                // Reset logo in form data
                setFormData(prev => ({ ...prev, logo: null }));
                setTimeout(() => setSuccessMessage(null), 5000);
            }
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Main Settings Management
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {settings ? "Update" : "Create"} your website main settings
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {apiError && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-200">{apiError}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="p-6 space-y-6">
                    {/* Name Field */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Website Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("name")}
                            className={`w-full px-4 py-2 border rounded-lg
                                     bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all duration-200
                                     ${touched.name && errors.name
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-slate-300 dark:border-gray-600"
                                }`}
                            placeholder="Enter website name"
                            disabled={apiLoading}
                        />
                        {touched.name && errors.name && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label
                            htmlFor="phone"
                            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("phone")}
                            className={`w-full px-4 py-2 border rounded-lg
                                     bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all duration-200
                                     ${touched.phone && errors.phone
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-slate-300 dark:border-gray-600"
                                }`}
                            placeholder="Enter phone number"
                            disabled={apiLoading}
                        />
                        {touched.phone && errors.phone && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("email")}
                            className={`w-full px-4 py-2 border rounded-lg
                                     bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all duration-200
                                     ${touched.email && errors.email
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-slate-300 dark:border-gray-600"
                                }`}
                            placeholder="Enter email address"
                            disabled={apiLoading}
                        />
                        {touched.email && errors.email && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Address Field */}
                    <div>
                        <label
                            htmlFor="address"
                            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Address
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("address")}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg
                                     bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all duration-200 resize-none
                                     ${touched.address && errors.address
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-slate-300 dark:border-gray-600"
                                }`}
                            placeholder="Enter address"
                            disabled={apiLoading}
                        />
                        {touched.address && errors.address && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.address}</span>
                            </div>
                        )}
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            Logo
                        </label>

                        {/* Logo Preview or Upload Area */}
                        {logoPreview ? (
                            <div className="relative group">
                                <div className="flex items-center justify-center p-4 border-2 rounded-lg border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50">
                                    <img
                                        src={logoPreview}
                                        alt="Logo Preview"
                                        className="object-contain h-32"
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 text-white transition-colors bg-indigo-500 rounded-lg hover:bg-indigo-600"
                                        disabled={apiLoading}
                                    >
                                        Change Logo
                                    </button>
                                    {formData.logo && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="px-4 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                                            disabled={apiLoading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-8
                                         hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer
                                         bg-slate-50 dark:bg-gray-700/50
                                         ${touched.logo && errors.logo
                                        ? "border-red-500 dark:border-red-500"
                                        : "border-slate-300 dark:border-gray-600"
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center text-center">
                                    <CloudArrowUpIcon
                                        className={`w-12 h-12 mb-3 ${touched.logo && errors.logo
                                            ? "text-red-400"
                                            : "text-slate-400 dark:text-slate-500"
                                            }`}
                                    />
                                    <p
                                        className={`text-sm mb-1 ${touched.logo && errors.logo
                                            ? "text-red-500"
                                            : "text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        Click to upload logo or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                            disabled={apiLoading}
                        />

                        {touched.logo && errors.logo && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.logo}</span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {apiLoading && uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
                                <div
                                    className="h-2 transition-all duration-300 ease-out rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t rounded-b-lg bg-slate-50 dark:bg-gray-700/50 border-slate-200 dark:border-gray-600">
                    <button
                        type="button"
                        onClick={() => {
                            if (settings) {
                                // Reset to original settings data
                                setFormData({
                                    name: settings.name,
                                    phone: settings.phone || "",
                                    address: settings.address || "",
                                    email: settings.email || "",
                                    logo: null,
                                });
                                setLogoPreview(settings.logo?.urls?.original || null);
                            } else {
                                // Reset to empty
                                setFormData({ name: "", phone: "", address: "", email: "", logo: null });
                                setLogoPreview(null);
                            }
                            setUploadProgress(0);
                            setErrors({});
                            setTouched({});
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        className="px-4 py-2 transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700"
                        disabled={apiLoading}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={apiLoading}
                        className="flex items-center gap-2 px-6 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {apiLoading ? (
                            <>
                                <svg
                                    className="w-5 h-5 animate-spin"
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
                                Saving...
                            </>
                        ) : (
                            `${settings ? "Update" : "Save"} Settings`
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
