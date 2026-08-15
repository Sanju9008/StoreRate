import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware.js';
import { getAdminStores, storeEmailExists, ownerHasStore, createStore } from '@/services/admin.service.js';
import { validateEmail, validateAddress } from '@/lib/validators.js';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
    try {
        const { errorResponse } = await authorize(request, ['SYSTEM_ADMIN']);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const opts = {
            search: searchParams.get('search') || '',
            sortBy: searchParams.get('sortBy') || 'created_at',
            order:  searchParams.get('order')  || 'DESC',
        };

        const stores = await getAdminStores(opts);

        return NextResponse.json({ success: true, data: stores }, { status: 200 });

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
        const { name, email, address, ownerName, ownerId } = body;

        const errors = {};
        if (typeof name !== 'string' || name.trim().length === 0) errors.name = 'Store name is required';
        if (!validateEmail(email))   errors.email   = 'Invalid email format';
        if (!validateAddress(address)) errors.address = 'Address must be between 1 and 400 characters';

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        if (await storeEmailExists(email)) {
            return NextResponse.json({ success: false, message: 'Store email already registered' }, { status: 409 });
        }

        if (ownerId && await ownerHasStore(ownerId)) {
            return NextResponse.json({ success: false, message: 'This owner already has a store assigned. One owner can only manage one store.' }, { status: 409 });
        }

        const id = uuidv4();
        await createStore(id, name, email, address, ownerName, ownerId);

        return NextResponse.json({ success: true, data: { id, name, email, address, ownerName, ownerId } }, { status: 201 });

    } catch (error) {
        console.error('Admin POST store error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
