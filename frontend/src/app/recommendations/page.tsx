'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { recommendationsApi } from '@/lib/api';

export default function RecommendationsPage() {
    const router = useRouter();
    const [rec, setRec] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { router.push('/'); return; }
        const user = JSON.parse(userStr);

        Promise.all([
            recommendationsApi.get(user.id),
            recommendationsApi.history(user.id),
        ])
            .then(([recRes, histRes]) => {
                setRec(recRes.data);
                setHistory(histRes.data);
            })
            .catch(() => setError('Failed to fetch recommendations.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="app-shell"><Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontStyle: 'italic', letterSpacing: '0.05em' }}>Consulting the oracle...</p>
            </main>
        </div>
    );

    return (
        <div className="app-shell"><Sidebar />
            <main className="main-content fade-in">
                <div className="page-header">
                    <span className="circle-accent"></span>
                    <h1 className="page-title">Recommendations</h1>
                    <p className="page-subtitle">Personalised insights formulated by AI analysis</p>
                </div>

                {error && <div className="auth-error" style={{ marginBottom: 40 }}>{error}</div>}

                {rec && (
                    <div className="card-solid" style={{ marginBottom: 60, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--accent)', borderRadius: '50%', opacity: 0.1, zIndex: 0 }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', gap: 24, marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
                                <div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                        Evaluated Level
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-primary)' }}>
                                        {rec.current_level}
                                    </div>
                                </div>
                                <div style={{ paddingLeft: 24, borderLeft: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                        Difficulty Vector
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {rec.difficulty_adjustment}
                                        {rec.difficulty_adjustment === 'Increase' ? '↑' : rec.difficulty_adjustment === 'Decrease' ? '↓' : '→'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 12, fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Next Objective
                            </div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1.1, marginBottom: 32, color: 'var(--text-primary)' }}>
                                {rec.recommended_topic}
                            </div>

                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 40, paddingLeft: 20, borderLeft: '2px solid var(--accent)' }}>
                                "{rec.reasoning}"
                            </div>

                            {/* Output matching expected schema */}
                            <div style={{ background: '#F0EEDF', border: '1px solid var(--border-dark)', padding: 24, fontFamily: 'monospace', fontSize: 12, color: '#555', marginBottom: 40 }}>
                                <div style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11, fontWeight: 600 }}>Raw Output Schema</div>
                                <pre style={{ margin: 0 }}>{JSON.stringify({
                                    student_id: `U${rec.student_id}`,
                                    current_level: rec.current_level,
                                    recommended_topic: rec.recommended_topic,
                                    difficulty_adjustment: rec.difficulty_adjustment,
                                }, null, 2)}</pre>
                            </div>

                            <div style={{ display: 'flex', gap: 16 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => router.push('/quiz')}
                                >
                                    Embark
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => window.location.reload()}
                                >
                                    Recalculate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* History */}
                {history.length > 0 && (
                    <div>
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13, marginBottom: 24, borderBottom: '1px solid var(--border-dark)', paddingBottom: 12, color: 'var(--text-secondary)' }}>
                            Historical Mandates
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                            {history.map((h: any, i: number) => (
                                <div
                                    key={h.id}
                                    className="card"
                                    style={{ padding: 24 }}
                                >
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 12 }}>
                                        {new Date(h.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 16, lineHeight: 1.2 }}>
                                        {h.recommended_topic}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                        <span>Lvl: {h.current_level}</span>
                                        <span>Adj: {h.difficulty_adjustment}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
