'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { quizzesApi, topicsApi } from '@/lib/api';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function QuizBrowserPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<number | undefined>();
    const [selectedDiff, setSelectedDiff] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/'); return; }
        topicsApi.list().then(r => setTopics(r.data));
        fetchQuizzes();
    }, []);

    const fetchQuizzes = (topicId?: number, diff?: string) => {
        setLoading(true);
        quizzesApi.list(topicId, diff === 'All' ? undefined : diff)
            .then(r => setQuizzes(r.data))
            .finally(() => setLoading(false));
    };

    const handleTopicFilter = (id?: number) => {
        setSelectedTopic(id);
        fetchQuizzes(id, selectedDiff);
    };

    const handleDiffFilter = (d: string) => {
        setSelectedDiff(d);
        fetchQuizzes(selectedTopic, d);
    };

    const diffBadgeClass: Record<string, string> = {
        Beginner: 'badge-beginner',
        Intermediate: 'badge-intermediate',
        Advanced: 'badge-advanced',
    };

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content fade-in">
                <div className="page-header">
                    <span className="circle-accent"></span>
                    <h1 className="page-title">Quizzes</h1>
                    <p className="page-subtitle">Select a subject to test your knowledge</p>
                </div>

                {/* Topic filter */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <button
                        className="btn"
                        style={{
                            padding: '8px 16px', fontSize: 11,
                            background: !selectedTopic ? 'var(--text-primary)' : 'transparent',
                            color: !selectedTopic ? '#fff' : 'inherit',
                            borderColor: !selectedTopic ? 'var(--text-primary)' : 'var(--border-dark)',
                        }}
                        onClick={() => handleTopicFilter(undefined)}
                    >
                        All Topics
                    </button>
                    {topics.map((t: any) => (
                        <button
                            key={t.id}
                            className="btn"
                            style={{
                                padding: '8px 16px', fontSize: 11,
                                background: selectedTopic === t.id ? 'var(--text-primary)' : 'transparent',
                                color: selectedTopic === t.id ? '#fff' : 'inherit',
                                borderColor: selectedTopic === t.id ? 'var(--text-primary)' : 'var(--border-dark)',
                            }}
                            onClick={() => handleTopicFilter(t.id)}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>

                {/* Difficulty filter */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                    {DIFFICULTIES.map(d => (
                        <button
                            key={d}
                            className="btn"
                            style={{
                                padding: '8px 16px', fontSize: 11, borderStyle: 'dashed',
                                background: selectedDiff === d ? 'var(--border-dark)' : 'transparent',
                                color: selectedDiff === d ? 'var(--bg-primary)' : 'inherit',
                            }}
                            onClick={() => handleDiffFilter(d)}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center" style={{ padding: 80 }}>
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontStyle: 'italic', letterSpacing: '0.05em' }}>Retrieving archive...</p>
                    </div>
                ) : (
                    <div className="quiz-grid">
                        {quizzes.map((quiz: any) => (
                            <div
                                key={quiz.id}
                                className="quiz-card"
                                onClick={() => router.push(`/quiz/${quiz.id}`)}
                            >
                                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                                    <span className={`badge ${diffBadgeClass[quiz.difficulty_level] || 'badge-beginner'}`}>
                                        {quiz.difficulty_level}
                                    </span>
                                    <span className="badge" style={{ borderColor: 'var(--border-dark)' }}>
                                        {quiz.topic?.name || 'General'}
                                    </span>
                                </div>
                                <div className="quiz-card-title">{quiz.title}</div>
                                <div className="quiz-card-meta">
                                    <span style={{ color: 'var(--text-secondary)' }}>{quiz.question_count} Questions</span>
                                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>BEGIN ⟶</span>
                                </div>
                            </div>
                        ))}
                        {quizzes.length === 0 && (
                            <div className="card text-center" style={{ padding: 80, gridColumn: '1/-1', borderStyle: 'dashed' }}>
                                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontStyle: 'italic', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                                    No materials found matching this criteria.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
