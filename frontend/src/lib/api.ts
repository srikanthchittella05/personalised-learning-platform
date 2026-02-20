import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    signup: (name: string, email: string, password: string) =>
        api.post('/auth/signup', { name, email, password }),
    me: () => api.get('/auth/me'),
};

// Topics
export const topicsApi = {
    list: () => api.get('/topics'),
};

// Quizzes
export const quizzesApi = {
    list: (topicId?: number, difficulty?: string) =>
        api.get('/quizzes', { params: { topic_id: topicId, difficulty } }),
    get: (id: number) => api.get(`/quizzes/${id}`),
};

// Attempts
export const attemptsApi = {
    submit: (quizId: number, answers: number[], timeTakenS: number) =>
        api.post('/attempts', { quiz_id: quizId, answers, time_taken_s: timeTakenS }),
    my: () => api.get('/attempts/my'),
};

// Progress
export const progressApi = {
    get: (studentId: number) => api.get(`/progress/${studentId}`),
};

// Recommendations
export const recommendationsApi = {
    get: (studentId: number) => api.get(`/recommendations/${studentId}`),
    history: (studentId: number) => api.get(`/recommendations/history/${studentId}`),
};
