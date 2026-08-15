import { NextResponse } from 'next/server';
import { deleteToken } from '@/lib/auth.js';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'No token provided' }, { status: 400 });
        }

        const token = authHeader.substring(7).trim();

        // Decode to get user_id (no verify needed for logout — we just want to clean up)
        let userId = null;
        try {
            const decoded = jwt.decode(token);
            userId = decoded?.id || null;
        } catch (e) {
            // Token malformed, still try to delete by token string
        }

        // Delete all tokens for this user from DB (or fallback: delete by token string)
        if (userId) {
            await deleteToken(userId, true); // DELETE WHERE user_id = ?
        } else {
            await deleteToken(token, false); // DELETE WHERE token = ?
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
