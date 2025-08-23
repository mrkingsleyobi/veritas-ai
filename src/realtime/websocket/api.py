"""
WebSocket API endpoints for VeritasAI.
"""
from fastapi import APIRouter, WebSocket, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
import logging

from src.database import get_db
from src.models.user import User
from src.auth.auth import get_current_user_from_websocket
from src.realtime.websocket.manager import websocket_manager, manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ws", tags=["websocket"])


@router.websocket("/notifications")
async def websocket_notifications(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time notifications."""
    try:
        # Authenticate user
        user = await get_current_user_from_websocket(websocket, db)
        if not user:
            await websocket.close(code=4000, reason="Authentication required")
            return
        
        # Accept connection
        await manager.connect(websocket, user.id)
        
        # Subscribe to user notifications
        manager.subscribe_user(user.id, f"user_{user.id}_notifications")
        
        # Send welcome message
        await websocket_manager.send_success(
            {"message": "Connected to VeritasAI real-time notifications"},
            user.id
        )
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await websocket_manager.handle_message(message, user.id)
            except json.JSONDecodeError:
                await websocket_manager.send_error("Invalid JSON format", user.id)
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {str(e)}")
                await websocket_manager.send_error(f"Error processing message: {str(e)}", user.id)
                
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        manager.disconnect(websocket, user.id)


@router.websocket("/analysis/{content_id}")
async def websocket_analysis(websocket: WebSocket, content_id: int, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time content analysis updates."""
    try:
        # Authenticate user
        user = await get_current_user_from_websocket(websocket, db)
        if not user:
            await websocket.close(code=4000, reason="Authentication required")
            return
        
        # Accept connection
        await manager.connect(websocket, user.id)
        
        # Subscribe to content analysis updates
        manager.subscribe_user(user.id, f"content_{content_id}_analysis")
        
        # Send welcome message
        await websocket_manager.send_success(
            {"message": f"Connected to real-time analysis for content {content_id}"},
            user.id
        )
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await websocket_manager.handle_message(message, user.id)
            except json.JSONDecodeError:
                await websocket_manager.send_error("Invalid JSON format", user.id)
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {str(e)}")
                await websocket_manager.send_error(f"Error processing message: {str(e)}", user.id)
                
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        manager.disconnect(websocket, user.id)


@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time dashboard updates."""
    try:
        # Authenticate user
        user = await get_current_user_from_websocket(websocket, db)
        if not user:
            await websocket.close(code=4000, reason="Authentication required")
            return
        
        # Accept connection
        await manager.connect(websocket, user.id)
        
        # Subscribe to dashboard updates
        manager.subscribe_user(user.id, "dashboard_updates")
        
        # Send welcome message
        await websocket_manager.send_success(
            {"message": "Connected to real-time dashboard updates"},
            user.id
        )
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await websocket_manager.handle_message(message, user.id)
            except json.JSONDecodeError:
                await websocket_manager.send_error("Invalid JSON format", user.id)
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {str(e)}")
                await websocket_manager.send_error(f"Error processing message: {str(e)}", user.id)
                
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        manager.disconnect(websocket, user.id)


# Message handlers
async def handle_subscribe_message(message: dict, user_id: int):
    """Handle subscription messages."""
    subscription = message.get("subscription")
    if subscription:
        manager.subscribe_user(user_id, subscription)
        await websocket_manager.send_success(
            {"message": f"Subscribed to {subscription}"},
            user_id,
            "subscribe"
        )
    else:
        await websocket_manager.send_error("Missing subscription parameter", user_id, "subscribe")


async def handle_unsubscribe_message(message: dict, user_id: int):
    """Handle unsubscription messages."""
    subscription = message.get("subscription")
    if subscription:
        manager.unsubscribe_user(user_id, subscription)
        await websocket_manager.send_success(
            {"message": f"Unsubscribed from {subscription}"},
            user_id,
            "unsubscribe"
        )
    else:
        await websocket_manager.send_error("Missing subscription parameter", user_id, "unsubscribe")


# Register message handlers
websocket_manager.register_handler("subscribe", handle_subscribe_message)
websocket_manager.register_handler("unsubscribe", handle_unsubscribe_message)