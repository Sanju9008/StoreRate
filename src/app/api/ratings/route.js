import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '@/lib/middleware.js';
import { validateRating } from '@/lib/validators.js';
import { storeExists, upsertRating } from '@/services/rating.service.js';

export async function POST(request) {
    try {
        const { errorResponse, user } = await authorize(request, ['NORMAL_USER']);
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { storeId, rating } = body;

        if (!storeId || rating === undefined) {
            return NextResponse.json({ success: false, message: 'storeId and rating are required' }, { status: 400 });
        }

        if (!validateRating(rating)) {
            return NextResponse.json({ success: false, message: 'Rating must be an integer between 1 and 5' }, { status: 400 });
        }

        if (!(await storeExists(storeId))) {
            return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
        }

        await upsertRating(uuidv4(), rating, user.id, storeId);

        return NextResponse.json({ success: true, message: 'Rating saved successfully', data: { rating } }, { status: 200 });

    } catch (error) {
        console.error('POST rating error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
