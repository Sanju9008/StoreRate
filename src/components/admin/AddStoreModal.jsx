'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';

export default function AddStoreModal({ isOpen, onClose, onSuccess }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        ownerId: '',
        ownerName: ''
    });

    const [storeOwners, setStoreOwners] = useState([]);
    


    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', email: '', address: '', ownerId: '', ownerName: '' });
            setError('');
            fetchStoreOwners();
        }
    }, [isOpen]);

    const fetchStoreOwners = async () => {
        try {
            const res = await fetch('/api/admin/users?role=STORE_OWNER', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter out owners who already have a store
                const availableOwners = data.data.filter(owner => !owner.hasStore);
                setStoreOwners(availableOwners);
            }
        } catch (e) {
            console.error('Failed to fetch store owners');
        }
    };



    if (!isOpen) return null;

    const handleChange = (e) => {
        if (e.target.name === 'ownerId') {
            const selectedOwner = storeOwners.find(owner => owner.id === e.target.value);
            setFormData({
                ...formData,
                ownerId: e.target.value,
                ownerName: selectedOwner ? selectedOwner.name : ''
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const isFormValid = formData.name.trim() && formData.email.includes('@') && formData.address.trim().length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!isFormValid) {
            setError('Please fulfill all validation requirements.');
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            if (!payload.ownerId) {
                delete payload.ownerId;
                delete payload.ownerName;
            }

            const res = await fetch('/api/admin/stores', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                onSuccess();
            } else {
                setError(data.message || 'Creation failed');
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Store</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-4 overflow-y-auto">
                    <Alert type="error" message={error} />

                    <form id="addStoreForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                value={formData.address}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Store Owner (Optional)</label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                            >
                                <option value="">Select an owner</option>
                                {storeOwners.length === 0 ? (
                                    <option value="" disabled>No available owners found</option>
                                ) : (
                                    storeOwners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name} ({owner.email})
                                        </option>
                                    ))
                                )}
                            </select>
                            {storeOwners.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">
                                    All existing owners already manage a store. You must create a new owner first.
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="addStoreForm"
                        disabled={!isFormValid || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Store'}
                    </button>
                </div>
            </div>
        </div>
    );
}
