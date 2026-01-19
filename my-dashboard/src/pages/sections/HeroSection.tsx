import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { CloudArrowUpIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useHero } from "../../hooks/useHero";

interface HeroData {
    title: string;
    description: string;
    image: File | null;
}

interface FormErrors {
    title?: string;
    description?: string;
    image?: string;
}

export default function HeroSection() {
    const { hero, loading: apiLoading, error: apiError, fetchHero, saveHero } = useHero();

    const [formData, setFormData] = useState<HeroData>({
        title: "",
        description: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing hero data on mount
    useEffect(() => {
        fetchHero();
    }, []);

    // Populate form with existing data
    useEffect(() => {
        if (hero) {
            setFormData({
                title: hero.title,
                description: hero.description,
                image: null, // Don't set image, user will upload new one if needed
            });
            // Set image preview from existing data
            if (hero.media && hero.media.length > 0) {
                setImagePreview(hero.media[0].urls.original);
            }
        }
    }, [hero]);

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
            case "title":
                if (!formData.title.trim()) {
                    newErrors.title = "Title is required";
                } else if (formData.title.trim().length < 3) {
                    newErrors.title = "Title must be at least 3 characters";
                } else {
                    delete newErrors.title;
                }
                break;
            case "description":
                if (!formData.description.trim()) {
                    newErrors.description = "Description is required";
                } else if (formData.description.trim().length < 10) {
                    newErrors.description = "Description must be at least 10 characters";
                } else {
                    delete newErrors.description;
                }
                break;
            case "image":
                // Image is only required if we don't have an existing hero
                if (!hero && !formData.image) {
                    newErrors.image = "Image is required";
                } else {
                    delete newErrors.image;
                }
                break;
        }

        setErrors(newErrors);
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.trim().length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.trim().length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        }

        // Image is only required if we don't have an existing hero
        if (!hero && !formData.image) {
            newErrors.image = "Image is required";
        }

        setErrors(newErrors);
        setTouched({
            title: true,
            description: true,
            image: true,
        });

        return Object.keys(newErrors).length === 0;
    };

    // Handle image selection
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if it's an image
            if (!file.type.startsWith("image/")) {
                setErrors((prev) => ({
                    ...prev,
                    image: "Please select an image file (PNG, JPG, GIF)",
                }));
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    image: "Image size must be less than 5MB",
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                image: file,
            }));

            // Clear image error
            setErrors((prev) => ({
                ...prev,
                image: undefined,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
        }));
        setImagePreview(hero?.media?.[0]?.urls?.original || null);
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

        // If updating and no new image, we need to handle it
        if (hero && !formData.image) {
            setErrors((prev) => ({
                ...prev,
                image: "Please select a new image to update",
            }));
            return;
        }

        setUploadProgress(0);

        try {
            const response = await saveHero(
                formData.title,
                formData.description,
                formData.image!,
                "active"
            );

            if (response?.success) {
                setSuccessMessage(response.message || "Hero section saved successfully!");
                // Reset touched states
                setTouched({});
                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                // Keep the form data as is (it's now the saved data)
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
                    Hero Section Management
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {hero ? "Update" : "Create"} your hero section content
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
                    {/* Title Field */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("title")}
                            className={`w-full px-4 py-2 border rounded-lg
                                     bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all duration-200
                                     ${touched.title && errors.title
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-slate-300 dark:border-gray-600"
                                }`}
                            placeholder="Enter hero title"
                            disabled={apiLoading}
                        />
                        {touched.title && errors.title && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.title}</span>
                            </div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("description")}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg
                                     bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100
                                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all duration-200 resize-none
                                     ${touched.description && errors.description
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-slate-300 dark:border-gray-600"
                                }`}
                            placeholder="Enter hero description"
                            disabled={apiLoading}
                        />
                        {touched.description && errors.description && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.description}</span>
                            </div>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            Hero Image <span className="text-red-500">*</span>
                        </label>

                        {/* Image Preview or Upload Area */}
                        {imagePreview ? (
                            <div className="relative group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className={`w-full h-64 object-cover rounded-lg border-2 ${touched.image && errors.image
                                            ? "border-red-500"
                                            : "border-slate-300 dark:border-gray-600"
                                        }`}
                                />
                                <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 text-white transition-colors bg-indigo-500 rounded-lg hover:bg-indigo-600"
                                        disabled={apiLoading}
                                    >
                                        Change Image
                                    </button>
                                    {formData.image && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
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
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setTouched((prev) => ({ ...prev, image: true }));
                                }}
                                className={`border-2 border-dashed rounded-lg p-8
                                         hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer
                                         bg-slate-50 dark:bg-gray-700/50
                                         ${touched.image && errors.image
                                        ? "border-red-500 dark:border-red-500"
                                        : "border-slate-300 dark:border-gray-600"
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center text-center">
                                    <CloudArrowUpIcon
                                        className={`w-12 h-12 mb-3 ${touched.image && errors.image
                                                ? "text-red-400"
                                                : "text-slate-400 dark:text-slate-500"
                                            }`}
                                    />
                                    <p
                                        className={`text-sm mb-1 ${touched.image && errors.image
                                                ? "text-red-500"
                                                : "text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        Click to upload or drag and drop
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
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={apiLoading}
                        />

                        {touched.image && errors.image && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span>{errors.image}</span>
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
                            if (hero) {
                                // Reset to original hero data
                                setFormData({
                                    title: hero.title,
                                    description: hero.description,
                                    image: null,
                                });
                                setImagePreview(hero.media?.[0]?.urls?.original || null);
                            } else {
                                // Reset to empty
                                setFormData({ title: "", description: "", image: null });
                                setImagePreview(null);
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
                            `${hero ? "Update" : "Save"} Hero Section`
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
