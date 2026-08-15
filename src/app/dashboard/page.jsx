'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ConsumerNavbar from '@/components/common/ConsumerNavbar';
import StarRating from '@/components/ui/StarRating';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, Store as StoreIcon, MapPin, Star as StarIcon } from 'lucide-react';

export default function NormalUserDashboard() {
    const { token } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortOption, setSortOption] = useState('newest');

    const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
    const [ratingLoading, setRatingLoading] = useState(null); // storeId currently being rated

    // Rating State
    const [userRatings, setUserRatings] = useState({});

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (token) fetchStores();
    }, [token, debouncedSearch, sortOption]);

    const fetchStores = async () => {
        setLoading(true);
        try {
            let sortBy = 'created_at';
            let order = 'DESC';
            
            if (sortOption === 'highest') { sortBy = 'rating'; order = 'DESC'; }
            if (sortOption === 'lowest') { sortBy = 'rating'; order = 'ASC'; }
            if (sortOption === 'name') { sortBy = 'name'; order = 'ASC'; }

            const query = new URLSearchParams({ search: debouncedSearch, sortBy, order }).toString();
            const res = await fetch(`/api/stores?${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            
            if (data.success) {
                setStores(data.data);
                
                // Initialize local rating state to track modifications instantly
                const initialRatings = {};
                data.data.forEach(store => {
                    initialRatings[store.id] = store.userSubmittedRating || 0;
                });
                setUserRatings(initialRatings);
            }
        } catch (e) {
            console.error('Failed to fetch stores');
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (storeId) => {
        const rating = userRatings[storeId];
        if (!rating) return;

        setRatingLoading(storeId);
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ storeId, rating })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                setAlertMsg({ type: 'success', text: 'Rating updated successfully!' });
                fetchStores(); // Refresh to update average and total rating stats
            } else {
                setAlertMsg({ type: 'error', text: data.message || 'Failed to submit rating' });
            }
        } catch (e) {
            setAlertMsg({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setRatingLoading(null);
            setTimeout(() => setAlertMsg({ type: '', text: '' }), 3000);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['NORMAL_USER']}>
            <div className="bg-[#F8FAFC] min-h-screen font-sans">
                <ConsumerNavbar />
                
                {/* Main Content Container */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Unified Top Toolbar */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 mb-8 mt-4">
                        {/* Left: Text Area */}
                        <div className="shrink-0">
                            <div className="flex flex-row items-center">
                                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Stores Directory</h1>
                                <span className="ml-3 shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                                    {stores.length} {stores.length === 1 ? 'Store' : 'Stores'} Available
                                </span>
                            </div>
                            <p className="text-sm text-[#64748B] mt-1">Explore community-rated businesses and submit your review.</p>
                        </div>

                        {/* Center: Search */}
                        <div className="flex-1 w-full flex justify-center">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search stores..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Right: Filter */}
                        <div className="shrink-0 w-full sm:w-auto mt-4 lg:mt-0">
                            <select 
                                value={sortOption} 
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] shadow-sm focus:border-blue-600 outline-none flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                            >
                                <option value="highest">Highest Rated</option>
                                <option value="newest">Newest First</option>
                                <option value="lowest">Lowest Rated</option>
                                <option value="name">A to Z</option>
                            </select>
                        </div>
                    </div>
                    {alertMsg.text && (
                        <div className="mb-6">
                            <Alert type={alertMsg.type} message={alertMsg.text} />
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col h-44 animate-pulse">
                                    <div className="flex gap-3 mb-4">
                                        <div className="h-11 w-11 rounded-xl bg-slate-100"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="mt-auto h-12 bg-slate-50 border-t border-slate-100 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm max-w-2xl mx-auto mt-6">
                            <StoreIcon className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
                            <h3 className="text-xl font-bold text-[#0F172A]">No stores found</h3>
                            <p className="text-[#64748B] mt-2">Try adjusting your search or filters to discover more.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stores.map(store => {
                                const hasRated = store.userSubmittedRating !== null;
                                const isModified = userRatings[store.id] !== store.userSubmittedRating && userRatings[store.id] !== 0;

                                return (
                                    <div key={store.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 p-5 flex flex-col justify-between">
                                        
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-11 h-11 shrink-0 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] flex items-center justify-center font-bold text-base shadow-sm">
                                                    {store.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 pr-2 flex flex-col">
                                                    <h3 className="text-lg font-bold text-[#0F172A] truncate">{store.name}</h3>
                                                    <p className="text-[11px] text-[#64748B] mt-0.5 tracking-wide font-medium uppercase">
                                                        {store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 ml-2">
                                                <div className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    <StarIcon className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                                                    {Number(store.overallRating).toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-3 truncate">
                                            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                                            <span className="truncate">{store.address}</span>
                                        </p>

                                        {/* Spacer */}
                                        <div className="flex-1 min-h-[12px]"></div>

                                        {/* Interactive Rating Section */}
                                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 mt-4 flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Your Rating</span>
                                                <div className="-ml-1">
                                                    <StarRating 
                                                        rating={userRatings[store.id] || 0} 
                                                        onRate={(r) => setUserRatings({ ...userRatings, [store.id]: r })} 
                                                    />
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleRate(store.id)}
                                                disabled={userRatings[store.id] === 0 || ratingLoading === store.id || (!isModified && hasRated)}
                                                className="bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center min-w-[70px] disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                            >
                                                {ratingLoading === store.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    hasRated ? 'Modify' : 'Submit'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
