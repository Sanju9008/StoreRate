'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            verifySession(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const verifySession = async (currentToken) => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                setUser(data.user);
            } else {
                handleLogout(); // Auto logout on 401
            }
        } catch (error) {
            console.error('Session verification failed', error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            redirectUser(data.user.role);
            return { success: true };
        }
        return { success: false, message: data.message || 'Login failed', errors: data.errors };
    };

    const register = async (userData) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            redirectUser(data.user.role);
            return { success: true };
        }
        return { success: false, message: data.message || 'Registration failed', errors: data.errors };
    };

    const handleLogout = async () => {
        if (token) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                // Ignore errors during logout API call
            }
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        if (pathname !== '/login' && pathname !== '/register') {
            router.push('/login');
        }
    };

    const updatePassword = async (passwords) => {
        const res = await fetch('/api/auth/update-password', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passwords)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
            await handleLogout();
            return { success: true };
        }
        return { success: false, message: data.message || 'Update failed', errors: data.errors };
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
