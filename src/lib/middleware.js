import { NextResponse } from 'next/server';
import { verifyAuthToken } from './auth.js';

export async function authorize(request, allowedRoles = []) {
    const user = await verifyAuthToken(request);
    
    if (!user) {
        return {
            errorResponse: NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            ),
            user: null
        };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return {
            errorResponse: NextResponse.json(
                { success: false, message: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            ),
            user: null
        };
    }

    return { errorResponse: null, user };
}
