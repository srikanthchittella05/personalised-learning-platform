import json
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("QuizAttempt", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text, default="")
    category = Column(String(100), default="General")
    created_at = Column(DateTime, default=datetime.utcnow)

    quizzes = relationship("Quiz", back_populates="topic")
    recommendations = relationship("Recommendation", back_populates="topic")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    difficulty_level = Column(String(20), default="Beginner")  # Beginner/Intermediate/Advanced
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON array of 4 options
    correct_answer = Column(Integer, nullable=False)  # index 0-3

    quiz = relationship("Quiz", back_populates="questions")

    @property
    def options(self):
        return json.loads(self.options_json)

    @options.setter
    def options(self, value):
        self.options_json = json.dumps(value)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Float, nullable=False)          # 0-100 percentage
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    time_taken_s = Column(Integer, default=0)      # seconds
    answers_json = Column(Text, default="[]")      # user's answers per question
    attempted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attempts")
    quiz = relationship("Quiz", back_populates="attempts")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommended_topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    current_level = Column(String(30), nullable=False)   # Beginner/Intermediate/Advanced
    difficulty_adjustment = Column(String(20), nullable=False)  # Increase/Maintain/Decrease
    reasoning = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    topic = relationship("Topic", back_populates="recommendations")
