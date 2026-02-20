'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Sidebar from '@/components/Sidebar';
import { progressApi } from '@/lib/api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement
);

const LEVEL_COLORS: Record<string, string> = {
    Beginner: '#2E7D32',
    Intermediate: '#ED6C02',
    Advanced: '#111111',
};

export default function DashboardPage() {
    const router = useRouter();
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { router.push('/'); return; }
        const user = JSON.parse(userStr);

        progressApi.get(user.id)
            .then(r => setProgress(r.data))
            .catch(() => setError('Failed to load progress. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontStyle: 'italic', letterSpacing: '0.05em' }}>Loading...</p>
            </main>
        </div>
    );

    if (error) return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="auth-error">{error}</div>
            </main>
        </div>
    );

    // Chart data — recent attempts over time
    const recentReversed = [...(progress?.recent_attempts || [])].reverse();
    const lineData = {
        labels: recentReversed.map((a: any, i: number) => `Quiz ${i + 1}`),
        datasets: [{
            label: 'Score (%)',
            data: recentReversed.map((a: any) => a.score),
            borderColor: '#111111',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0,
            pointBackgroundColor: '#F16035',
            pointBorderColor: '#111',
            pointRadius: 6,
            pointHoverRadius: 8,
        }],
    };

    const barData = {
        labels: progress?.topic_progress?.map((t: any) => t.topic_name) || [],
        datasets: [{
            label: 'Avg Score (%)',
            data: progress?.topic_progress?.map((t: any) => t.avg_score) || [],
            backgroundColor: progress?.topic_progress?.map((t: any) =>
                t.avg_score >= 70 ? '#111111' : t.avg_score >= 40 ? '#888888' : '#F16035'
            ),
            borderRadius: 0,
            borderWidth: 1,
            borderColor: '#111',
        }],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#111', titleColor: '#fff', bodyColor: '#fff', titleFont: { family: 'Inter' }, padding: 12, cornerRadius: 0 },
        },
        scales: {
            x: { ticks: { color: '#555', font: { family: 'Inter', size: 11 } }, grid: { display: false, color: '#E5E0D8' } },
            y: { min: 0, max: 100, ticks: { color: '#555', font: { family: 'Inter', size: 11 } }, grid: { color: '#E5E0D8' } },
        },
    };

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content fade-in">
                <div className="page-header">
                    <span className="circle-accent"></span>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Metrics and insights into your learning trajectory.</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-value">{progress?.avg_score?.toFixed(0) ?? '—'}<span style={{ fontSize: 24, paddingLeft: 4 }}>%</span></div>
                        <div className="stat-card-label">Average Score</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value">{progress?.total_attempts ?? 0}</div>
                        <div className="stat-card-label">Total Attempts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value">{progress?.topic_progress?.length ?? 0}</div>
                        <div className="stat-card-label">Topics Explored</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ fontSize: 32, paddingBottom: 16 }}>
                            {progress?.current_level || '—'}
                        </div>
                        <div className="stat-card-label">AI Assessed Level</div>
                    </div>
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
                    <div className="card-solid">
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13, marginBottom: 24, pb: 12, borderBottom: '1px solid var(--border-dark)', color: 'var(--text-secondary)' }}>
                            Score Trajectory
                        </h3>
                        {recentReversed.length > 0
                            ? <Line data={lineData} options={chartOptions} />
                            : <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', paddingTop: 40, textAlign: 'center' }}>No data collected yet.</p>
                        }
                    </div>
                    <div className="card-solid">
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13, marginBottom: 24, pb: 12, borderBottom: '1px solid var(--border-dark)', color: 'var(--text-secondary)' }}>
                            Topic Mastery
                        </h3>
                        {barData.labels.length > 0
                            ? <Bar data={barData} options={chartOptions} />
                            : <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', paddingTop: 40, textAlign: 'center' }}>No data collected yet.</p>
                        }
                    </div>
                </div>

                {/* Recent Attempts Table */}
                <div className="card-solid">
                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13, marginBottom: 24, pb: 12, borderBottom: '1px solid var(--border-dark)', color: 'var(--text-secondary)' }}>
                        Recent Evaluations
                    </h3>
                    {progress?.recent_attempts?.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-dark)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '12px 16px' }}>Identifier</th>
                                    <th style={{ padding: '12px 16px' }}>Date</th>
                                    <th style={{ padding: '12px 16px' }}>Accuracy</th>
                                    <th style={{ padding: '12px 16px' }}>Time Allocation</th>
                                    <th style={{ padding: '12px 16px' }}>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {progress.recent_attempts.map((a: any) => (
                                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                                        <td style={{ padding: '16px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Eval_#{a.quiz_id}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(a.attempted_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px' }}>{a.correct_answers} / {a.total_questions}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{a.time_taken_s}s</td>
                                        <td style={{ padding: '16px', fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                                            <span style={{ color: a.score >= 70 ? 'var(--success)' : a.score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                                {a.score.toFixed(0)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', paddingTop: 40, textAlign: 'center' }}>
                            No evaluations found. <a onClick={() => router.push('/quiz')} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-primary)' }}>Begin now.</a>
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
