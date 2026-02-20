from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("", response_model=List[schemas.TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return db.query(models.Topic).all()


@router.get("/{topic_id}", response_model=schemas.TopicOut)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


@router.post("", response_model=schemas.TopicOut)
def create_topic(
    data: schemas.TopicCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    topic = models.Topic(**data.model_dump())
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic
