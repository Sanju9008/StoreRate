import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';

export async function GET(request) {
    try {
        const { errorResponse, user } = await authorize(request);
        if (errorResponse) return errorResponse;

        // Fetch latest profile from DB to ensure it's fresh
        const sql = `SELECT id, name, email, address, role FROM users WHERE id = ?`;
        const users = await query(sql, [user.id]);
        
        if (users.length === 0) {
             return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: users[0]
        }, { status: 200 });

    } catch (error) {
        console.error('Me endpoint error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
