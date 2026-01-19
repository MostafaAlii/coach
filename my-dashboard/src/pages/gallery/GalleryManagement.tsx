export default function GalleryManagement() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        Gallery Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage your Gallery content
                    </p>
                </div>
                <button className="px-4 py-2 text-white transition-all duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    + Add New Gallery
                </button>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <p className="text-slate-600 dark:text-slate-400">
                    Gallery will appear here (CRUD operations coming soon)
                </p>
            </div>
        </div>
    );
}
