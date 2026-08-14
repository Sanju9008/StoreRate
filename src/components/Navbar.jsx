'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { LogOut, User, KeyRound, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) return null;

    const roleBadgeColor = {
        SYSTEM_ADMIN: 'bg-red-100 text-red-800 border-red-200',
        STORE_OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
        NORMAL_USER: 'bg-blue-100 text-blue-800 border-blue-200'
    }[user.role];

    const roleLabel = {
        SYSTEM_ADMIN: 'Admin',
        STORE_OWNER: 'Store Owner',
        NORMAL_USER: 'User'
    }[user.role];

    const dashboardLink = {
        SYSTEM_ADMIN: '/admin/dashboard',
        STORE_OWNER: '/owner/dashboard',
        NORMAL_USER: '/dashboard'
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

                    {/* Desktop Menu */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColor}`}>
                                {roleLabel}
                            </span>
                        </div>

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <KeyRound className="h-4 w-4 mr-1.5" />
                            Password
                        </button>
                        
                        <button 
                            onClick={logout}
                            className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-1.5" />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 pt-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block ${roleBadgeColor}`}>
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Change Password
                        </button>
                        <button 
                            onClick={logout}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}

            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
}
