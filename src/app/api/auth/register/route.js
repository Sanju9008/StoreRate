import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { validateSignup } from '@/lib/validators.js';
import { hashPassword, generateToken, storeToken } from '@/lib/auth.js';
import { emailExists, createUser } from '@/services/auth.service.js';

export async function POST(request) {
    try {
        const body = await request.json();

        const { isValid, errors } = validateSignup(body);
        if (!isValid) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        const { name, email, password, address } = body;

        if (await emailExists(email)) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const role = 'NORMAL_USER'; // Public endpoint — always registers as normal user
        const hashedPassword = await hashPassword(password);

        await createUser(id, name, email, hashedPassword, address, role);

        const user = { id, name, email, address, role };
        const token = generateToken(user);
        await storeToken(id, token);

        return NextResponse.json({ success: true, token, user }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
