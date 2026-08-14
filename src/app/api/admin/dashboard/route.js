import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';

export async function GET(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        // Fetch aggregates
        const usersSql = `SELECT COUNT(*) as count FROM users`;
        const storesSql = `SELECT COUNT(*) as count FROM stores`;
        const ratingsSql = `SELECT COUNT(*) as count FROM ratings`;

        const [usersResult, storesResult, ratingsResult] = await Promise.all([
            query(usersSql, []),
            query(storesSql, []),
            query(ratingsSql, [])
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalUsers: usersResult[0].count,
                totalStores: storesResult[0].count,
                totalRatings: ratingsResult[0].count
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Dashboard error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
