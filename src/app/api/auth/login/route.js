import { NextResponse } from 'next/server';
import { validateLogin } from '@/lib/validators.js';
import { verifyPassword, generateToken, storeToken } from '@/lib/auth.js';
import { findUserByEmail } from '@/services/auth.service.js';

export async function POST(request) {
    try {
        const body = await request.json();

        const { isValid, errors } = validateLogin(body);
        if (!isValid) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        const { email, password } = body;

        const dbUser = await findUserByEmail(email);
        if (!dbUser) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        const passwordMatch = await verifyPassword(password, dbUser.password);
        if (!passwordMatch) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, address: dbUser.address, role: dbUser.role };
        const token = generateToken(user);
        await storeToken(user.id, token);

        return NextResponse.json({ success: true, token, user }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
