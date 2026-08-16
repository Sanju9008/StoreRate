import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { getDashboardMetrics } from '@/services/admin.service.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const metrics = await getDashboardMetrics();

        return NextResponse.json({ success: true, data: metrics }, { status: 200 });

    } catch (error) {
        console.error('Admin Dashboard error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
