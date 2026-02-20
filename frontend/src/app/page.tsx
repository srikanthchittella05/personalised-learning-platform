'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let res;
            if (isSignup) {
                res = await authApi.signup(name, email, password);
            } else {
                res = await authApi.login(email, password);
            }
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = () => {
        setEmail('demo@learn.ai');
        setPassword('demo1234');
        setIsSignup(false);
    };

    return (
        <div className="auth-bg">
            <div className="auth-form-wrapper fade-in">
                <h1 className="auth-title">
                    Elevate Your <br />
                    <span style={{ fontStyle: 'italic', paddingLeft: '1em' }}>Learning</span>
                </h1>
                <div className="auth-subtitle">
                    {isSignup ? 'Create an account to begin' : 'Welcome back to your journey'}
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {isSignup && (
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '16px 40px' }}>
                        {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '40px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {isSignup ? 'Already have an account?' : 'New to LearnAI?'}
                    <button
                        onClick={() => { setIsSignup(!isSignup); setError(''); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', marginLeft: '1ch', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                    >
                        {isSignup ? 'Sign in' : 'Create an account'}
                    </button>
                </div>

                {!isSignup && (
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={fillDemo}
                            className="btn btn-accent"
                            style={{ fontSize: '11px', padding: '8px 20px' }}
                        >
                            Use Demo Account
                        </button>
                    </div>
                )}
            </div>
            <div className="auth-split-img fade-in" style={{ animationDelay: '0.2s' }}></div>
        </div>
    );
}
