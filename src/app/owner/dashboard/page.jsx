'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Layout from '@/components/common/Layout';
import StarRating from '@/components/ui/StarRating';
import SortableHeader from '@/components/ui/SortableHeader';
import { useAuth } from '@/context/AuthContext';
import { Store, Loader2, Users, Star, MapPin, Mail, Search, MessageSquare } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

function DashboardContent() {
    const { token, user } = useAuth();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') === 'reviews' ? 'reviews' : 'overview';
    
    const [store, setStore] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Sort and Search state for the table
    const [sort, setSort] = useState({ key: 'created_at', order: 'DESC' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (token) fetchDashboardData();
    }, [token, sort]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ sortBy: sort.key, order: sort.order }).toString();
            const res = await fetch(`/api/owner/dashboard?${query}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const data = await res.json();
            
            if (data.success) {
                setStore(data.store);
                setRatings(data.ratings);
            }
        } catch (e) {
            console.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key, order) => {
        setSort({ key, order });
    };

    const filteredRatings = useMemo(() => {
        if (!debouncedSearchTerm) return ratings;
        const lower = debouncedSearchTerm.toLowerCase();
        return ratings.filter(r => 
            (r.name && r.name.toLowerCase().includes(lower)) ||
            (r.email && r.email.toLowerCase().includes(lower)) ||
            (r.address && r.address.toLowerCase().includes(lower))
        );
    }, [ratings, debouncedSearchTerm]);

    const fiveStarPercentage = useMemo(() => {
        if (ratings.length === 0) return 0;
        const fiveStars = ratings.filter(r => Number(r.rating) === 5).length;
        return Math.round((fiveStars / ratings.length) * 100);
    }, [ratings]);

    const title = activeTab === 'overview' ? 'Store Overview' : 'Customer Reviews';

    return (
        <Layout title={title}>
            <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mb-4" />
                            <p className="text-[#64748B] font-medium">Loading store profile...</p>
                        </div>
                    ) : !store ? (
                        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] max-w-2xl mx-auto mt-6">
                            <Store className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
                            <h2 className="text-2xl font-bold text-[#0F172A]">No Store Assigned</h2>
                            <p className="mt-2 text-[#64748B] max-w-sm mx-auto">
                                No store has been assigned to your account by the administrator yet. 
                                Please contact the system admin.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            
                            {activeTab === 'overview' && (
                                <>
                                    {/* Store Header Card */}
                                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Store className="w-48 h-48 text-[#0F172A]" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <h1 className="text-3xl font-extrabold text-[#0F172A]">{store.name}</h1>
                                                <div className="mt-4 space-y-2">
                                                    <p className="text-[#64748B] flex items-center text-sm font-medium">
                                                        <MapPin className="w-4 h-4 mr-2 text-[#94A3B8]" /> {store.address}
                                                    </p>
                                                    <p className="text-[#64748B] flex items-center text-sm font-medium">
                                                        <Mail className="w-4 h-4 mr-2 text-[#94A3B8]" /> {store.email}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-[#FEF3C7] rounded-2xl p-6 border border-[#FDE68A] text-center min-w-[200px] shadow-sm">
                                                <div className="flex items-center justify-center gap-2 text-[#D97706] font-black text-4xl mb-2">
                                                    <Star className="w-8 h-8 fill-[#F59E0B] text-[#F59E0B]" />
                                                    {Number(store.averageRating).toFixed(1)} <span className="text-xl text-[#B45309] font-semibold">/ 5.0</span>
                                                </div>
                                                <p className="text-sm font-bold text-[#92400E] flex items-center justify-center gap-1.5 tracking-wide">
                                                    <Users className="w-4 h-4" />
                                                    BASED ON {store.totalRatings} RATINGS
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Metrics Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col justify-center">
                                            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Total Reviews</p>
                                            <div className="text-3xl font-extrabold text-[#0F172A]">{ratings.length}</div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col justify-center">
                                            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Average Rating</p>
                                            <div className="text-3xl font-extrabold text-[#0F172A] flex items-center gap-2">
                                                {Number(store.averageRating).toFixed(1)}
                                                <Star className="w-6 h-6 fill-[#F59E0B] text-[#F59E0B]" />
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col justify-center">
                                            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">5-Star Excellence</p>
                                            <div className="text-3xl font-extrabold text-[#0F172A]">{fiveStarPercentage}%</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    {/* Filter / Search Bar */}
                                    <div className="flex items-center justify-between">
                                        <div className="relative w-full max-w-md">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input 
                                                type="text" 
                                                placeholder="Search reviews by name, email, or address..." 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Customer Ratings Table */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                                        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                                            <table className="w-full min-w-[640px] table-auto divide-y divide-[#E2E8F0]">
                                                <thead className="bg-[#F8FAFC]">
                                                    <tr>
                                                        <SortableHeader label="Reviewer Name" columnKey="name" currentSort={sort.key} currentOrder={sort.order} onSort={handleSort} />
                                                        <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Email</th>
                                                        <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Address</th>
                                                        <SortableHeader label="Rating" columnKey="rating" currentSort={sort.key} currentOrder={sort.order} onSort={handleSort} />
                                                        <SortableHeader label="Date" columnKey="created_at" currentSort={sort.key} currentOrder={sort.order} onSort={handleSort} />
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                                                    {filteredRatings.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8]">
                                                                <MessageSquare className="w-8 h-8 mx-auto mb-3 text-[#CBD5E1]" />
                                                                No reviews found matching your search.
                                                            </td>
                                                        </tr>
                                                    ) : filteredRatings.map((review, idx) => (
                                                        <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-[#0F172A]">{review.name}</td>
                                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-[#64748B]">{review.email}</td>
                                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[#64748B] max-w-[200px] sm:max-w-xs truncate">{review.address}</td>
                                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                                                                <div className="flex">
                                                                    <StarRating rating={review.rating} readonly={true} />
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-[#64748B] font-medium">{new Date(review.created_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default function StoreOwnerDashboard() {
    return (
        <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
