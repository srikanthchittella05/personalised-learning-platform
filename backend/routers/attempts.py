import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/attempts", tags=["Attempts"])


@router.post("", response_model=schemas.AttemptOut)
def submit_attempt(
    data: schemas.AttemptSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.questions
    if not questions:
        raise HTTPException(status_code=400, detail="Quiz has no questions")

    if len(data.answers) != len(questions):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(questions)} answers, got {len(data.answers)}",
        )

    correct = sum(
        1 for q, a in zip(questions, data.answers) if q.correct_answer == a
    )
    total = len(questions)
    score = round((correct / total) * 100, 2)

    attempt = models.QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        total_questions=total,
        correct_answers=correct,
        time_taken_s=data.time_taken_s,
        answers_json=json.dumps(data.answers),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("/my", response_model=list[schemas.AttemptOut])
def my_attempts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.QuizAttempt)
        .filter(models.QuizAttempt.user_id == current_user.id)
        .order_by(models.QuizAttempt.attempted_at.desc())
        .all()
    )
