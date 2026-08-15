import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { getUsers, userEmailExists, createUser } from '@/services/admin.service.js';
import { hashPassword } from '@/lib/auth.js';
import { validateName, validateEmail, validatePassword, validateAddress } from '@/lib/validators.js';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const opts = {
            search: searchParams.get('search') || '',
            role:   searchParams.get('role')   || '',
            sortBy: searchParams.get('sortBy') || 'created_at',
            order:  searchParams.get('order')  || 'DESC',
        };

        const users = await getUsers(opts);

        return NextResponse.json({ success: true, data: users }, { status: 200 });

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

        const errors = {};
        if (!validateName(name))        errors.name     = 'Name must be between 1 and 60 characters.';
        if (!validateEmail(email))      errors.email    = 'Invalid email format.';
        if (!validatePassword(password)) errors.password = 'Password must be at least 6 characters.';
        if (!validateAddress(address))  errors.address  = 'Address must be between 1 and 400 characters.';

        const validRoles = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
        if (!validRoles.includes(role)) errors.role = 'Invalid role.';

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        if (await userEmailExists(email)) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
        }

        const id = uuidv4();
        const hashedPassword = await hashPassword(password);
        await createUser(id, name, email, hashedPassword, address, role);

        return NextResponse.json({ success: true, data: { id, name, email, address, role } }, { status: 201 });

    } catch (error) {
        console.error('Admin POST user error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
