'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                if (user.role === 'SYSTEM_ADMIN') router.push('/admin/dashboard');
                else if (user.role === 'STORE_OWNER') router.push('/owner/dashboard');
                else router.push('/dashboard');
            }
        }
    }, [loading, isAuthenticated, user, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
}
