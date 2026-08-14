import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '@/lib/middleware.js';
import { query } from '@/lib/db.js';
import { validateEmail, validateAddress } from '@/lib/validators.js';

export async function GET(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        let sortBy = searchParams.get('sortBy') || 'created_at';
        let order = searchParams.get('order') || 'DESC';

        const allowedSortBy = ['name', 'email', 'address', 'rating', 'created_at'];
        if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
        order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const sqlParams = [];
        let whereClause = '';

        if (search) {
            whereClause = `WHERE s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?`;
            const likeParam = `%${search}%`;
            sqlParams.push(likeParam, likeParam, likeParam);
        }

        const sql = `
            SELECT 
                s.id, s.name, s.email, s.address, s.created_at,
                u.name AS ownerName,
                COALESCE(AVG(r.rating), 0) AS overallRating
            FROM stores s
            LEFT JOIN users u ON s.owner_id = u.id
            LEFT JOIN ratings r ON r.store_id = s.id
            ${whereClause}
            GROUP BY s.id, u.name
            ORDER BY ${sortBy === 'rating' ? 'overallRating' : 's.' + sortBy} ${order}
        `;

        const stores = await query(sql, sqlParams);

        return NextResponse.json({
            success: true,
            data: stores
        }, { status: 200 });

    } catch (error) {
        console.error('Admin GET stores error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const { name, email, address, ownerId } = body;

        const errors = {};
        if (typeof name !== 'string' || name.trim().length === 0) errors.name = 'Store name is required';
        if (!validateEmail(email)) errors.email = 'Invalid email format';
        if (!validateAddress(address)) errors.address = 'Address must be between 1 and 400 characters';

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        // Verify owner if provided
        if (ownerId) {
            const ownerSql = `SELECT id, role FROM users WHERE id = ?`;
            const owners = await query(ownerSql, [ownerId]);
            if (owners.length === 0) {
                return NextResponse.json({ success: false, message: 'Owner not found' }, { status: 404 });
            }
            if (owners[0].role !== 'STORE_OWNER') {
                return NextResponse.json({ success: false, message: 'Assigned user must be a STORE_OWNER' }, { status: 400 });
            }
        }

        // Check email uniqueness
        const emailCheckSql = `SELECT id FROM stores WHERE email = ?`;
        const emailResults = await query(emailCheckSql, [email]);
        if (emailResults.length > 0) {
            return NextResponse.json({ success: false, message: 'Store email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const insertSql = `
            INSERT INTO stores (id, name, email, address, owner_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        await query(insertSql, [id, name, email, address, ownerId || null]);

        return NextResponse.json({
            success: true,
            data: { id, name, email, address, ownerId }
        }, { status: 201 });

    } catch (error) {
        console.error('Admin POST store error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
