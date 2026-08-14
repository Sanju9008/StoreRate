import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/lib/db.js';
import { validateSignup } from '@/lib/validators.js';
import { hashPassword, generateToken, storeToken } from '@/lib/auth.js';

export async function POST(request) {
    try {
        const body = await request.json();
        
        const { isValid, errors } = validateSignup(body);
        if (!isValid) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        const { name, email, password, address } = body;

        // Check if email exists
        const emailCheckSql = `SELECT id FROM users WHERE email = ?`;
        const emailResults = await query(emailCheckSql, [email]);
        if (emailResults.length > 0) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const role = 'NORMAL_USER'; // Only normal users can register through public endpoint
        const hashedPassword = await hashPassword(password);

        // Insert user
        const insertSql = `
            INSERT INTO users (id, name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await query(insertSql, [id, name, email, hashedPassword, address, role]);

        // Create token
        const user = { id, name, email, address, role };
        const token = generateToken(user);
        await storeToken(id, token);

        return NextResponse.json({
            success: true,
            token,
            user
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
