from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from ml.clustering import get_student_level
import models
import schemas

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/{student_id}", response_model=schemas.ProgressOut)
def get_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    attempts = (
        db.query(models.QuizAttempt)
        .filter(models.QuizAttempt.user_id == student_id)
        .order_by(models.QuizAttempt.attempted_at.desc())
        .all()
    )

    total_attempts = len(attempts)
    avg_score = sum(a.score for a in attempts) / total_attempts if total_attempts > 0 else 0
    avg_time = sum(a.time_taken_s for a in attempts) / total_attempts if total_attempts > 0 else 60

    current_level = get_student_level(avg_score, total_attempts, avg_time)

    # Per-topic aggregation
    topic_data: dict[int, dict] = {}
    for attempt in attempts:
        tid = attempt.quiz.topic_id
        tname = attempt.quiz.topic.name
        if tid not in topic_data:
            topic_data[tid] = {"topic_id": tid, "topic_name": tname, "scores": [], "attempts": 0}
        topic_data[tid]["scores"].append(attempt.score)
        topic_data[tid]["attempts"] += 1

    topic_progress = [
        schemas.TopicProgress(
            topic_id=v["topic_id"],
            topic_name=v["topic_name"],
            avg_score=round(sum(v["scores"]) / len(v["scores"]), 2),
            attempts=v["attempts"],
        )
        for v in topic_data.values()
    ]

    recent_attempts = attempts[:10]

    return schemas.ProgressOut(
        student_id=student_id,
        total_attempts=total_attempts,
        avg_score=round(avg_score, 2),
        current_level=current_level,
        topic_progress=topic_progress,
        recent_attempts=recent_attempts,
    )
