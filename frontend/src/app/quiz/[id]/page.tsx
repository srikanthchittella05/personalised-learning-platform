'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { quizzesApi, attemptsApi } from '@/lib/api';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizAttemptPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const [quiz, setQuiz] = useState<any>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const startTime = useRef(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/'); return; }
        quizzesApi.get(Number(id))
            .then(r => {
                setQuiz(r.data);
                setAnswers(new Array(r.data.questions.length).fill(-1));
                const timeLimit = r.data.questions.length * 60; // 60s per question
                setTimeLeft(timeLimit);
                startTime.current = Date.now();
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!quiz || submitted) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [quiz, submitted]);

    const handleAnswer = (questionIdx: number, optionIdx: number) => {
        if (submitted) return;
        setAnswers(prev => {
            const next = [...prev];
            next[questionIdx] = optionIdx;
            return next;
        });
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (submitting) return;
        setSubmitting(true);
        clearInterval(timerRef.current!);
        const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
        const finalAnswers = answers.map(a => a === -1 ? 0 : a);
        try {
            const res = await attemptsApi.submit(Number(id), finalAnswers, timeTaken);
            setResult(res.data);
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return (
        <div className="app-shell"><Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontStyle: 'italic', letterSpacing: '0.05em' }}>Preparing materials...</p>
            </main>
        </div>
    );

    if (!quiz) return (
        <div className="app-shell"><Sidebar />
            <main className="main-content"><div className="auth-error">Evaluation not found.</div></main>
        </div>
    );

    // ── Result View
    if (submitted && result) {
        const pct = Math.round(result.score);
        return (
            <div className="app-shell"><Sidebar />
                <main className="main-content fade-in">
                    <div className="card-solid" style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center', position: 'relative' }}>
                        <span className="circle-accent" style={{ top: -40, left: -40, zIndex: 0 }}></span>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 20 }}>
                                Evaluation Complete
                            </div>
                            <h2 style={{ fontSize: 32, fontFamily: 'var(--font-serif)', marginBottom: 40, lineHeight: 1.2 }}>{quiz.title}</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 48 }}>
                                <div style={{ fontSize: 80, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {pct}<span style={{ fontSize: 40 }}>%</span>
                                </div>
                                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>
                                    Final Score
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 48, padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontFamily: 'var(--font-serif)', color: 'var(--success)' }}>{result.correct_answers}</div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Correct</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontFamily: 'var(--font-serif)', color: 'var(--danger)' }}>{result.total_questions - result.correct_answers}</div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Incorrect</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontFamily: 'var(--font-serif)', color: 'var(--accent)' }}>{result.time_taken_s}s</div>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Time</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>Dashboard</button>
                                <button className="btn btn-accent" onClick={() => router.push('/recommendations')}>AI Recommendation</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const answered = answers.filter(a => a !== -1).length;
    const progressPct = (answered / quiz.questions.length) * 100;

    return (
        <div className="app-shell"><Sidebar />
            <main className="main-content fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, paddingBottom: 20, borderBottom: '1px solid var(--border-dark)' }}>
                    <div>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            {quiz.topic?.name || 'General'}
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32 }}>{quiz.title}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 4 }}>
                            Time Remaining
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Progress Tracker (Minimalist Line) */}
                <div style={{ position: 'relative', height: 2, background: 'var(--border)', marginBottom: 60 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--text-primary)', width: `${progressPct}%`, transition: 'width 0.4s ease' }} />
                    <div style={{ position: 'absolute', right: 0, top: -20, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                        {answered} / {quiz.questions.length}
                    </div>
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
                    {quiz.questions.map((q: any, qi: number) => (
                        <div key={q.id}>
                            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1 }}>{qi + 1}.</div>
                                <div style={{ fontSize: 20, fontFamily: 'var(--font-serif)', lineHeight: 1.4, color: 'var(--text-primary)', paddingTop: 4 }}>
                                    {q.text}
                                </div>
                            </div>
                            <div className="options-grid" style={{ marginLeft: 52 }}>
                                {q.options.map((opt: string, oi: number) => (
                                    <button
                                        key={oi}
                                        className={`option-btn ${answers[qi] === oi ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(qi, oi)}
                                    >
                                        <span className="option-letter">{OPTION_LETTERS[oi]}</span>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => router.back()} style={{ border: 'none' }}>Abandon</button>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : `Submit Evaluation`}
                    </button>
                </div>
            </main>
        </div>
    );
}
