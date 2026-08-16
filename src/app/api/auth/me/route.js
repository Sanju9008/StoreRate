import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { findUserById } from '@/services/auth.service.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { errorResponse, user } = await authorize(request);
        if (errorResponse) return errorResponse;

        const freshUser = await findUserById(user.id);
        if (!freshUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: freshUser }, { status: 200 });

    } catch (error) {
        console.error('Me endpoint error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
