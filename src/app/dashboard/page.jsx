'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Navbar from '@/components/common/Navbar';
import StarRating from '@/components/ui/StarRating';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, Store as StoreIcon, MapPin } from 'lucide-react';

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
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {alertMsg.text && <Alert type={alertMsg.type} message={alertMsg.text} />}

                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="relative w-full md:max-w-xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search stores by Name or Address..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>

                        <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[200px]"
                        >
                            <option value="newest">Newest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                            <option value="name">Store Name (A-Z)</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-500 font-medium">Discovering stores...</p>
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <StoreIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {stores.map(store => {
                                const hasRated = store.userSubmittedRating !== null;
                                const isModified = userRatings[store.id] !== store.userSubmittedRating && userRatings[store.id] !== 0;

                                return (
                                    <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                                    {store.address}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-yellow-600 font-bold text-xl">★ {Number(store.overallRating).toFixed(1)}</span>
                                                    <p className="text-xs text-gray-500 mt-1">({store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'})</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-5">
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Your Rating:
                                                    </p>
                                                    <StarRating 
                                                        rating={userRatings[store.id] || 0} 
                                                        onRate={(r) => setUserRatings({ ...userRatings, [store.id]: r })} 
                                                    />
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleRate(store.id)}
                                                    disabled={userRatings[store.id] === 0 || ratingLoading === store.id || (!isModified && hasRated)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {ratingLoading === store.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        hasRated ? 'Modify Rating' : 'Submit Rating'
                                                    )}
                                                </button>
                                            </div>
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
