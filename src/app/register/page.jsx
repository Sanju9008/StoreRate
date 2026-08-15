'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Alert from '@/components/ui/Alert';

export default function Register() {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Validations
    const nameLength = formData.name.trim().length;
    const isNameValid = nameLength > 0;
    
    const addressLength = formData.address.trim().length;
    const isAddressValid = addressLength > 0;

    const isPasswordValid = formData.password.length >= 6;

    const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

    const isFormValid = isNameValid && isAddressValid && isPasswordValid && passwordsMatch && formData.email.includes('@');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!isFormValid) {
            setError('Please fulfill all validation requirements.');
            return;
        }

        setLoading(true);
        const { confirmPassword, ...registerData } = formData;
        const res = await register(registerData);
        
        if (!res.success) {
            setError(res.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Join StoreRate to review your favorite stores.</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <Alert type="error" message={error} />
                    
                    <div className="grid grid-cols-1 gap-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm ${isNameValid ? 'border-green-300' : 'border-gray-300'}`}
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                value={formData.address}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm resize-none"
                                placeholder="Enter your full address"
                            />
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                />
                                {formData.confirmPassword && (
                                    <p className={`mt-1 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={!isFormValid || loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
