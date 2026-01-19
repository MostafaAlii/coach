import { useState, useEffect } from "react";
import Table, { Column } from "./Table";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface TableWithPaginationProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T, index: number) => void;
    rowClassName?: (row: T, index: number) => string;
    pageSize?: number;
    pageSizeOptions?: number[];
}

export default function TableWithPagination<T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    emptyMessage = "No data available",
    onRowClick,
    rowClassName,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
}: TableWithPaginationProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = data.slice(startIndex, endIndex);

    // Reset to page 1 when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-4">
            {/* Table */}
            <Table
                columns={columns}
                data={currentData}
                loading={loading}
                emptyMessage={emptyMessage}
                onRowClick={onRowClick}
                rowClassName={rowClassName}
            />

            {/* Pagination Controls */}
            {!loading && data.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-2 py-1 text-sm bg-white border rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-slate-600 dark:text-slate-400">entries</span>
                    </div>

                    {/* Pagination Info */}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    return (
                                        page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - currentPage) <= 1
                                    );
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there's a gap
                                    const prevPage = array[index - 1];
                                    const showEllipsis = prevPage && page - prevPage > 1;

                                    return (
                                        <div key={page} className="flex items-center gap-1">
                                            {showEllipsis && (
                                                <span className="px-2 text-slate-500 dark:text-slate-400">...</span>
                                            )}
                                            <button
                                                onClick={() => goToPage(page)}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors
                                                    ${currentPage === page
                                                        ? "bg-indigo-600 text-white"
                                                        : "border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 transition-colors border rounded-lg border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
