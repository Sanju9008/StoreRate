'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const { updatePassword } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const hasLength   = newPassword.length >= 8 && newPassword.length <= 16;
    const hasUpper    = /[A-Z]/.test(newPassword);
    const hasSpecial  = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
    const isValid = hasLength && hasUpper && hasSpecial && passwordsMatch && oldPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isValid) {
            setError('Please fulfill all password requirements.');
            return;
        }

        setLoading(true);
        const res = await updatePassword({ oldPassword, newPassword });
        setLoading(false);

        if (res.success) {
            setSuccess('Password updated! Redirecting to login...');
            setTimeout(() => onClose(), 2000);
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p className={`flex items-center gap-1 ${hasLength ? 'text-green-600' : ''}`}>
                                    {hasLength ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300"></div>}
                                    8 to 16 characters
                                </p>
                                <p className={`flex items-center gap-1 ${hasUpper ? 'text-green-600' : ''}`}>
                                    {hasUpper ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300"></div>}
                                    One uppercase letter
                                </p>
                                <p className={`flex items-center gap-1 ${hasSpecial ? 'text-green-600' : ''}`}>
                                    {hasSpecial ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-gray-300"></div>}
                                    One special character
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <div className="mt-1 text-xs">
                                {confirmPassword.length > 0 && (
                                    <p className={passwordsMatch ? 'text-green-600' : 'text-red-500'}>
                                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isValid || loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
