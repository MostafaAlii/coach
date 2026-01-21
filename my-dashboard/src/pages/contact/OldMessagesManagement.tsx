import { useState, useEffect } from "react";
import { TrashIcon, CheckIcon, XMarkIcon, EnvelopeIcon, DocumentTextIcon, CheckCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import Table, { Column } from "../../components/ui/table/Table";
import { useContactMessages } from "../../hooks/useContactMessages";
import { ContactMessage } from "../../services/contactMessagesService";

// Delete Confirmation Modal Component
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}

function DeleteModal({ isOpen, onClose, onConfirm, title, message, isLoading }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md">
                <div className="overflow-hidden bg-white shadow-2xl rounded-xl dark:bg-gray-800">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 p-6 bg-slate-50/50 dark:bg-gray-900/30">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2.5 text-sm font-medium transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2.5 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Deleting...
                                </span>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Success Notification Component
interface SuccessNotificationProps {
    message: string;
    onClose: () => void;
}

function SuccessNotification({ message, onClose }: SuccessNotificationProps) {
    return (
        <div className="fixed z-50 w-full max-w-md top-4 right-4">
            <div className="overflow-hidden bg-green-500 rounded-lg shadow-lg">
                <div className="flex items-start p-4">
                    <div className="flex-shrink-0 mr-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                            <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-3 text-white/80 hover:text-white"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Message Preview Popup Component
interface MessagePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    message: {
        name: string;
        email: string;
        phone?: string;
        message: string;
        created_at: string;
    } | null;
}

function MessagePreview({ isOpen, onClose, message }: MessagePreviewProps) {
    if (!isOpen || !message) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const formattedDate = formatDate(message.created_at);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="overflow-y-auto bg-white rounded-xl shadow-2xl dark:bg-gray-800 max-h-[90vh]">
                    {/* Header */}
                    <div className="sticky top-0 z-10 p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-slate-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
                                    <span className="text-lg font-semibold">
                                        {message.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {message.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <a
                                            href={`mailto:${message.email}`}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            {message.email}
                                        </a>
                                        {message.phone && (
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                • {message.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 transition-colors rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Date and Time */}
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{formattedDate.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formattedDate.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="p-6">
                        <div className="mb-4">
                            <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                                Message
                            </h4>
                            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-gray-700/50 border-slate-200 dark:border-gray-600">
                                <p className="leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                    {message.message}
                                </p>
                            </div>
                        </div>

                        {/* Message Stats */}
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-gray-700/50">
                            <div className="text-center">
                                <div className="text-sm text-slate-600 dark:text-slate-400">Characters</div>
                                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {message.message.length}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-slate-600 dark:text-slate-400">Words</div>
                                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {message.message.split(/\s+/).filter(word => word.length > 0).length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sticky bottom-0 p-6 border-t bg-slate-50/80 dark:bg-gray-900/50 backdrop-blur-sm border-slate-100 dark:border-gray-700">
                        <div className="flex justify-end gap-3">
                            <a
                                href={`mailto:${message.email}?subject=Re: Your message&body=Dear ${message.name},%0D%0A%0D%0A`}
                                className="px-4 py-2.5 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                                Reply via Email
                            </a>
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-medium transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MessagesManagement() {
    const { messages, loading, error, fetchMessages, deleteMessage, bulkDeleteMessages } = useContactMessages();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'single' | 'bulk' | 'all';
        id?: number;
        count?: number;
    }>({
        isOpen: false,
        type: 'single',
    });

    // Message Preview State
    const [messagePreview, setMessagePreview] = useState<{
        isOpen: boolean;
        message: any | null;
    }>({
        isOpen: false,
        message: null,
    });

    // Load messages on mount and when page/pageSize changes
    useEffect(() => {
        fetchMessages(currentPage, pageSize);
    }, [currentPage, pageSize]);

    // Auto-close success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle select all checkbox
    const handleSelectAll = (checked: boolean) => {
        if (checked && messages?.data) {
            setSelectedIds(messages.data.map(msg => msg.id));
        } else {
            setSelectedIds([]);
        }
    };

    // Handle individual checkbox
    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    // Open delete modal
    const openDeleteModal = (type: 'single' | 'bulk' | 'all', id?: number) => {
        setDeleteModal({
            isOpen: true,
            type,
            id,
            count: type === 'bulk' ? selectedIds.length : undefined,
        });
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, type: 'single' });
    };

    // Open message preview
    const openMessagePreview = (message: any) => {
        setMessagePreview({
            isOpen: true,
            message,
        });
    };

    // Close message preview
    const closeMessagePreview = () => {
        setMessagePreview({
            isOpen: false,
            message: null,
        });
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        try {
            let response;

            if (deleteModal.type === 'single' && deleteModal.id) {
                response = await deleteMessage(deleteModal.id);
            } else if (deleteModal.type === 'bulk') {
                response = await bulkDeleteMessages(selectedIds);
                setSelectedIds([]);
            } else if (deleteModal.type === 'all') {
                response = await bulkDeleteMessages();
                setSelectedIds([]);
            }

            if (response?.success) {
                setSuccessMessage(response.message);
                // Force refresh
                await fetchMessages(currentPage, pageSize);
            }

            closeDeleteModal();
        } catch (err) {
            console.error('Error deleting:', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Get modal message
    const getModalMessage = () => {
        if (deleteModal.type === 'single') {
            return 'This message will be permanently deleted. This action cannot be undone.';
        } else if (deleteModal.type === 'bulk') {
            return `${deleteModal.count} message(s) will be permanently deleted. This action cannot be undone.`;
        } else {
            return 'ALL messages will be permanently deleted. This action cannot be undone.';
        }
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedIds([]);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
        setSelectedIds([]);
    };

    // Function to truncate message
    const truncateMessage = (message: string, maxLength: number = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    // Table columns configuration
    const columns: Column<ContactMessage>[] = [
        {
            key: 'select',
            title: '',
            render: (value, row) => (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => handleSelectOne(row.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    />
                </div>
            ),
            className: 'w-12',
        },
        {
            key: 'id',
            title: 'ID',
            render: (value) => (
                <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-semibold text-indigo-800 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300">
                    #{value}
                </span>
            ),
            className: 'w-20',
        },
        {
            key: 'name',
            title: 'Name',
            render: (value, row) => (
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
                        <span className="text-sm font-semibold">
                            {value.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
                        {row.phone && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {row.phone}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            title: 'Email',
            render: (value) => (
                <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2 text-slate-400" />
                    <a
                        href={`mailto:${value}`}
                        className="text-sm text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        {value}
                    </a>
                </div>
            ),
        },
        {
            key: 'message',
            title: 'Message',
            render: (value, row) => (
                <div
                    className="max-w-md cursor-pointer group"
                    onClick={() => openMessagePreview(row)}
                >
                    <div className="flex items-start">
                        <DocumentTextIcon className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-slate-400" />
                        <div className="flex-1">
                            <p className="text-sm transition-colors text-slate-600 dark:text-slate-400 line-clamp-2 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                                {truncateMessage(value, 50)}
                            </p>
                            <div className="flex items-center gap-2 mt-1 transition-opacity opacity-0 group-hover:opacity-100">
                                <EyeIcon className="w-3 h-3 text-indigo-500" />
                                <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                    Click to view full message
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'created_at',
            title: 'Date',
            render: (value) => (
                <div className="text-sm">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                        {new Date(value).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(value).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            ),
            className: 'w-32',
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (value, row) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => openMessagePreview(row)}
                        className="p-2 text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                        title="View message"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal('single', row.id);
                        }}
                        disabled={deleteLoading}
                        className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                        title="Delete message"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
            className: 'w-32 text-center',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                title={deleteModal.type === 'single' ? 'Delete Message' : 'Delete Messages'}
                message={getModalMessage()}
                isLoading={deleteLoading}
            />

            {/* Message Preview Popup */}
            <MessagePreview
                isOpen={messagePreview.isOpen}
                onClose={closeMessagePreview}
                message={messagePreview.message}
            />

            {/* Success Notification */}
            {successMessage && (
                <SuccessNotification
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Messages Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage contact messages from visitors
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Messages</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {messages?.total || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 transition-all duration-200 bg-white border shadow-sm rounded-xl dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Messages</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {messages?.total || 0}
                            </p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                            <EnvelopeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="p-6 transition-all duration-200 bg-white border shadow-sm rounded-xl dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Page</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {messages?.current_page || 0} / {messages?.last_page || 1}
                            </p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="p-6 transition-all duration-200 bg-white border shadow-sm rounded-xl dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Selected</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {selectedIds.length}
                            </p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="sticky top-0 z-10 p-4 mb-6 border border-indigo-100 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                                <input
                                    type="checkbox"
                                    checked={messages?.data && selectedIds.length === messages.data.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {messages?.data && selectedIds.length === messages.data.length
                                        ? `All ${selectedIds.length} messages selected`
                                        : `${selectedIds.length} message(s) selected`}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Click to select more or clear selection
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => openDeleteModal('bulk')}
                                disabled={deleteLoading}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete Selected
                            </button>
                            <button
                                onClick={() => openDeleteModal('all')}
                                disabled={deleteLoading}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-red-700 rounded-lg hover:bg-red-800 disabled:opacity-50"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 border-l-4 border-red-500 rounded-r-lg bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                <Table
                    columns={columns}
                    data={messages?.data || []}
                    loading={loading}
                    emptyMessage={
                        <div className="py-12 text-center">
                            <EnvelopeIcon className="w-12 h-12 mx-auto text-slate-400" />
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No messages found</p>
                        </div>
                    }
                />

                {/* Pagination */}
                {!loading && messages && messages.data && messages.data.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-gray-700 sm:flex-row">
                        {/* Page Size Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="px-3 py-1.5 text-sm bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-slate-600 dark:text-slate-400">per page</span>
                        </div>

                        {/* Pagination Info */}
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing <span className="font-medium text-slate-900 dark:text-slate-100">{messages.from}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{messages.to}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{messages.total}</span> results
                        </div>

                        {/* Page Navigation */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {messages.last_page && Array.from({ length: messages.last_page }, (_, i) => i + 1)
                                    .filter((page) => {
                                        if (messages.last_page <= 7) return true;
                                        return (
                                            page === 1 ||
                                            page === messages.last_page ||
                                            Math.abs(page - currentPage) <= 1
                                        );
                                    })
                                    .map((page, index, array) => {
                                        const prevPage = array[index - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <div key={page} className="flex items-center">
                                                {showEllipsis && (
                                                    <span className="px-2 text-sm text-slate-500 dark:text-slate-400">...</span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === messages.last_page}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
