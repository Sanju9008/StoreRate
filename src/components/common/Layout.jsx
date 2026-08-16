'use client';

import { useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Layout({ children, title }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Auto-detect title based on pathname if not provided
    const displayTitle = title || (() => {
        if (pathname.includes('/admin/dashboard')) return 'System Dashboard';
        if (pathname.includes('/owner/dashboard')) return 'Store Overview';
        if (pathname.includes('/dashboard')) return 'Explore Stores';
        return 'Dashboard';
    })();

    return (
        <div className="flex h-screen bg-slate-50/60 overflow-hidden font-sans">
            {/* Sidebar Component */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0 transition-all duration-300">
                {/* Header Bar */}
                <header className="sticky top-0 z-10 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="lg:hidden -ml-2 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{displayTitle}</h1>
                            {pathname.includes('/owner/') && (
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider -mt-0.5">Store Owner Dashboard</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
