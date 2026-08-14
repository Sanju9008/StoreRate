'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import Alert from '@/components/Alert';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login({ email, password });
        if (!res.success) {
            setError(res.message);
        }
        setLoading(false);
    };

    const fillDemo = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-sm">
                        S
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to StoreRate</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage and review stores.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <Alert type="error" message={error} />
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> Sign in</span>}
                        </button>
                    </div>
                </form>

                <div className="mt-6 border-t border-gray-200 pt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Quick Evaluator Demo Logins:</p>
                    <div className="grid grid-cols-1 gap-2">
                        <button onClick={() => fillDemo('admin@platform.com', 'Admin@1234')} className="text-xs py-2 px-3 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-left flex justify-between">
                            <span className="font-semibold text-gray-800">Admin</span> 
                            <span className="text-gray-500">admin@platform.com</span>
                        </button>
                        <button onClick={() => fillDemo('owner@platform.com', 'Owner@1234')} className="text-xs py-2 px-3 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-left flex justify-between">
                            <span className="font-semibold text-gray-800">Store Owner</span> 
                            <span className="text-gray-500">owner@platform.com</span>
                        </button>
                        <button onClick={() => fillDemo('user@platform.com', 'User@1234')} className="text-xs py-2 px-3 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-left flex justify-between">
                            <span className="font-semibold text-gray-800">Normal User</span> 
                            <span className="text-gray-500">user@platform.com</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
