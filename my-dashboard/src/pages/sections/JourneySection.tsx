import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TableWithFilters, { FilterConfig } from "../../components/ui/table/TableWithFilters";
import { Column } from "../../components/ui/table/Table";
import { AddButton } from "../../components/ui/Button";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Switch from "../../components/ui/Switch";
import { PencilIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, MinusIcon, ChartBarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useJourney, JourneyItem } from "../../hooks/useJourney";

interface JourneyFormData {
    mainTitle: string;
    type: "certificate" | "service" | "";
    status: boolean;
    points: string[];
}

interface EditModalData {
    isOpen: boolean;
    journey: JourneyItem | null;
    isParent: boolean;
}

interface DeleteModalData {
    isOpen: boolean;
    journey: JourneyItem | null;
    isParent: boolean;
}

interface AddPointModalData {
    isOpen: boolean;
    journey: JourneyItem | null;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    title: string;
}

export default function JourneySection() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState<EditModalData>({
        isOpen: false,
        journey: null,
        isParent: false,
    });
    const [deleteModal, setDeleteModal] = useState<DeleteModalData>({
        isOpen: false,
        journey: null,
        isParent: false,
    });
    const [addPointModal, setAddPointModal] = useState<AddPointModalData>({
        isOpen: false,
        journey: null,
    });
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newPoints, setNewPoints] = useState<string[]>([""]);

    // Form state
    const [formData, setFormData] = useState<JourneyFormData>({
        mainTitle: "",
        type: "",
        status: true,
        points: [""],
    });

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        title: "",
        type: "" as "certificate" | "service" | "",
        status: true,
    });

    // Use the journey hook
    const { flattenedJourneys, loading, error, fetchJourneys, saveJourney, updateJourney, deleteJourney, addPointsToJourney } = useJourney();

    // Calculate statistics
    const calculateStats = () => {
        const parents = flattenedJourneys.filter(item => !item.isChild);
        const serviceParents = parents.filter(item => item.type === "service");
        const certificateParents = parents.filter(item => item.type === "certificate");
        const servicePoints = serviceParents.reduce((acc, parent) =>
            acc + (parent.points?.length || 0), 0
        );

        const certificatePoints = certificateParents.reduce((acc, parent) =>
            acc + (parent.points?.length || 0), 0
        );

        const serviceActive = serviceParents.filter(item => item.status === "active").length;
        const serviceInactive = serviceParents.filter(item => item.status === "inactive").length;

        const certificateActive = certificateParents.filter(item => item.status === "active").length;
        const certificateInactive = certificateParents.filter(item => item.status === "inactive").length;

        return {
            services: {
                total: serviceParents.length,
                points: servicePoints,
                active: serviceActive,
                inactive: serviceInactive
            },
            certificates: {
                total: certificateParents.length,
                points: certificatePoints,
                active: certificateActive,
                inactive: certificateInactive
            }
        };
    };

    const stats = calculateStats();

    // Add notification
    const addNotification = (type: Notification['type'], title: string, message: string) => {
        const id = Date.now().toString();
        const newNotification: Notification = { id, type, title, message };
        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    // Remove notification
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // Fetch journeys on mount
    useEffect(() => {
        fetchJourneys();
    }, []);

    // Auto expand all parents on first load
    useEffect(() => {
        if (flattenedJourneys.length > 0) {
            const parentIds = flattenedJourneys
                .filter(item => !item.isChild && item.points && item.points.length > 0)
                .map(item => item.id);
            setExpandedRows(parentIds);
        }
    }, [flattenedJourneys]);

    // Toggle row expansion
    const toggleRow = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    // Open edit modal
    const openEditModal = (journey: JourneyItem, isParent: boolean) => {
        setEditModal({
            isOpen: true,
            journey,
            isParent,
        });
        setEditFormData({
            title: journey.title,
            type: journey.type as "certificate" | "service" | "",
            status: journey.status === "active",
        });
    };

    // Open add point modal
    const openAddPointModal = (journey: JourneyItem) => {
        setAddPointModal({
            isOpen: true,
            journey,
        });
        setNewPoints([""]);
    };

    // Open delete modal
    const openDeleteModal = (journey: JourneyItem, isParent: boolean) => {
        setDeleteModal({
            isOpen: true,
            journey,
            isParent,
        });
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditModal({
            isOpen: false,
            journey: null,
            isParent: false,
        });
        setEditFormData({
            title: "",
            type: "",
            status: true,
        });
    };

    // Close add point modal
    const closeAddPointModal = () => {
        setAddPointModal({
            isOpen: false,
            journey: null,
        });
        setNewPoints([""]);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            journey: null,
            isParent: false,
        });
    };

    // Handle edit form submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.journey) return;

        try {
            await updateJourney(editModal.journey.id, {
                title: editFormData.title,
                type: editFormData.type,
                status: editFormData.status ? "active" : "inactive",
            });
            closeEditModal();
            addNotification('success', 'Success', 'Journey updated successfully!');
        } catch (err) {
            console.error("Failed to update journey:", err);
            addNotification('error', 'Error', 'Failed to update journey');
        }
    };

    // Handle add point form submit
    const handleAddPointSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addPointModal.journey || newPoints.some(point => !point.trim())) {
            addNotification('error', 'Error', 'Please fill all point fields');
            return;
        }

        try {
            await addPointsToJourney(addPointModal.journey.id, newPoints);

            closeAddPointModal();
            addNotification('success', 'Success', 'Points added successfully!');
        } catch (err) {
            console.error("Failed to add points:", err);
            addNotification('error', 'Error', 'Failed to add points');
        }
    };

    // Handle new point change
    const handleNewPointChange = (index: number, value: string) => {
        const updatedPoints = [...newPoints];
        updatedPoints[index] = value;
        setNewPoints(updatedPoints);
    };

    // Add new point field
    const addNewPointField = () => {
        setNewPoints([...newPoints, ""]);
    };

    // Remove new point field
    const removeNewPointField = (index: number) => {
        if (newPoints.length === 1) return;
        setNewPoints(newPoints.filter((_, i) => i !== index));
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!deleteModal.journey) return;

        try {
            await deleteJourney(deleteModal.journey.id);
            closeDeleteModal();
            addNotification('success', 'Success', deleteModal.isParent
                ? 'Journey deleted successfully!'
                : 'Point deleted successfully!'
            );
        } catch (err) {
            console.error("Failed to delete:", err);
            addNotification('error', 'Error', 'Failed to delete');
        }
    };

    // Table columns with add point button
    const columns: Column<JourneyItem>[] = [
        {
            key: "title",
            title: "Title",
            className: "w-1/3",
            render: (value, row) => (
                <div className="flex items-center">
                    <div
                        className={`flex items-center ${row.isChild ? "pl-6" : ""}`}
                        style={{ paddingLeft: row.level ? `${row.level * 24}px` : "0px" }}
                    >
                        {/* Show expand/collapse icon for parents */}
                        {!row.isChild && row.points && row.points.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRow(row.id);
                                }}
                                className="p-1 mr-2 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                {expandedRows.includes(row.id) ? (
                                    <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                                ) : (
                                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                                )}
                            </button>
                        )}

                        {/* Placeholder for parents without children */}
                        {!row.isChild && (!row.points || row.points.length === 0) && (
                            <div className="w-6 mr-2"></div>
                        )}

                        {/* Indentation for children */}
                        {row.isChild && (
                            <div className="ml-2 mr-3">
                                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                            </div>
                        )}

                        {/* Title */}
                        <span className={`block font-medium ${row.isChild ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"}`}>
                            {value}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            title: "Type",
            render: (value, row) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${row.isChild
                    ? "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"
                    : "text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300"
                    }`}>
                    {value}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (value, row) => {
                const isActive = value === "active";
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${isActive
                            ? row.isChild
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : row.isChild
                                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                            }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? "bg-green-500" : "bg-red-500"
                                }`}
                        />
                        {value}
                    </span>
                );
            },
        },
        {
            key: "actions",
            title: "Actions",
            className: "w-48",
            render: (_, row) => (
                <div className="flex gap-2">
                    {/* Add Point button for parents only */}
                    {!row.isChild && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openAddPointModal(row);
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Add Point"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    )}

                    {/* Edit button for all */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(row, !row.isChild);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                        title="Edit"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(row, !row.isChild);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filters: FilterConfig[] = [
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
            ],
        },
        {
            key: "type",
            label: "Type",
            type: "select",
            options: [
                { value: "service", label: "Service" },
                { value: "certificate", label: "Certificate" },
            ],
        },
    ];

    // Filter data based on expanded rows
    const filteredData = flattenedJourneys.filter(row => {
        if (!row.isChild) return true; // Always show parents

        // For children, check if parent is expanded
        if (row.parent_id && !expandedRows.includes(row.parent_id)) {
            return false;
        }

        return true;
    });

    // Form handlers for new journey
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ mainTitle: "", type: "", status: true, points: [""] });
    };

    const handlePointChange = (index: number, value: string) => {
        const newPoints = [...formData.points];
        newPoints[index] = value;
        setFormData({ ...formData, points: newPoints });
    };

    const addPoint = () => setFormData({ ...formData, points: [...formData.points, ""] });
    const removePoint = (index: number) => {
        if (formData.points.length === 1) return;
        setFormData({ ...formData, points: formData.points.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveJourney(formData);
            handleCloseModal();
            addNotification('success', 'Success', 'Journey created successfully!');
        } catch (err) {
            console.error("Failed to save journey:", err);
            addNotification('error', 'Error', 'Failed to create journey');
        }
    };

    // Row click handler
    const handleRowClick = (row: JourneyItem, index: number) => {
        if (!row.isChild && row.points && row.points.length > 0) {
            toggleRow(row.id);
        }
    };

    // Custom row class name
    const getRowClassName = (row: JourneyItem) => {
        let className = "transition-colors duration-150 ";

        if (!row.isChild) {
            className += "font-semibold bg-slate-50/50 dark:bg-slate-800/50 ";
        } else {
            className += "text-sm ";
        }

        if (row.isChild) {
            className += "hover:bg-slate-50 dark:hover:bg-slate-800 ";
        } else {
            className += "hover:bg-slate-100 dark:hover:bg-slate-800 ";
        }

        // Add border for visual separation
        if (row.isChild && row.level && row.level > 1) {
            className += "border-l-2 border-slate-200 dark:border-slate-700 ";
        }

        return className;
    };

    return (
        <div className="space-y-6">
            {/* Notifications */}
            <div className="fixed z-50 space-y-2 top-4 right-4 w-80">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${notification.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                                : notification.type === 'error'
                                    ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                                    : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start">
                                {notification.type === 'success' && (
                                    <svg className="w-5 h-5 mt-0.5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {notification.type === 'error' && (
                                    <svg className="w-5 h-5 mt-0.5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <div>
                                    <h3 className="font-medium">{notification.title}</h3>
                                    <p className="mt-1 text-sm">{notification.message}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        Journey Section Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage your journey section with hierarchical view
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setExpandedRows(flattenedJourneys.filter(item => !item.isChild).map(item => item.id))}
                        className="px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={() => setExpandedRows([])}
                        className="px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Collapse All
                    </button>
                    <AddButton onClick={handleOpenModal}>Add New Journey</AddButton>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Services Card */}
                <div className="overflow-hidden bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/30">
                                        <DocumentTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                        Services
                                    </h3>
                                </div>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Manage service journeys
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.services.total}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Journeys</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.services.points}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Points</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.services.active}</div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Active</div>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-full dark:bg-green-900/30">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.services.inactive}</div>
                                        <div className="text-sm text-red-600 dark:text-red-400">Inactive</div>
                                    </div>
                                    <div className="p-2 bg-red-100 rounded-full dark:bg-red-900/30">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificates Card */}
                <div className="overflow-hidden bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                                        <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                        Certificates
                                    </h3>
                                </div>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Manage certificate journeys
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.certificates.total}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Journeys</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.certificates.points}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Points</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.certificates.active}</div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Active</div>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-full dark:bg-green-900/30">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.certificates.inactive}</div>
                                        <div className="text-sm text-red-600 dark:text-red-400">Inactive</div>
                                    </div>
                                    <div className="p-2 bg-red-100 rounded-full dark:bg-red-900/30">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <TableWithFilters
                columns={columns}
                data={filteredData}
                filters={filters}
                pageSize={10}
                pageSizeOptions={[5, 10, 20, 50]}
                searchPlaceholder="Search journeys..."
                loading={loading}
                emptyMessage="No journeys available"
                onRowClick={handleRowClick}
                rowClassName={getRowClassName}
            />

            {/* Add Journey Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Journey" size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Title & Type */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Main Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.mainTitle}
                                onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
                                className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter main title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type: e.target.value as "certificate" | "service" | "",
                                    })
                                }
                                className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select type</option>
                                <option value="certificate">Certificate</option>
                                <option value="service">Service</option>
                            </select>
                        </div>
                    </div>

                    {/* Status Switch */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50">
                        <div>
                            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                Status
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {formData.status ? "This journey is active" : "This journey is inactive"}
                            </p>
                        </div>
                        <Switch
                            checked={formData.status}
                            onChange={(checked) => setFormData({ ...formData, status: checked })}
                        />
                    </div>

                    {/* Points */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Points
                            </h3>
                            <button
                                type="button"
                                onClick={addPoint}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add Point
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.points.map((point, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={point}
                                            onChange={(e) => handlePointChange(index, e.target.value)}
                                            className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder={`Point ${index + 1}`}
                                            required
                                        />
                                    </div>
                                    {formData.points.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePoint(index)}
                                            className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Remove point"
                                        >
                                            <MinusIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                        <Button variant="outline" type="button" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Journey
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Point Modal */}
            <Modal
                isOpen={addPointModal.isOpen}
                onClose={closeAddPointModal}
                title={`Add Points to "${addPointModal.journey?.title}"`}
                size="lg"
            >
                {addPointModal.journey && (
                    <form onSubmit={handleAddPointSubmit} className="space-y-6">
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`p-2 rounded-full ${addPointModal.journey.type === 'service'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                                        : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                                        {addPointModal.journey.type === 'service' ? (
                                            <DocumentTextIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        ) : (
                                            <ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {addPointModal.journey.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Type: {addPointModal.journey.type} • Status: {addPointModal.journey.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* New Points */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    New Points
                                </h3>
                                <button
                                    type="button"
                                    onClick={addNewPointField}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Add Another Point
                                </button>
                            </div>

                            <div className="space-y-3">
                                {newPoints.map((point, index) => (
                                    <div key={index} className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={point}
                                                onChange={(e) => handleNewPointChange(index, e.target.value)}
                                                className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder={`New point ${index + 1}`}
                                                required
                                            />
                                        </div>
                                        {newPoints.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeNewPointField(index)}
                                                className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Remove point"
                                            >
                                                <MinusIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={closeAddPointModal}>
                                Cancel
                            </Button>
                            <Button variant="success" type="submit">
                                Add Points
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={closeEditModal}
                title={`Edit ${editModal.isParent ? "Journey" : "Point"}`}
                size="md"
            >
                {editModal.journey && (
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {editModal.isParent && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editFormData.type}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            type: e.target.value as "certificate" | "service" | "",
                                        })
                                    }
                                    className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="certificate">Certificate</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        )}

                        {/* Status Switch */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50">
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Status
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {editFormData.status ? "This item is active" : "This item is inactive"}
                                </p>
                            </div>
                            <Switch
                                checked={editFormData.status}
                                onChange={(checked) => setEditFormData({ ...editFormData, status: checked })}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={closeEditModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Update
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                title="Confirm Delete"
                size="sm"
            >
                {deleteModal.journey && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                Delete {deleteModal.isParent ? "Journey" : "Point"}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        "{deleteModal.journey.title}"
                                    </span>
                                    ?
                                </p>
                                {deleteModal.isParent && deleteModal.journey.points && deleteModal.journey.points.length > 0 && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        This will also delete {deleteModal.journey.points.length} associated points.
                                    </p>
                                )}
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={closeDeleteModal}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                type="button"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
