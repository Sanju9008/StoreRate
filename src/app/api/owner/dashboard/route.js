import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { getOwnerDashboardData } from '@/services/store.service.js';

export async function GET(request) {
    try {
        const { errorResponse, user } = await authorize(request, ['STORE_OWNER']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const opts = {
            ownerId: user.id,
            sortBy: searchParams.get('sortBy') || 'created_at',
            order:  searchParams.get('order')  || 'DESC',
        };

        const { store, ratings } = await getOwnerDashboardData(opts);

        return NextResponse.json({ success: true, store, ratings }, { status: 200 });

    } catch (error) {
        console.error('Owner dashboard error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
