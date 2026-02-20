'use client';
import { useRouter, usePathname } from 'next/navigation';

const NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/quiz', label: 'Quizzes' },
    { href: '/recommendations', label: 'AI Recommends' },
];

export default function Sidebar() {
    const router = useRouter();
    const path = usePathname();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const getUser = () => {
        if (typeof window === 'undefined') return null;
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    };

    const user = getUser();

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-text" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
                    LEARN<span>AI</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV.map(item => (
                    <button
                        key={item.href}
                        className={`nav-item ${path === item.href ? 'active' : ''}`}
                        onClick={() => router.push(item.href)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                {user && (
                    <div style={{ paddingBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.name}</div>
                        <div style={{ fontSize: 11, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>{user.email}</div>
                    </div>
                )}
                <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}>
                    Logout
                </button>
            </div>
        </div>
    );
}
