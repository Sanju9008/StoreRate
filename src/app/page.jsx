'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                if (user.role === 'SYSTEM_ADMIN') router.push('/admin/dashboard');
                else if (user.role === 'STORE_OWNER') router.push('/owner/dashboard');
                else router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
    );
}
