import { ReactNode } from "react";

export interface Column<T> {
    key: string;
    title: string;
    render?: (value: any, row: T, index: number) => ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T, index: number) => void;
    rowClassName?: (row: T, index: number) => string;
}

export default function Table<T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    emptyMessage = "No data available",
    onRowClick,
    rowClassName,
}: TableProps<T>) {
    return (
        <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                {/* Table Header */}
                <thead className="bg-slate-50 dark:bg-gray-800">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider ${column.className || ""
                                    }`}
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y dark:bg-gray-900 divide-slate-200 dark:divide-gray-700">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-indigo-600 animate-spin"
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
                                    <span className="text-slate-600 dark:text-slate-400">Loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick?.(row, rowIndex)}
                                className={`
                                    transition-colors duration-150
                                    ${onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800" : ""}
                                    ${rowClassName ? rowClassName(row, rowIndex) : ""}
                                `}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 ${column.className || ""
                                            }`}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row, rowIndex)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
