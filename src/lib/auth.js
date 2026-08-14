import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

export function generateToken(user) {
    const secret = process.env.JWT_SECRET;
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
    };
    return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

export async function storeToken(userId, token, expiresAt) {
    const sql = `
        INSERT INTO jwt_tokens (id, user_id, token, expires_at)
        VALUES (UUID(), ?, ?, ?)
    `;
    // decode token to find actual expiration in MS
    const decoded = jwt.decode(token);
    const expireDate = expiresAt || new Date(decoded.exp * 1000);
    
    await query(sql, [userId, token, expireDate]);
}

export async function revokeToken(token) {
    const sql = `
        UPDATE jwt_tokens SET is_revoked = TRUE WHERE token = ?
    `;
    await query(sql, [token]);
}

export async function verifyAuthToken(request) {
    try {
        let token = null;
        
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        if (!token) return null;

        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        // Check if token exists and is not revoked in the db
        const sql = `
            SELECT is_revoked FROM jwt_tokens WHERE token = ?
        `;
        const results = await query(sql, [token]);
        
        if (results.length === 0 || results[0].is_revoked) {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
}
