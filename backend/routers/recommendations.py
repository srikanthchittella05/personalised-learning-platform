from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from ml.recommender import generate_recommendation
import models
import schemas

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/{student_id}", response_model=schemas.RecommendationOut)
def get_recommendation(
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
        .all()
    )

    # Aggregate by topic
    topic_data: dict = {}
    for attempt in attempts:
        tid = attempt.quiz.topic_id
        tname = attempt.quiz.topic.name
        if tid not in topic_data:
            topic_data[tid] = {"topic_id": tid, "topic_name": tname, "scores": [], "attempt_count": 0}
        topic_data[tid]["scores"].append(attempt.score)
        topic_data[tid]["attempt_count"] += 1

    attempts_summary = [
        {
            "topic_id": v["topic_id"],
            "topic_name": v["topic_name"],
            "avg_score": sum(v["scores"]) / len(v["scores"]),
            "attempt_count": v["attempt_count"],
        }
        for v in topic_data.values()
    ]

    all_topics_raw = db.query(models.Topic).all()
    all_topics = [{"id": t.id, "name": t.name} for t in all_topics_raw]

    rec = generate_recommendation(student_id, attempts_summary, all_topics)

    # Persist recommendation
    rec_row = models.Recommendation(
        user_id=student_id,
        recommended_topic_id=rec["recommended_topic_id"],
        current_level=rec["current_level"],
        difficulty_adjustment=rec["difficulty_adjustment"],
        reasoning=rec["reasoning"],
    )
    db.add(rec_row)
    db.commit()
    db.refresh(rec_row)

    return schemas.RecommendationOut(
        student_id=student_id,
        current_level=rec["current_level"],
        recommended_topic=rec["recommended_topic"],
        recommended_topic_id=rec["recommended_topic_id"],
        difficulty_adjustment=rec["difficulty_adjustment"],
        reasoning=rec["reasoning"],
        created_at=rec_row.created_at,
    )


@router.get("/history/{student_id}")
def get_recommendation_history(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    history = (
        db.query(models.Recommendation)
        .filter(models.Recommendation.user_id == student_id)
        .order_by(models.Recommendation.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": r.id,
            "current_level": r.current_level,
            "recommended_topic": r.topic.name,
            "difficulty_adjustment": r.difficulty_adjustment,
            "reasoning": r.reasoning,
            "created_at": r.created_at,
        }
        for r in history
    ]
