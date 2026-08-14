import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';
import { validateRating } from '@/lib/validators.js';

export async function POST(request) {
    try {
        const { errorResponse, user } = await authorize(request, ['NORMAL_USER']);
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { storeId, rating } = body;

        if (!storeId || !rating) {
            return NextResponse.json({ success: false, message: 'storeId and rating are required' }, { status: 400 });
        }

        if (!validateRating(rating)) {
            return NextResponse.json({ success: false, message: 'Rating must be an integer between 1 and 5' }, { status: 400 });
        }

        // Verify store exists
        const storeCheckSql = `SELECT id FROM stores WHERE id = ?`;
        const storeResults = await query(storeCheckSql, [storeId]);
        if (storeResults.length === 0) {
            return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
        }

        const id = uuidv4();
        
        // UPSERT query to insert or update if exists
        const upsertSql = `
            INSERT INTO ratings (id, rating, user_id, store_id)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            rating = VALUES(rating), 
            updated_at = CURRENT_TIMESTAMP
        `;
        
        await query(upsertSql, [id, rating, user.id, storeId]);

        return NextResponse.json({
            success: true,
            message: 'Rating saved successfully',
            data: { rating }
        }, { status: 200 });

    } catch (error) {
        console.error('POST rating error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
