"""
Content model for VeritasAI.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(String, nullable=False)  # image, video, audio
    file_size = Column(Integer, nullable=False)
    status = Column(String, default="uploaded")  # uploaded, processing, completed, failed
    authenticity_score = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to user
    user = relationship("User", back_populates="contents")


# Add relationship to User model
from src.models.user import User
User.contents = relationship("Content", back_populates="user", cascade="all, delete-orphan")