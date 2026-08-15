export default function StatCard({ title, value, icon: Icon, colorClass }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 hover:shadow transition-all duration-200 group">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                    </div>
                    <div className={`p-3 rounded-xl border shadow-sm transition-colors ${colorClass.replace('bg-','bg-opacity-10 text-').replace('-100','-600 border-opacity-20 border-').replace('text-','text-')}`}>
                        {/* Fallback to simple slate styling if colorClass is standard format from previous code */}
                        {/* The dashboard passes classes like "bg-blue-100 text-blue-600", we want a more subtle look */}
                        <Icon className="w-5 h-5 text-current" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
