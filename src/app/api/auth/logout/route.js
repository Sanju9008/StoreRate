import { NextResponse } from 'next/server';
import { deleteToken } from '@/lib/auth.js';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'No token provided' }, { status: 400 });
        }

        const token = authHeader.substring(7).trim();

        // Safely decode and delete by user_id (VARCHAR) rather than token (TEXT) for reliable deletion
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.id) {
                await deleteToken(decoded.id, true);
            } else {
                await deleteToken(token, false);
            }
        } catch(e) {
            await deleteToken(token, false);
        }

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully. Session deleted from database.'
        }, { status: 200 });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
