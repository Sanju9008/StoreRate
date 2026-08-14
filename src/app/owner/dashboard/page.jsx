'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';
import SortableHeader from '@/components/SortableHeader';
import { useAuth } from '@/context/AuthContext';
import { Store, Loader2, Users, Star, MapPin, Mail } from 'lucide-react';

export default function StoreOwnerDashboard() {
    const { token, user } = useAuth();
    
    const [store, setStore] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Sort state for the table
    const [sort, setSort] = useState({ key: 'created_at', order: 'DESC' });

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

    return (
        <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-500 font-medium">Loading store profile...</p>
                        </div>
                    ) : !store ? (
                        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900">No Store Assigned</h2>
                            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                                No store has been assigned to your account by the administrator yet. 
                                Please contact the system admin.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Store Header Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Store className="w-48 h-48" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-gray-900">{store.name}</h1>
                                        <div className="mt-4 space-y-2">
                                            <p className="text-gray-600 flex items-center text-sm">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {store.address}
                                            </p>
                                            <p className="text-gray-600 flex items-center text-sm">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" /> {store.email}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 text-center min-w-[200px]">
                                        <div className="flex items-center justify-center gap-2 text-yellow-600 font-black text-4xl mb-2">
                                            <Star className="w-8 h-8 fill-current" />
                                            {store.averageRating} <span className="text-xl text-yellow-400 font-medium">/ 5.0</span>
                                        </div>
                                        <p className="text-sm font-medium text-yellow-800 flex items-center justify-center gap-1">
                                            <Users className="w-4 h-4" />
                                            Based on {store.totalRatings} ratings
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Ratings Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200 bg-white">
                                    <h3 className="text-lg font-bold text-gray-900">Customer Feedback Log</h3>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <SortableHeader label="Reviewer Name" columnKey="name" currentSort={sort.key} currentOrder={sort.order} onSort={handleSort} />
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                                <SortableHeader label="Rating" columnKey="rating" currentSort={sort.key} currentOrder={sort.order} onSort={handleSort} />
                                                <SortableHeader label="Date" columnKey="created_at" currentSort={sort.key} currentOrder={sort.order} onSort={handleSort} />
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {ratings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                        <Star className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                                        No reviews submitted yet.
                                                    </td>
                                                </tr>
                                            ) : ratings.map((review, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.email}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{review.address}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <StarRating rating={review.rating} readonly={true} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
