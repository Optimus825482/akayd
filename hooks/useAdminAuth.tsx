import { useState, useEffect } from 'react';

const ADMIN_TOKEN_KEY = 'admin_token';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem(ADMIN_TOKEN_KEY);
    });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Token doğrulama: sunucu restart sonrası geçersiz token'ları temizle
    useEffect(() => {
        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        if (!token) return;

        const verifyToken = async () => {
            try {
                const response = await fetch(`${API_BASE}/admin/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    localStorage.removeItem(ADMIN_TOKEN_KEY);
                    setIsAuthenticated(false);
                }
            } catch {
                // Sunucuya ulaşılamazsa oturumu koru (offline durumu)
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
                body: JSON.stringify({ password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
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
        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        if (token) {
            try {
                await fetch(`${API_BASE}/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch { /* ignore */ }
        }
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setIsAuthenticated(false);
        setPassword('');
    };

    return {
        isAuthenticated,
        password,
        setPassword,
        error,
        loading,
        handleLogin,
        handleLogout
    };
};
