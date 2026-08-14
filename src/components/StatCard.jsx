export default function StatCard({ title, value, icon: Icon, colorClass }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-3xl font-bold text-gray-900 mt-1">
                                {value}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
