import { useState, useMemo, useEffect } from "react";
import Table, { Column } from "./Table";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export interface FilterConfig {
    key: string;
    label: string;
    type: "select" | "date" | "text";
    options?: { value: string; label: string }[];
    placeholder?: string;
}

interface TableWithFiltersProps<T> {
    columns: Column<T>[];
    data?: T[];
    filters?: FilterConfig[];
    searchPlaceholder?: string;
    pageSize?: number;
    pageSizeOptions?: number[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T, index: number) => void;
    rowClassName?: (row: T, index: number) => string;
}

export default function TableWithFilters<T extends Record<string, any>>({
    columns,
    data = [],
    filters = [],
    searchPlaceholder = "Search...",
    pageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
    loading = false,
    emptyMessage = "No data available",
    onRowClick,
    rowClassName,
}: TableWithFiltersProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPageSize, setSelectedPageSize] = useState(pageSize);
    const [showFilters, setShowFilters] = useState(false);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterValues, selectedPageSize]);

    // Filter and search data
    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        return data.filter((row) => {
            // Apply search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const searchMatch = Object.values(row).some((value) =>
                    String(value).toLowerCase().includes(searchLower)
                );
                if (!searchMatch) return false;
            }

            // Apply filters
            for (const filter of filters) {
                const filterValue = filterValues[filter.key];
                if (filterValue && filterValue !== "all") {
                    if (String(row[filter.key]) !== filterValue) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [data, searchTerm, filterValues, filters]);

    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / selectedPageSize);
    const startIndex = (currentPage - 1) * selectedPageSize;
    const endIndex = startIndex + selectedPageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterValues({});
        setSearchTerm("");
    };

    // Page navigation
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 p-4 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700 md:flex-row">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full py-2 pl-10 pr-3 text-gray-900 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={searchPlaceholder}
                    />
                </div>

                {/* Filter Toggle Button */}
                {filters.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showFilters
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            <FunnelIcon className="w-4 h-4" />
                            Filters {Object.keys(filterValues).length > 0 && `(${Object.keys(filterValues).length})`}
                        </button>

                        {(searchTerm || Object.keys(filterValues).length > 0) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Filters Panel */}
            {showFilters && filters.length > 0 && (
                <div className="p-4 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {filter.label}
                                </label>
                                {filter.type === "select" && filter.options ? (
                                    <select
                                        value={filterValues[filter.key] || "all"}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="all">All</option>
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : filter.type === "date" ? (
                                    <input
                                        type="date"
                                        value={filterValues[filter.key] || ""}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={filterValues[filter.key] || ""}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        placeholder={filter.placeholder}
                                        className="block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Table */}
            <Table
                columns={columns}
                data={paginatedData}
                loading={loading}
                emptyMessage={emptyMessage}
                onRowClick={onRowClick}
                rowClassName={rowClassName}
            />

            {/* Pagination */}
            {totalItems > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 p-4 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                            <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{" "}
                            <span className="font-semibold">{totalItems}</span> results
                        </div>

                        <select
                            value={selectedPageSize}
                            onChange={(e) => setSelectedPageSize(Number(e.target.value))}
                            className="px-3 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size} per page
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors bg-white border rounded-lg border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                            ? "bg-indigo-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors bg-white border rounded-lg border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
