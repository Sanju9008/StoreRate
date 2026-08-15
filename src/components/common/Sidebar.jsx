'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordModal from '@/components/common/ChangePasswordModal';
import { 
    LogOut, KeyRound, LayoutDashboard, Store, Users, 
    Star, MessageSquare, X, ChevronRight 
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) return null;

    const navConfig = {
        SYSTEM_ADMIN: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Stores', href: '/admin/dashboard?tab=stores', icon: Store },
            { name: 'Users', href: '/admin/dashboard?tab=users', icon: Users },
        ],
        NORMAL_USER: [
            { name: 'Explore Stores', href: '/dashboard', icon: Store },
            { name: 'My Ratings', href: '/dashboard?tab=ratings', icon: Star },
        ],
        STORE_OWNER: [
            { name: 'Store Overview', href: '/owner/dashboard', icon: LayoutDashboard },
            { name: 'Customer Reviews', href: '/owner/dashboard?tab=reviews', icon: MessageSquare },
        ]
    };

    const links = navConfig[user.role] || [];

    const roleBadgeColor = {
        SYSTEM_ADMIN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        STORE_OWNER:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        NORMAL_USER:  'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }[user.role];

    const roleLabel = {
        SYSTEM_ADMIN: 'Admin',
        STORE_OWNER:  'Store Owner',
        NORMAL_USER:  'User'
    }[user.role];

    const sidebarContent = (
        <div className="flex h-full flex-col bg-slate-900 text-slate-300">
            {/* Brand Header */}
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
                <Link href={links[0]?.href || '/'} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-blue-900/20">
                        S
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">StoreRate</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                    {links.map((item) => {
                        const hrefPath = item.href.split('?')[0];
                        const hrefParams = new URLSearchParams(item.href.split('?')[1] || '');
                        const hrefTab = hrefParams.get('tab');
                        const currentTab = searchParams.get('tab');
                        
                        // Active if pathnames match AND (both have same tab OR both have no tab)
                        const isActive = pathname === hrefPath && (hrefTab === currentTab);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-slate-800 text-white font-medium'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                                }`} />
                                {item.name}
                                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-500/50" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Profile Section */}
            <div className="shrink-0 border-t border-slate-800 p-4">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm text-white shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full group flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    >
                        <KeyRound className="mr-3 h-4 w-4 text-slate-500 group-hover:text-slate-300" />
                        Change Password
                    </button>
                    <button
                        onClick={logout}
                        className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4 text-red-500/70 group-hover:text-red-400" />
                        Logout
                    </button>
                </div>
            </div>
            
            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="relative z-50 md:hidden">
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />
                    <div className="fixed inset-0 flex">
                        <div className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                <button type="button" className="-m-2.5 p-2.5 text-white" onClick={() => setMobileOpen(false)}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            {sidebarContent}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
