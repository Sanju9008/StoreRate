import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { revokeToken } from '@/lib/auth.js';

export async function POST(request) {
    try {
        const { errorResponse } = await authorize(request);
        if (errorResponse) return errorResponse;

        // Extract token
        const authHeader = request.headers.get('authorization');
        const token = authHeader.substring(7);

        // Revoke token in database
        await revokeToken(token);

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
