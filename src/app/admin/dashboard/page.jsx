'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import SortableHeader from '@/components/SortableHeader';
import AddUserModal from '@/components/admin/AddUserModal';
import AddStoreModal from '@/components/admin/AddStoreModal';
import { useAuth } from '@/context/AuthContext';
import { Users, Store, Star, Plus, Search, Loader2 } from 'lucide-react';
import Alert from '@/components/Alert';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('stores');
    
    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    
    // Data
    const [metrics, setMetrics] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    
    // States
    const [loading, setLoading] = useState(true);
    const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

    // Store Filters
    const [storeSearch, setStoreSearch] = useState('');
    const [storeSort, setStoreSort] = useState({ key: 'created_at', order: 'DESC' });

    // User Filters
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userSort, setUserSort] = useState({ key: 'created_at', order: 'DESC' });

    useEffect(() => {
        if (token) fetchMetrics();
    }, [token]);

    useEffect(() => {
        if (token) {
            if (activeTab === 'stores') fetchStores();
            else fetchUsers();
        }
    }, [activeTab, token, storeSearch, storeSort, userSearch, userRole, userSort]);

    const fetchMetrics = async () => {
        try {
            const res = await fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setMetrics(data.data);
        } catch (e) { console.error('Failed to fetch metrics'); }
    };

    const fetchStores = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ search: storeSearch, sortBy: storeSort.key, order: storeSort.order }).toString();
            const res = await fetch(`/api/admin/stores?${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setStores(data.data);
        } finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ search: userSearch, role: userRole, sortBy: userSort.key, order: userSort.order }).toString();
            const res = await fetch(`/api/admin/users?${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setUsers(data.data);
        } finally { setLoading(false); }
    };

    const handleSortStores = (key, order) => setStoreSort({ key, order });
    const handleSortUsers = (key, order) => setUserSort({ key, order });

    const handleSuccess = (type) => {
        setAlertMsg({ type: 'success', text: `${type} created successfully!` });
        setIsUserModalOpen(false);
        setIsStoreModalOpen(false);
        fetchMetrics();
        if (type === 'User' && activeTab === 'users') fetchUsers();
        if (type === 'Store' && activeTab === 'stores') fetchStores();
        setTimeout(() => setAlertMsg({ type: '', text: '' }), 3000);
    };

    const roleBadgeColor = (r) => {
        if (r === 'SYSTEM_ADMIN') return 'bg-red-100 text-red-800';
        if (r === 'STORE_OWNER') return 'bg-purple-100 text-purple-800';
        return 'bg-blue-100 text-blue-800';
    };

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {alertMsg.text && <Alert type={alertMsg.type} message={alertMsg.text} />}
                    
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
                        <div className="flex gap-3">
                            <button onClick={() => setIsUserModalOpen(true)} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                                <Plus className="w-4 h-4 mr-2" /> Add New User
                            </button>
                            <button onClick={() => setIsStoreModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
                                <Plus className="w-4 h-4 mr-2" /> Add New Store
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard title="Total Users" value={metrics.totalUsers} icon={Users} colorClass="bg-blue-100 text-blue-600" />
                        <StatCard title="Total Stores" value={metrics.totalStores} icon={Store} colorClass="bg-purple-100 text-purple-600" />
                        <StatCard title="Total Ratings" value={metrics.totalRatings} icon={Star} colorClass="bg-yellow-100 text-yellow-600" />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px px-6">
                                <button onClick={() => setActiveTab('stores')} className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${activeTab === 'stores' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Stores Management
                                </button>
                                <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Users Management
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'stores' && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Search stores..." 
                                                value={storeSearch}
                                                onChange={(e) => setStoreSearch(e.target.value)}
                                                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <SortableHeader label="Store Name" columnKey="name" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                    <SortableHeader label="Email" columnKey="email" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                    <SortableHeader label="Address" columnKey="address" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                                    <SortableHeader label="Overall Rating" columnKey="rating" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                    <SortableHeader label="Created Date" columnKey="created_at" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500"/> Fetching stores...</td></tr>
                                                ) : stores.length === 0 ? (
                                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No stores found.</td></tr>
                                                ) : stores.map(store => (
                                                    <tr key={store.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.email}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{store.address}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.ownerName || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600">★ {Number(store.overallRating).toFixed(1)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(store.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Search users..." 
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <select 
                                            value={userRole} 
                                            onChange={(e) => setUserRole(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            <option value="">All Roles</option>
                                            <option value="SYSTEM_ADMIN">System Admin</option>
                                            <option value="STORE_OWNER">Store Owner</option>
                                            <option value="NORMAL_USER">Normal User</option>
                                        </select>
                                    </div>

                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <SortableHeader label="Name" columnKey="name" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                    <SortableHeader label="Email" columnKey="email" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                    <SortableHeader label="Address" columnKey="address" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                    <SortableHeader label="Role" columnKey="role" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Rating</th>
                                                    <SortableHeader label="Created Date" columnKey="created_at" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500"/> Fetching users...</td></tr>
                                                ) : users.length === 0 ? (
                                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>
                                                ) : users.map(u => (
                                                    <tr key={u.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{u.address}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeColor(u.role)}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {u.role === 'STORE_OWNER' ? `★ ${Number(u.storeRating).toFixed(1)}` : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSuccess={() => handleSuccess('User')} />
                <AddStoreModal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} onSuccess={() => handleSuccess('Store')} />
            </div>
        </ProtectedRoute>
    );
}
