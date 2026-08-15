'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const tokenRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    const clearClientAuth = () => {
        localStorage.removeItem('token');
        tokenRef.current = null;
        setToken(null);
        setUser(null);
    };

    const handleLogout = async () => {
        const activeToken = tokenRef.current || localStorage.getItem('token');
        if (activeToken) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${activeToken}` }
                });
            } catch (e) {
                console.warn('Logout API failed:', e.message);
            }
        }
        clearClientAuth();
        router.push('/login');
    };

    const verifySession = async (currentToken) => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                tokenRef.current = currentToken;
                setToken(currentToken);
                setUser(data.user);
            } else {
                clearClientAuth();
                router.push('/login');
            }
        } catch (error) {
            console.error('Session verification failed:', error);
            clearClientAuth();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            verifySession(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Listen for 401 events dispatched by the centralized API client (src/lib/api.js)
    useEffect(() => {
        const onUnauthorized = () => handleLogout();
        window.addEventListener('auth:logout', onUnauthorized);
        return () => window.removeEventListener('auth:logout', onUnauthorized);
    }, []);

    const login = async (credentials) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem('token', data.token);
                tokenRef.current = data.token;
                setToken(data.token);
                setUser(data.user);
                redirectUser(data.user.role);
                return { success: true };
            }
            return { success: false, message: data.message || 'Login failed', errors: data.errors };
        } catch (e) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem('token', data.token);
                tokenRef.current = data.token;
                setToken(data.token);
                setUser(data.user);
                redirectUser(data.user.role);
                return { success: true };
            }
            return { success: false, message: data.message || 'Registration failed', errors: data.errors };
        } catch (e) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const updatePassword = async (passwords) => {
        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenRef.current}`
                },
                body: JSON.stringify(passwords)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                await handleLogout();
                return { success: true };
            }
            return { success: false, message: data.message || 'Update failed', errors: data.errors };
        } catch (e) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const redirectUser = (role) => {
        if (role === 'SYSTEM_ADMIN') router.push('/admin/dashboard');
        else if (role === 'STORE_OWNER') router.push('/owner/dashboard');
        else router.push('/dashboard');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!user,
            login,
            register,
            logout: handleLogout,
            updatePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
