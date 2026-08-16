'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { X, Loader2 } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const { updatePassword } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    if (!isOpen) return null;

    const hasLength   = newPassword.length >= 8 && newPassword.length <= 16;
    const hasUpper    = /[A-Z]/.test(newPassword);
    const hasSpecial  = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
    const isValid = hasLength && hasUpper && hasSpecial && passwordsMatch && oldPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) {
            showError('Please fulfill all password requirements.');
            return;
        }

        setLoading(true);
        const res = await updatePassword({ oldPassword, newPassword });
        setLoading(false);

        if (res.success) {
            showSuccess('Password updated successfully!');
            onClose(); // close immediately or you can add a short timeout if preferred, the instruction says "and close modal".
        } else {
            showError(res.message || 'Failed to update password');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-[95%] sm:w-full max-w-md overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-4 overflow-y-auto">
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

                        <div className="pt-4 flex justify-end gap-3 shrink-0">
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
