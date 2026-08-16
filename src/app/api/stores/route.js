import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { getStoresWithUserRating } from '@/services/store.service.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { errorResponse, user } = await authorize(request, ['NORMAL_USER', 'SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const opts = {
            userId: user.id,
            search: searchParams.get('search') || '',
            sortBy: searchParams.get('sortBy') || 'created_at',
            order:  searchParams.get('order')  || 'DESC',
        };

        const stores = await getStoresWithUserRating(opts);

        return NextResponse.json({ success: true, data: stores }, { status: 200 });

    } catch (error) {
        console.error('GET stores error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
