import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';

export async function GET(request) {
    try {
        const { errorResponse, user } = await authorize(request, ['STORE_OWNER']);
        if (errorResponse) return errorResponse;

        // Fetch store linked to owner
        const storeSql = `
            SELECT s.id, s.name, s.email, s.address, s.created_at,
                   COALESCE(AVG(r.rating), 0) AS averageRating,
                   COUNT(r.id) AS totalRatings
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE s.owner_id = ?
            GROUP BY s.id
        `;
        const storeResults = await query(storeSql, [user.id]);

        if (storeResults.length === 0) {
            return NextResponse.json({
                success: true,
                store: null,
                ratings: []
            }, { status: 200 });
        }

        const store = storeResults[0];

        // Fetch list of reviewers
        const { searchParams } = new URL(request.url);
        let sortBy = searchParams.get('sortBy') || 'created_at';
        let order = searchParams.get('order') || 'DESC';

        const allowedSortBy = ['name', 'rating', 'created_at'];
        if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
        order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let sortColumn = `r.${sortBy}`;
        if (sortBy === 'name') sortColumn = `u.name`;

        const reviewersSql = `
            SELECT 
                u.name, u.email, u.address, 
                r.rating, r.created_at, r.updated_at
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id = ?
            ORDER BY ${sortColumn} ${order}
        `;
        const reviewers = await query(reviewersSql, [store.id]);

        return NextResponse.json({
            success: true,
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                created_at: store.created_at,
                averageRating: Number(store.averageRating).toFixed(1),
                totalRatings: store.totalRatings
            },
            ratings: reviewers
        }, { status: 200 });

    } catch (error) {
        console.error('Owner dashboard error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
