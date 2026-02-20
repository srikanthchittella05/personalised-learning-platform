from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Topics ────────────────────────────────────────────────────────────
class TopicCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "General"


class TopicOut(BaseModel):
    id: int
    name: str
    description: str
    category: str

    class Config:
        from_attributes = True


# ── Questions ─────────────────────────────────────────────────────────
class QuestionCreate(BaseModel):
    text: str
    options: List[str] = Field(..., min_length=2)
    correct_answer: int  # index 0-based


class QuestionOut(BaseModel):
    id: int
    text: str
    options: List[str]
    # correct_answer intentionally omitted when serving quiz

    class Config:
        from_attributes = True


class QuestionWithAnswer(QuestionOut):
    correct_answer: int


# ── Quizzes ───────────────────────────────────────────────────────────
class QuizCreate(BaseModel):
    title: str
    topic_id: int
    difficulty_level: str = "Beginner"
    description: str = ""
    questions: List[QuestionCreate] = []


class QuizOut(BaseModel):
    id: int
    title: str
    topic_id: int
    topic: Optional[TopicOut] = None
    difficulty_level: str
    description: str
    question_count: int = 0

    class Config:
        from_attributes = True


class QuizDetail(QuizOut):
    questions: List[QuestionOut] = []


# ── Attempts ──────────────────────────────────────────────────────────
class AttemptSubmit(BaseModel):
    quiz_id: int
    answers: List[int]          # user's chosen option index per question
    time_taken_s: int = 0


class AttemptOut(BaseModel):
    id: int
    quiz_id: int
    score: float
    total_questions: int
    correct_answers: int
    time_taken_s: int
    attempted_at: datetime

    class Config:
        from_attributes = True


# ── Progress ──────────────────────────────────────────────────────────
class TopicProgress(BaseModel):
    topic_id: int
    topic_name: str
    avg_score: float
    attempts: int


class ProgressOut(BaseModel):
    student_id: int
    total_attempts: int
    avg_score: float
    current_level: str
    topic_progress: List[TopicProgress]
    recent_attempts: List[AttemptOut]


# ── Recommendations ───────────────────────────────────────────────────
class RecommendationOut(BaseModel):
    student_id: int
    current_level: str
    recommended_topic: str
    recommended_topic_id: int
    difficulty_adjustment: str
    reasoning: str
    created_at: datetime

    class Config:
        from_attributes = True
