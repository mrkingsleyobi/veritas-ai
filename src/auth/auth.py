"""
Authentication handlers for VeritasAI.
"""
from fastapi import Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.user import User
from src.auth.security import decode_access_token
from typing import Optional
import json


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_user(db: Session, email: str):
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user with email and password."""
    user = get_user(db, email)
    if not user:
        return False
    if not user.check_password(password):
        return False
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get the current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_user_from_websocket(websocket: WebSocket, db: Session):
    """Get the current user from a WebSocket connection."""
    try:
        # Wait for the authentication message
        data = await websocket.receive_text()
        message = json.loads(data)
        
        if message.get("type") == "auth":
            token = message.get("token")
            if token:
                token_data = decode_access_token(token)
                if token_data:
                    user = get_user(db, email=token_data.email)
                    if user and user.is_active:
                        return user
        return None
    except Exception:
        return None