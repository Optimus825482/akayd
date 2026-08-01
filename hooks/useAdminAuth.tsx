import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export type AdminRole = 'admin' | 'editor' | 'viewer';

export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [role, setRole] = useState<AdminRole>('viewer');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetch(`${API_BASE}/admin/verify`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setRole(data.role || 'viewer');
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            }
        };
        verifyToken();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });
            if (response.ok) {
                const data = await response.json();
                setRole(data.role || 'viewer');
                setIsAuthenticated(true);
            } else {
                const data = await response.json();
                setError(data.error || 'Hatalı şifre');
            }
        } catch {
            setError('Sunucuya bağlanılamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/admin/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch { /* ignore */ }
        setIsAuthenticated(false);
        setRole('viewer');
        setPassword('');
    };

    const canWrite = role !== 'viewer';

    if (isAuthenticated === null) {
        return {
            isAuthenticated: false,
            isLoading: true,
            role: 'viewer' as AdminRole,
            canWrite: false,
            password, setPassword, error, loading,
            handleLogin, handleLogout
        };
    }

    return {
        isAuthenticated,
        isLoading: false,
        role,
        canWrite,
        password,
        setPassword,
        error,
        loading,
        handleLogin,
        handleLogout
    };
};
