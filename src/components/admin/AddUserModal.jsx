'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';

export default function AddUserModal({ isOpen, onClose, onSuccess, defaultRole = 'NORMAL_USER', lockRole = false, title = 'Add New User' }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
        role: defaultRole
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                email: '',
                address: '',
                password: '',
                role: defaultRole
            });
            setError('');
        }
    }, [isOpen, defaultRole]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Validations
    const nameLength = formData.name.trim().length;
    const isNameValid = nameLength >= 20 && nameLength <= 60;
    
    const addressLength = formData.address.trim().length;
    const isAddressValid = addressLength > 0 && addressLength <= 400;

    const hasLength = formData.password.length >= 8 && formData.password.length <= 16;
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
    const isPasswordValid = hasLength && hasUpper && hasSpecial;

    const isFormValid = isNameValid && isAddressValid && isPasswordValid && formData.email.includes('@');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!isFormValid) {
            setError('Please fulfill all validation requirements.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
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
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-4 overflow-y-auto">
                    <Alert type="error" message={error} />

                    <form id="addUserForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                <span>Full Name</span>
                                <span className={`text-xs ${isNameValid ? 'text-green-600' : 'text-gray-500'}`}>
                                    {nameLength}/60 (Min 20)
                                </span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm ${isNameValid ? 'border-green-300' : 'border-gray-300'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={lockRole}
                                className={`block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm ${lockRole ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            >
                                <option value="NORMAL_USER">Normal User</option>
                                <option value="STORE_OWNER">Store Owner</option>
                                <option value="SYSTEM_ADMIN">System Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                <span>Address</span>
                                <span className={`text-xs ${isAddressValid ? 'text-green-600' : 'text-gray-500'}`}>
                                    {addressLength}/400
                                </span>
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                            />
                            <div className="mt-2 text-xs text-gray-500 flex gap-4">
                                <span className={`flex items-center gap-1 ${hasLength ? 'text-green-600' : ''}`}>
                                    {hasLength && <CheckCircle2 className="h-3 w-3" />} 8-16 chars
                                </span>
                                <span className={`flex items-center gap-1 ${hasUpper ? 'text-green-600' : ''}`}>
                                    {hasUpper && <CheckCircle2 className="h-3 w-3" />} 1 Upper
                                </span>
                                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-green-600' : ''}`}>
                                    {hasSpecial && <CheckCircle2 className="h-3 w-3" />} 1 Special
                                </span>
                            </div>
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
                        form="addUserForm"
                        disabled={!isFormValid || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : title}
                    </button>
                </div>
            </div>
        </div>
    );
}
