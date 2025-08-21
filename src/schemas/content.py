"""
Content schemas for VeritasAI.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContentBase(BaseModel):
    filename: str
    content_type: str
    file_size: int


class ContentCreate(ContentBase):
    pass


class ContentCreateUrl(BaseModel):
    url: str


class Content(ContentBase):
    id: int
    user_id: int
    file_path: str
    status: str
    authenticity_score: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


class ContentResponse(Content):
    pass