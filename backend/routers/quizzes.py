import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.get("", response_model=List[schemas.QuizOut])
def list_quizzes(
    topic_id: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Quiz)
    if topic_id:
        q = q.filter(models.Quiz.topic_id == topic_id)
    if difficulty:
        q = q.filter(models.Quiz.difficulty_level == difficulty)
    quizzes = q.all()

    result = []
    for quiz in quizzes:
        out = schemas.QuizOut(
            id=quiz.id,
            title=quiz.title,
            topic_id=quiz.topic_id,
            topic=quiz.topic,
            difficulty_level=quiz.difficulty_level,
            description=quiz.description,
            question_count=len(quiz.questions),
        )
        result.append(out)
    return result


@router.get("/{quiz_id}", response_model=schemas.QuizDetail)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions_out = []
    for q in quiz.questions:
        questions_out.append(
            schemas.QuestionOut(
                id=q.id,
                text=q.text,
                options=json.loads(q.options_json),
            )
        )

    return schemas.QuizDetail(
        id=quiz.id,
        title=quiz.title,
        topic_id=quiz.topic_id,
        topic=quiz.topic,
        difficulty_level=quiz.difficulty_level,
        description=quiz.description,
        question_count=len(quiz.questions),
        questions=questions_out,
    )


@router.post("", response_model=schemas.QuizOut)
def create_quiz(
    data: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    topic = db.query(models.Topic).filter(models.Topic.id == data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    quiz = models.Quiz(
        title=data.title,
        topic_id=data.topic_id,
        difficulty_level=data.difficulty_level,
        description=data.description,
    )
    db.add(quiz)
    db.flush()

    for q in data.questions:
        question = models.Question(
            quiz_id=quiz.id,
            text=q.text,
            options_json=json.dumps(q.options),
            correct_answer=q.correct_answer,
        )
        db.add(question)

    db.commit()
    db.refresh(quiz)

    return schemas.QuizOut(
        id=quiz.id,
        title=quiz.title,
        topic_id=quiz.topic_id,
        topic=quiz.topic,
        difficulty_level=quiz.difficulty_level,
        description=quiz.description,
        question_count=len(quiz.questions),
    )
