import { useState, useRef, useEffect } from "react";
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    ArrowLeftIcon,
    PhotoIcon,
    RectangleStackIcon,
    CheckCircleIcon,
    XCircleIcon,
    MinusIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Switch from "../../components/ui/Switch";
import Button from "../../components/ui/Button";
import { createSections, SectionResponse, getSections } from "../../services/galleryService";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api/axios";

interface Section {
    id: number;
    name: string;
    itemsCount: number;
    is_active: boolean;
}

interface SectionFormData {
    title: string;
    is_active: boolean;
}

export default function GalleryManagement() {
    const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "item"; id: number } | null>(null);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [loadingSections, setLoadingSections] = useState(false);

    const [sectionsForm, setSectionsForm] = useState<SectionFormData[]>([{ title: "", is_active: true }]);
    const [sections, setSections] = useState<Section[]>([]);
    const stats = [
        {
            label: "Total Sections",
            value: sections.length,
            icon: RectangleStackIcon,
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
            textColor: "text-indigo-600 dark:text-indigo-400",
        },
        {
            label: "Total Items",
            value: sections.reduce((acc, s) => acc + s.itemsCount, 0),
            icon: PhotoIcon,
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            textColor: "text-purple-600 dark:text-purple-400",
        },
        {
            label: "Active Sections",
            value: sections.filter((s) => s.is_active).length,
            icon: CheckCircleIcon,
            bgColor: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-600 dark:text-green-400",
        },
        {
            label: "Inactive Sections",
            value: sections.filter((s) => !s.is_active).length,
            icon: XCircleIcon,
            bgColor: "bg-red-50 dark:bg-red-900/20",
            textColor: "text-red-600 dark:text-red-400",
        },
    ];
    const activeSection = sections.find((s) => s.id === activeSectionId);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [activeSectionItems, setActiveSectionItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
    const [itemForm, setItemForm] = useState({
        title: "",
        image: null as File | null,
        is_active: true,
    });
    const handleViewItems = async (sectionId: number) => {
        setActiveSectionId(sectionId);
        try {
            const res = await api.get(`/gallery-sections/${sectionId}/items`);
            const items = (res.data.data || []).map((item: any) => ({
                ...item,
                media: item.media || [],
            }));
            setActiveSectionItems(items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load items.");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setItemForm({ ...itemForm, image: file });
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };
    const closeItemModal = () => {
        setIsItemModalOpen(false);
        setEditingItem(null);
        setItemForm({
            title: "",
            image: null,
            is_active: true,
        });
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = () => {
        setItemForm({ ...itemForm, image: null });
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    /* ================= Fetch Sections on Load ================= */
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await getSections();
                const sectionsData = res.data || [];
                setSections(
                    sectionsData.map((s) => ({
                        id: s.id,
                        name: s.name,
                        itemsCount: s.items?.length ?? 0,
                        is_active: s.is_active,
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch sections:", err);
                toast.error("Failed to load sections.");
            }
        };
        fetchSections();
    }, []);

    /* ================= Section Handlers ================= */
    const openNewSectionModal = () => {
        setEditingSection(null);
        setSectionsForm([{ title: "", is_active: true }]);
        setIsSectionModalOpen(true);
    };

    const openEditSectionModal = (section: Section) => {
        setEditingSection(section);
        setSectionsForm([{ title: section.name, is_active: section.is_active }]);
        setIsSectionModalOpen(true);
    };

    const closeSectionModal = () => {
        setIsSectionModalOpen(false);
        setEditingSection(null);
        setSectionsForm([{ title: "", is_active: true }]);
    };

    const addSectionField = () => {
        setSectionsForm([...sectionsForm, { title: "", is_active: true }]);
    };

    const removeSectionField = (index: number) => {
        if (sectionsForm.length === 1) return;
        setSectionsForm(sectionsForm.filter((_, i) => i !== index));
    };

    const handleSectionFieldChange = (index: number, field: keyof SectionFormData, value: any) => {
        const newSections = [...sectionsForm];
        newSections[index] = { ...newSections[index], [field]: value };
        setSectionsForm(newSections);
    };

    const handleSectionSubmit = async () => {
        try {
            if (editingSection) {
                const payload = {
                    name: sectionsForm[0].title,
                    is_active: sectionsForm[0].is_active,
                };

                const res = await api.put(`/gallery-sections/${editingSection.id}`, payload);

                const updatedSection = res.data.data;

                setSections((prev) =>
                    prev.map((s) =>
                        s.id === updatedSection.id
                            ? {
                                ...s,
                                name: updatedSection.name,
                                is_active: updatedSection.is_active,
                            }
                            : s
                    )
                );
                toast.success("Section updated successfully!");
                closeSectionModal();
            } else {
                setLoadingSections(true);
                const payload = sectionsForm.map((s) => ({ name: s.title, is_active: s.is_active }));
                const response: SectionResponse[] = (await createSections(payload)) || [];

                if (response.length === 0) {
                    toast.error("No sections were created.");
                    setLoadingSections(false);
                    return;
                }

                setSections((prev) => [
                    ...prev,
                    ...response.map((s) => ({
                        id: s.id,
                        name: s.name,
                        itemsCount: s.items_count ?? 0,
                        is_active: s.is_active,
                    })),
                ]);

                setLoadingSections(false);
                closeSectionModal();

                toast.success(`${response.length} section(s) created successfully!`);
            }
        } catch (error: any) {
            setLoadingSections(false);
            if (error.response?.status === 422) {
                toast.error("Please check the section titles. Each section must have a name.");
            } else {
                toast.error("Something went wrong.");
            }
            console.error(error);
        }
    };

    const handleItemSubmit = async () => {
        if (!itemForm.title) {
            toast.error("Title is required");
            return;
        }
        if (!activeSectionId) {
            toast.error("No active section selected");
            return;
        }

        const formData = new FormData();
        formData.append("title", itemForm.title);
        formData.append("is_active", itemForm.is_active ? "1" : "0");
        formData.append("sections[]", activeSectionId.toString()); // 🔵 sectionId هنا
        if (itemForm.image) {
            formData.append("image", itemForm.image);
        }

        try {
            if (editingItem) {
                const res = await api.post(
                    `/gallery-items/${editingItem.id}?_method=PUT`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                const itemsRes = await api.get(
                    `/gallery-sections/${activeSectionId}/items`
                );
                setActiveSectionItems(itemsRes.data.data || []);
                toast.success("Item updated successfully!");

            } else {
                const res = await api.post(`/gallery-items`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                const itemsRes = await api.get(`/gallery-sections/${activeSectionId}/items`);
                toast.success("Item created successfully!");
                setSections((prev) =>
                    prev.map((s) =>
                        s.id === activeSectionId
                            ? {
                                ...s,
                                itemsCount: (s.itemsCount ?? 0) + 1,
                            }
                            : s
                    )
                );
                setActiveSectionItems(itemsRes.data.data || []);
            }

            closeItemModal();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to create item.");
        }
    };


    /* ================= Delete Handlers ================= */
    const handleDelete = async () => {
        if (deleteTarget?.type === "section") {
            try {
                await api.delete(`/gallery-sections/${deleteTarget.id}`);
                setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
                toast.success("Section deleted successfully!");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete section.");
            }
        }
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
    };

    /* ================= Render ================= */
    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Gallery Management</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Organize gallery sections and media items
                    </p>
                </div>
                <button
                    onClick={openNewSectionModal}
                    className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Section
                </button>
            </div>

            {/* ================= Enhanced Stats ================= */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="relative p-5 overflow-hidden transition-shadow duration-200 bg-white border rounded-lg shadow-sm dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-md"
                    >
                        <div className="absolute top-0 right-0 opacity-10">
                            <stat.icon className="w-24 h-24 -mt-6 -mr-6" />
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {stat.label}
                                    </p>
                                    <p className={`mt-1 text-2xl font-bold ${stat.textColor}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sections Grid */}
            {!activeSectionId && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                        <div key={section.id} className="p-6 transition-shadow duration-200 bg-white border rounded-lg shadow-md dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.name}</h3>
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${section.is_active
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                        }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${section.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                    {section.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{section.itemsCount} Items</p>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleViewItems(section.id)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 transition-colors border border-indigo-600 rounded-lg dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                >
                                    View Items
                                </button>
                                <button
                                    onClick={() => openEditSectionModal(section)}
                                    className="p-2 text-sm font-medium transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                                    title="Edit Section"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setDeleteTarget({ type: "section", id: section.id }); setIsDeleteModalOpen(true); }}
                                    className="p-2 text-sm font-medium text-red-700 transition-colors border border-red-300 rounded-lg dark:border-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Delete Section"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Section Items View */}
            {activeSectionId && activeSection && (
                <div className="flex items-center justify-between p-4 bg-white border rounded-lg dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <button
                            onClick={() => setActiveSectionId(null)}
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Sections
                        </button>

                        <span>/</span>

                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {activeSection.name}
                        </span>
                    </div>

                    {/* Actions */}
                    <Button
                        variant="primary"
                        onClick={() => {
                            // هنفتح مودال Add Item هنا
                            setIsItemModalOpen(true);
                        }}
                    >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Item
                    </Button>
                </div>
            )}

            {/* Selection Toolbar */ }
            {activeSectionId && selectedItems.length > 0 && (
                <div className="sticky top-0 z-10 mb-4 duration-300 animate-in slide-in-from-top">
                    <div className="flex items-center justify-between p-4 rounded-lg shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                        {/* Left Side - Selection Info */}
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
                                <CheckCircleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                                </p>
                                <p className="text-xs text-white/80">
                                    {selectedItems.length === activeSectionItems.length ? 'All items selected' : 'Click to select more'}
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Actions */}
                        <div className="flex items-center gap-3">
                            {/* Select All Button */}
                            {selectedItems.length < activeSectionItems.length && (
                                <button
                                    onClick={() => setSelectedItems(activeSectionItems.map((item) => item.id))}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Select All
                                </button>
                            )}

                            {/* Deselect All Button */}
                            <button
                                onClick={() => setSelectedItems([])}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                Clear
                            </button>

                            {/* Delete Selected Button */}
                            <button
                                onClick={() => setIsMultiDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-red-600 rounded-lg shadow-lg hover:bg-red-700"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete ({selectedItems.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Items List */}
            {activeSectionId && (
                <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeSectionItems.length === 0 ? (
                        <div className="p-6 text-center bg-white border rounded-lg dark:bg-gray-800 border-slate-200 dark:border-gray-700 col-span-full">
                            <PhotoIcon className="w-12 h-12 mx-auto text-slate-400" />
                            <p className="mt-2 text-sm text-slate-500">No items yet in this section</p>
                        </div>
                    ) : (
                        activeSectionItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative p-4 transition-shadow duration-200 bg-white border rounded-lg shadow-md dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-lg"
                            >
                                {/* Header with Checkbox on Right */}
                                <div className="flex items-center justify-between mb-2">
                                    <input
                                        type="checkbox"
                                        className="flex-shrink-0 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems([...selectedItems, item.id]);
                                            } else {
                                                setSelectedItems(selectedItems.filter((id) => id !== item.id));
                                            }
                                        }}
                                    />
                                    <h4 className="flex-1 text-sm font-semibold text-center text-slate-900 dark:text-slate-100">
                                        {item.title}
                                    </h4>
                                </div>

                                {/* Image with overlay buttons */}
                                <div className="relative mb-3 group">
                                    {item.media.length > 0 ? (
                                        <>
                                            <img
                                                src={item.media[0].original}
                                                alt={item.title}
                                                className="object-cover w-full h-40 rounded-lg"
                                            />
                                            {/* Overlay buttons (appear on hover) */}
                                            <div className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-200 bg-black bg-opacity-0 rounded-lg opacity-0 group-hover:bg-opacity-40 group-hover:opacity-100">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setItemForm({
                                                            title: item.title,
                                                            image: null,
                                                            is_active: item.is_active,
                                                        });
                                                        setImagePreview(item.media?.[0]?.original || null);
                                                        setIsItemModalOpen(true);
                                                    }}
                                                    className="p-2 text-white transition-colors bg-indigo-600 rounded-full hover:bg-indigo-700"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setDeleteTarget({ type: "item", id: item.id });
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 text-white transition-colors bg-red-600 rounded-full hover:bg-red-700"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-40 rounded-lg bg-slate-100 dark:bg-gray-700">
                                            <PhotoIcon className="w-12 h-12 text-slate-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-center">
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${item.is_active
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${item.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                        {item.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Section Modal */}
            {isSectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl p-6 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {editingSection ? "Edit Section" : "Create New Sections"}
                            </h3>
                            <button onClick={closeSectionModal} className="p-1 transition-colors rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {!editingSection && (
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Sections</h4>
                                    <button type="button" onClick={addSectionField} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                        <PlusIcon className="w-4 h-4" />
                                        Add Section
                                    </button>
                                </div>
                            )}

                            {sectionsForm.map((section, index) => (
                                <div key={index} className="p-4 space-y-4 border rounded-lg border-slate-200 dark:border-gray-700">
                                    <div className="flex items-start justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Section {index + 1}</span>
                                        {!editingSection && sectionsForm.length > 1 && (
                                            <button type="button" onClick={() => removeSectionField(index)} className="p-1 text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove section">
                                                <MinusIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => handleSectionFieldChange(index, "title", e.target.value)}
                                            className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Enter section title"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Status</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{section.is_active ? "This section is active" : "This section is inactive"}</p>
                                        </div>
                                        <Switch
                                            checked={section.is_active}
                                            onChange={(checked) => handleSectionFieldChange(index, "is_active", checked)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <Button variant="outline" onClick={closeSectionModal}>Cancel</Button>
                            <Button variant="primary" onClick={handleSectionSubmit} disabled={loadingSections}>
                                {loadingSections ? "Creating..." : editingSection ? "Update Section" : "Create Sections"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 space-y-6 duration-200 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full dark:bg-red-900/20">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Delete {deleteTarget.type === "section" ? "Section" : "Item"}
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    Are you sure you want to delete this {deleteTarget.type}? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete {deleteTarget.type === "section" ? "Section" : "Item"}</Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Item Modal */}
            {isItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {editingItem ? "Edit Item" : `Add Item to "${activeSection?.name}"`}
                            </h3>
                            <button
                                onClick={closeItemModal}
                                className="p-1 transition-colors rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4">
                            {/* Title Input */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={itemForm.title}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter item title"
                                />
                            </div>

                            {/* Image Input with Preview */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Image <span className="text-red-500">*</span>
                                </label>

                                {/* Image Preview - Only shows if there's an image */}
                                {imagePreview && (
                                    <div className="relative mb-3 group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="object-cover w-full border-2 rounded-lg h-52 border-slate-300 dark:border-gray-600"
                                        />
                                        {/* Hover overlay with Remove button */}
                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="px-4 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* File Input */}
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/20 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/30 file:cursor-pointer file:transition-colors"
                                    />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            </div>

                            {/* Status Switch */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        Status
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {itemForm.is_active
                                            ? "This item is active"
                                            : "This item is inactive"}
                                    </p>
                                </div>
                                <Switch
                                    checked={itemForm.is_active}
                                    onChange={(checked) =>
                                        setItemForm({ ...itemForm, is_active: checked })
                                    }
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <Button variant="outline" onClick={closeItemModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleItemSubmit}>
                                {editingItem ? "Update Item" : "Create Item"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isMultiDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 space-y-6 duration-200 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full dark:bg-red-900/20">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Delete Selected Items
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    Are you sure you want to delete these {selectedItems.length} items? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsMultiDeleteModalOpen(false)}>Cancel</Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    try {
                                        if (selectedItems.length === 0) {
                                            toast.error('No items selected');
                                            return;
                                        }
                                        const response = await api.post('/gallery-items/batch-delete', {
                                            ids: selectedItems
                                        });

                                        console.log('Response:', response.data);

                                        if (response.data.success) {
                                            toast.success(response.data.message);
                                            setActiveSectionItems(prev =>
                                                prev.filter(item => !selectedItems.includes(item.id))
                                            );
                                            setSections(prev => prev.map(s =>
                                                s.id === activeSectionId
                                                    ? { ...s, itemsCount: Math.max(0, s.itemsCount - selectedItems.length) }
                                                    : s
                                            ));

                                            setSelectedItems([]);
                                            setIsMultiDeleteModalOpen(false);
                                        } else {
                                            toast.error(response.data.message);
                                        }
                                    } catch (error: any) {
                                        console.error('Full error:', error);
                                        console.error('Error response:', error.response?.data);
                                        toast.error(error.response?.data?.message || "Failed to delete selected items.");
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
