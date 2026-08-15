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
    // Delete any existing tokens for this user to enforce single-session rule
    await query(`DELETE FROM jwt_tokens WHERE user_id = ?`, [userId]);

    const sql = `
        INSERT INTO jwt_tokens (id, user_id, token, expires_at)
        VALUES (UUID(), ?, ?, ?)
    `;
    // decode token to find actual expiration in MS
    const decoded = jwt.decode(token);
    const expireDate = expiresAt || new Date(decoded.exp * 1000);
    
    await query(sql, [userId, token, expireDate]);
}

export async function deleteToken(identifier, byUserId = false) {
    if (byUserId) {
        await query(`DELETE FROM jwt_tokens WHERE user_id = ?`, [identifier]);
    } else {
        await query(`DELETE FROM jwt_tokens WHERE token = ?`, [identifier]);
    }
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
            SELECT * FROM jwt_tokens 
            WHERE token = ? AND user_id = ? AND expires_at > NOW() AND is_revoked = FALSE
        `;
        const results = await query(sql, [token, decoded.id]);
        
        if (results.length === 0) {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
}
