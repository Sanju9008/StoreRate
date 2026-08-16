'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import { LogOut, KeyRound, Loader2 } from 'lucide-react';

export default function ConsumerNavbar() {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (!user) return null;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    return (
        <>
            <nav className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
                            S
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#0F172A]">StoreRate</span>
                    </Link>

                    {/* Right side Actions */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="flex items-center gap-2 sm:bg-[#EEF2FF] text-[#2563EB] font-medium text-xs sm:px-3 sm:py-1.5 rounded-full sm:border border-[#DBEAFE]">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="pr-1 hidden sm:block max-w-[120px] truncate">{user.name}</span>
                        </div>
                        
                        <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block mx-1"></div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            <KeyRound className="h-4 w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Password</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="h-4 w-4 sm:mr-1.5 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4 sm:mr-1.5" />
                            )}
                            <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </button>
                    </div>
                </div>
            </div>
            </nav>

            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
