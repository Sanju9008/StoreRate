import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';
import { validatePassword } from '@/lib/validators.js';
import { verifyPassword, hashPassword, revokeToken } from '@/lib/auth.js';

export async function PUT(request) {
    try {
        const { errorResponse, user } = await authorize(request);
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ success: false, message: 'oldPassword and newPassword are required' }, { status: 400 });
        }

        if (!validatePassword(newPassword)) {
            return NextResponse.json({ 
                success: false, 
                message: 'New password must be 8-16 characters, include an uppercase letter and a special character.' 
            }, { status: 400 });
        }

        // Fetch current password from db
        const sql = `SELECT password FROM users WHERE id = ?`;
        const users = await query(sql, [user.id]);
        
        if (users.length === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const dbPassword = users[0].password;

        // Verify old password
        const passwordMatch = await verifyPassword(oldPassword, dbPassword);
        if (!passwordMatch) {
            return NextResponse.json({ success: false, message: 'Incorrect old password' }, { status: 401 });
        }

        // Hash and update new password
        const hashedNewPassword = await hashPassword(newPassword);
        const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
        await query(updateSql, [hashedNewPassword, user.id]);

        // Revoke current token
        const authHeader = request.headers.get('authorization');
        const token = authHeader.substring(7);
        await revokeToken(token);

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully. Please log in again.'
        }, { status: 200 });

    } catch (error) {
        console.error('Update password error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
