'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import { LogOut, KeyRound } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) return null;

    const roleBadgeColor = {
        SYSTEM_ADMIN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        STORE_OWNER:  'bg-emerald-100 text-emerald-800 border-emerald-200',
        NORMAL_USER:  'bg-slate-100 text-slate-800 border-slate-200'
    }[user.role];

    const roleLabel = {
        SYSTEM_ADMIN: 'Admin',
        STORE_OWNER:  'Store Owner',
        NORMAL_USER:  'User'
    }[user.role];

    const dashboardLink = {
        SYSTEM_ADMIN: '/admin/dashboard',
        STORE_OWNER:  '/owner/dashboard',
        NORMAL_USER:  '/dashboard'
    }[user.role];

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href={dashboardLink} className="flex-shrink-0 flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                S
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">StoreRate</span>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 py-2 sm:py-0">
                        <div className="flex items-center gap-2 sm:bg-slate-50 sm:px-3 sm:py-1.5 rounded-full sm:border border-slate-200">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-left max-w-[120px] lg:max-w-[200px]">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            title="Change Password"
                        >
                            <KeyRound className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Password</span>
                        </button>

                        <button
                            onClick={logout}
                            className="flex items-center justify-center h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
}
