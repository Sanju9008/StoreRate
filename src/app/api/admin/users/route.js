import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';
import { hashPassword } from '@/lib/auth.js';
import { validateName, validateEmail, validatePassword, validateAddress } from '@/lib/validators.js';

export async function GET(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        let sortBy = searchParams.get('sortBy') || 'created_at';
        let order = searchParams.get('order') || 'DESC';

        // Allowed sort columns
        const allowedSortBy = ['name', 'email', 'address', 'role', 'created_at'];
        if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
        order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const sqlParams = [];
        let conditions = [];

        if (search) {
            conditions.push(`(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`);
            const likeParam = `%${search}%`;
            sqlParams.push(likeParam, likeParam, likeParam);
        }

        if (role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
            conditions.push(`u.role = ?`);
            sqlParams.push(role);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT 
                u.id, u.name, u.email, u.address, u.role, u.created_at,
                (
                    SELECT COALESCE(AVG(r.rating), 0)
                    FROM stores s
                    LEFT JOIN ratings r ON r.store_id = s.id
                    WHERE s.owner_id = u.id
                ) AS storeRating
            FROM users u
            ${whereClause}
            ORDER BY ${sortBy} ${order}
        `;

        const users = await query(sql, sqlParams);

        return NextResponse.json({
            success: true,
            data: users
        }, { status: 200 });

    } catch (error) {
        console.error('Admin GET users error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { name, email, password, address, role } = body;

        // Validation
        const errors = {};
        if (!validateName(name)) errors.name = 'Name must be between 20 and 60 characters.';
        if (!validateEmail(email)) errors.email = 'Invalid email format.';
        if (!validatePassword(password)) errors.password = 'Password must be 8-16 characters, include an uppercase letter and a special character.';
        if (!validateAddress(address)) errors.address = 'Address must be between 1 and 400 characters.';
        
        const validRoles = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
        if (!validRoles.includes(role)) errors.role = 'Invalid role.';

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        // Check email uniqueness
        const emailCheckSql = `SELECT id FROM users WHERE email = ?`;
        const emailResults = await query(emailCheckSql, [email]);
        if (emailResults.length > 0) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const hashedPassword = await hashPassword(password);

        const insertSql = `
            INSERT INTO users (id, name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await query(insertSql, [id, name, email, hashedPassword, address, role]);

        return NextResponse.json({
            success: true,
            data: { id, name, email, address, role }
        }, { status: 201 });

    } catch (error) {
        console.error('Admin POST user error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
