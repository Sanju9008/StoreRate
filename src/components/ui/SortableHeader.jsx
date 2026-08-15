import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export default function SortableHeader({ label, columnKey, currentSort, currentOrder, onSort }) {
    const isActive = currentSort === columnKey;

    const handleSort = () => {
        if (isActive) {
            onSort(columnKey, currentOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            onSort(columnKey, 'DESC');
        }
    };

    return (
        <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleSort}
        >
            <div className="flex items-center gap-1 select-none">
                {label}
                <span className="text-gray-400">
                    {isActive ? (
                        currentOrder === 'ASC'
                            ? <ArrowUp className="w-4 h-4 text-blue-600" />
                            : <ArrowDown className="w-4 h-4 text-blue-600" />
                    ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                </span>
            </div>
        </th>
    );
}
