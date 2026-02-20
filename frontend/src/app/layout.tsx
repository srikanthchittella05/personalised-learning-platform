import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'LearnAI – Personalised Learning Platform',
    description: 'Adaptive learning powered by AI. Track your progress, attempt quizzes, and receive personalised recommendations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
