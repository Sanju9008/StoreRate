'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Layout from '@/components/common/Layout';
import StatCard from '@/components/ui/StatCard';
import SortableHeader from '@/components/ui/SortableHeader';
import AddUserModal from '@/components/admin/AddUserModal';
import AddStoreModal from '@/components/admin/AddStoreModal';
import { useAuth } from '@/context/AuthContext';
import { Users, Store, Star, Plus, Search, Loader2 } from 'lucide-react';
import Alert from '@/components/ui/Alert';

function AdminDashboardContent() {
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';
    
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
            else if (activeTab === 'users') fetchUsers();
            else {
                // Dashboard view relies on metrics, but let's clear loading state 
                // since fetchMetrics runs independently.
                setLoading(false);
            }
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
        if (r === 'SYSTEM_ADMIN') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        if (r === 'STORE_OWNER') return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const roleLabel = (r) => {
        if (r === 'SYSTEM_ADMIN') return 'Admin';
        if (r === 'STORE_OWNER') return 'Store Owner';
        return 'User';
    };
    
    const displayTitle = activeTab === 'dashboard' ? 'Dashboard Overview' : 
                         activeTab === 'stores' ? 'Stores Management' : 
                         'Users Management';

    return (
        <Layout title={displayTitle}>
            <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {alertMsg.text && <div className="mb-6"><Alert type={alertMsg.type} message={alertMsg.text} /></div>}
                    
                    {/* View 1: Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Dashboard Overview</h1>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard title="Total Users" value={metrics.totalUsers} icon={Users} colorClass="bg-blue-100 text-[#2563EB]" />
                                <StatCard title="Total Stores" value={metrics.totalStores} icon={Store} colorClass="bg-purple-100 text-purple-600" />
                                <StatCard title="Total Ratings" value={metrics.totalRatings} icon={Star} colorClass="bg-[#FEF3C7] text-[#D97706]" />
                            </div>
                            
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]">
                                <h2 className="text-lg font-bold text-[#0F172A] mb-2">Platform Activity</h2>
                                <p className="text-[#64748B] text-sm">Welcome to the StoreRate admin console. Select Stores or Users from the sidebar to manage platform data.</p>
                            </div>
                        </div>
                    )}
                    
                    {/* View 2: Stores Management */}
                    {activeTab === 'stores' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-6">
                                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Stores Management</h1>
                                <button onClick={() => setIsStoreModalOpen(true)} className="flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all active:scale-95">
                                    <Plus className="w-4 h-4 mr-2" /> Add New Store
                                </button>
                            </div>
                            
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search stores by name or address..." 
                                    value={storeSearch}
                                    onChange={(e) => setStoreSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                                />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto divide-y divide-[#E2E8F0]">
                                        <thead className="bg-[#F8FAFC]">
                                            <tr>
                                                <SortableHeader label="Store Name" columnKey="name" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                <SortableHeader label="Email" columnKey="email" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                <SortableHeader label="Address" columnKey="address" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                <th className="px-5 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Owner</th>
                                                <SortableHeader label="Overall Rating" columnKey="rating" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                                <SortableHeader label="Created Date" columnKey="created_at" currentSort={storeSort.key} currentOrder={storeSort.order} onSort={handleSortStores} />
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-[#E2E8F0]">
                                            {loading ? (
                                                <tr><td colSpan="6" className="px-6 py-12 text-center text-[#64748B]"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2563EB]"/> Fetching stores...</td></tr>
                                            ) : stores.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-[#94A3B8]">
                                                        <Store className="w-8 h-8 mx-auto mb-3 text-[#CBD5E1]" />
                                                        No stores found matching your query.
                                                    </td>
                                                </tr>
                                            ) : stores.map(store => (
                                                <tr key={store.id} className="hover:bg-[#F8FAFC] transition-colors">
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-[#0F172A]">{store.name}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#64748B]">{store.email}</td>
                                                    <td className="px-5 py-4 text-sm text-[#64748B] max-w-xs truncate">{store.address}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#64748B]">{store.ownerName || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-[#D97706]">★ {Number(store.overallRating).toFixed(1)}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#64748B] font-medium">{new Date(store.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* View 3: Users Management */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-6">
                                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Users Management</h1>
                                <button onClick={() => setIsUserModalOpen(true)} className="flex items-center justify-center px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-slate-50 shadow-sm transition-colors">
                                    <Plus className="w-4 h-4 mr-2" /> Add New User
                                </button>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Search users by name, email, or address..." 
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                                    />
                                </div>
                                <select 
                                    value={userRole} 
                                    onChange={(e) => setUserRole(e.target.value)}
                                    className="bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] shadow-sm focus:border-[#2563EB] outline-none cursor-pointer w-full sm:w-auto"
                                >
                                    <option value="">All Roles</option>
                                    <option value="SYSTEM_ADMIN">System Admin</option>
                                    <option value="STORE_OWNER">Store Owner</option>
                                    <option value="NORMAL_USER">Normal User</option>
                                </select>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto divide-y divide-[#E2E8F0]">
                                        <thead className="bg-[#F8FAFC]">
                                            <tr>
                                                <SortableHeader label="Name" columnKey="name" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                <SortableHeader label="Email" columnKey="email" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                <SortableHeader label="Address" columnKey="address" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                <SortableHeader label="Role" columnKey="role" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                                <th className="px-5 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Store Rating</th>
                                                <SortableHeader label="Created Date" columnKey="created_at" currentSort={userSort.key} currentOrder={userSort.order} onSort={handleSortUsers} />
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-[#E2E8F0]">
                                            {loading ? (
                                                <tr><td colSpan="6" className="px-6 py-12 text-center text-[#64748B]"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2563EB]"/> Fetching users...</td></tr>
                                            ) : users.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-[#94A3B8]">
                                                        <Users className="w-8 h-8 mx-auto mb-3 text-[#CBD5E1]" />
                                                        No users found matching your filters.
                                                    </td>
                                                </tr>
                                            ) : users.map(u => (
                                                <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-[#0F172A]">{u.name}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#64748B]">{u.email}</td>
                                                    <td className="px-5 py-4 text-sm text-[#64748B] max-w-xs truncate">{u.address}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full border ${roleBadgeColor(u.role)}`}>
                                                            {roleLabel(u.role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-[#64748B]">
                                                        {u.role === 'STORE_OWNER' ? <span className="text-[#D97706] font-bold">★ {Number(u.storeRating).toFixed(1)}</span> : 'N/A'}
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#64748B] font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSuccess={() => handleSuccess('User')} />
                <AddStoreModal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} onSuccess={() => handleSuccess('Store')} />
            </div>
        </Layout>
    );
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
                </div>
            }>
                <AdminDashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
