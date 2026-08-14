import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';

export async function GET(request) {
    try {
        const { errorResponse, user } = await authorize(request, ['NORMAL_USER', 'SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        let sortBy = searchParams.get('sortBy') || 'created_at';
        let order = searchParams.get('order') || 'DESC';

        const allowedSortBy = ['name', 'address', 'rating', 'created_at'];
        if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
        order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const sqlParams = [];
        let whereClause = '';

        if (search) {
            whereClause = `WHERE s.name LIKE ? OR s.address LIKE ?`;
            const likeParam = `%${search}%`;
            sqlParams.push(likeParam, likeParam);
        }

        const sql = `
            SELECT 
                s.id, s.name, s.email, s.address,
                ROUND(COALESCE(AVG(r.rating), 0), 1) AS overallRating,
                COUNT(r.id) AS totalRatings,
                (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS userSubmittedRating
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            ${whereClause}
            GROUP BY s.id
            ORDER BY ${sortBy === 'rating' ? 'overallRating' : 's.' + sortBy} ${order}
        `;

        sqlParams.unshift(user.id); // Add userId parameter at the beginning for the subquery

        const stores = await query(sql, sqlParams);

        return NextResponse.json({
            success: true,
            data: stores
        }, { status: 200 });

    } catch (error) {
        console.error('GET stores error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
