import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { validatePassword } from '@/lib/validators.js';
import { verifyPassword, hashPassword, deleteToken } from '@/lib/auth.js';
import { getUserHashedPassword, updateUserPassword } from '@/services/auth.service.js';

export const dynamic = 'force-dynamic';

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
            return NextResponse.json({ success: false, message: 'New password must be at least 6 characters.' }, { status: 400 });
        }

        const currentHash = await getUserHashedPassword(user.id);
        if (!currentHash) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const passwordMatch = await verifyPassword(oldPassword, currentHash);
        if (!passwordMatch) {
            return NextResponse.json({ success: false, message: 'Incorrect old password' }, { status: 401 });
        }

        const hashedNewPassword = await hashPassword(newPassword);
        await updateUserPassword(user.id, hashedNewPassword);

        // Invalidate all sessions — force re-login
        await deleteToken(user.id, true);

        return NextResponse.json({ success: true, message: 'Password updated successfully. Please log in again.' }, { status: 200 });

    } catch (error) {
        console.error('Update password error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
