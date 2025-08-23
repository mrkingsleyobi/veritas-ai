"""
Content model for VeritasAI.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base
import json


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(String, nullable=False)  # image, video, audio
    file_size = Column(Integer, nullable=False)
    url = Column(String, nullable=True)
    status = Column(String, default="uploaded")  # uploaded, processing, completed, failed
    
    # AI Analysis Fields
    verification_score = Column(Float, nullable=True)
    deepfake_probability = Column(Float, nullable=True)
    verification_result = Column(Text, nullable=True)  # JSON stored as text
    deepfake_result = Column(Text, nullable=True)  # JSON stored as text
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to user
    user = relationship("User", back_populates="contents")
    
    # Helper methods for JSON fields
    def set_verification_result(self, result_dict):
        """Set verification result as JSON string."""
        self.verification_result = json.dumps(result_dict) if result_dict else None
    
    def get_verification_result(self):
        """Get verification result as dictionary."""
        if self.verification_result:
            try:
                return json.loads(self.verification_result)
            except json.JSONDecodeError:
                return None
        return None
    
    def set_deepfake_result(self, result_dict):
        """Set deepfake result as JSON string."""
        self.deepfake_result = json.dumps(result_dict) if result_dict else None
    
    def get_deepfake_result(self):
        """Get deepfake result as dictionary."""
        if self.deepfake_result:
            try:
                return json.loads(self.deepfake_result)
            except json.JSONDecodeError:
                return None
        return None


# Add relationship to User model
from src.models.user import User
User.contents = relationship("Content", back_populates="user", cascade="all, delete-orphan")