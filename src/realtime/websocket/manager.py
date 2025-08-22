"""
WebSocket Manager for VeritasAI.
"""
import json
import logging
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
import asyncio

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time communication."""
    
    def __init__(self):
        """Initialize the connection manager."""
        # Store active connections by user ID
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Store user subscriptions
        self.user_subscriptions: Dict[int, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept a WebSocket connection.
        
        Args:
            websocket: WebSocket connection
            user_id: ID of the user connecting
        """
        await websocket.accept()
        
        # Add connection to active connections
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        logger.info(f"WebSocket connection established for user {user_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Handle WebSocket disconnection.
        
        Args:
            websocket: WebSocket connection
            user_id: ID of the user disconnecting
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        # Remove subscriptions
        if user_id in self.user_subscriptions:
            del self.user_subscriptions[user_id]
        
        logger.info(f"WebSocket connection closed for user {user_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: int):
        """Send a message to a specific user.
        
        Args:
            message: Message to send
            user_id: ID of the user to send to
        """
        if user_id in self.active_connections:
            # Convert message to JSON string
            if isinstance(message, dict):
                message_str = json.dumps(message)
            else:
                message_str = str(message)
            
            # Send to all connections for this user
            disconnected_connections = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_str)
                except WebSocketDisconnect:
                    disconnected_connections.add(connection)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {str(e)}")
                    disconnected_connections.add(connection)
            
            # Remove disconnected connections
            if disconnected_connections:
                self.active_connections[user_id] -= disconnected_connections
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected users.
        
        Args:
            message: Message to broadcast
        """
        # Convert message to JSON string
        if isinstance(message, dict):
            message_str = json.dumps(message)
        else:
            message_str = str(message)
        
        # Send to all connections
        all_connections = set()
        for user_connections in self.active_connections.values():
            all_connections.update(user_connections)
        
        disconnected_connections = set()
        for connection in all_connections:
            try:
                await connection.send_text(message_str)
            except WebSocketDisconnect:
                disconnected_connections.add(connection)
            except Exception as e:
                logger.error(f"Error broadcasting message: {str(e)}")
                disconnected_connections.add(connection)
        
        # Remove disconnected connections
        if disconnected_connections:
            for user_id, user_connections in self.active_connections.items():
                user_connections -= disconnected_connections
                if not user_connections:
                    # Clean up empty user entries
                    users_to_remove = [uid for uid, conns in self.active_connections.items() if not conns]
                    for uid in users_to_remove:
                        del self.active_connections[uid]
    
    def subscribe_user(self, user_id: int, subscription: str):
        """Subscribe a user to a specific topic.
        
        Args:
            user_id: ID of the user
            subscription: Topic to subscribe to
        """
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
        self.user_subscriptions[user_id].add(subscription)
        logger.info(f"User {user_id} subscribed to {subscription}")
    
    def unsubscribe_user(self, user_id: int, subscription: str):
        """Unsubscribe a user from a specific topic.
        
        Args:
            user_id: ID of the user
            subscription: Topic to unsubscribe from
        """
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(subscription)
            if not self.user_subscriptions[user_id]:
                del self.user_subscriptions[user_id]
        logger.info(f"User {user_id} unsubscribed from {subscription}")
    
    async def send_to_subscribers(self, message: Dict[str, Any], subscription: str):
        """Send a message to all subscribers of a topic.
        
        Args:
            message: Message to send
            subscription: Topic to send to
        """
        # Find users subscribed to this topic
        target_users = [
            user_id for user_id, subscriptions in self.user_subscriptions.items()
            if subscription in subscriptions
        ]
        
        # Send message to each subscribed user
        for user_id in target_users:
            await self.send_personal_message(message, user_id)


# Global instance
manager = ConnectionManager()


class WebSocketManager:
    """High-level WebSocket manager with built-in message handling."""
    
    def __init__(self):
        """Initialize the WebSocket manager."""
        self.connection_manager = manager
        self.message_handlers: Dict[str, callable] = {}
        
    def register_handler(self, message_type: str, handler: callable):
        """Register a message handler for a specific message type.
        
        Args:
            message_type: Type of message to handle
            handler: Function to handle the message
        """
        self.message_handlers[message_type] = handler
        logger.info(f"Registered handler for message type: {message_type}")
    
    async def handle_message(self, message: Dict[str, Any], user_id: int):
        """Handle an incoming WebSocket message.
        
        Args:
            message: Incoming message
            user_id: ID of the user who sent the message
        """
        try:
            message_type = message.get("type")
            if message_type in self.message_handlers:
                handler = self.message_handlers[message_type]
                await handler(message, user_id)
            else:
                logger.warning(f"No handler registered for message type: {message_type}")
                await self.send_error(f"Unknown message type: {message_type}", user_id)
        except Exception as e:
            logger.error(f"Error handling message for user {user_id}: {str(e)}")
            await self.send_error(f"Error processing message: {str(e)}", user_id)
    
    async def send_message(self, message: Dict[str, Any], user_id: int):
        """Send a message to a specific user.
        
        Args:
            message: Message to send
            user_id: ID of the user to send to
        """
        await self.connection_manager.send_personal_message(message, user_id)
    
    async def broadcast_message(self, message: Dict[str, Any]):
        """Broadcast a message to all connected users.
        
        Args:
            message: Message to broadcast
        """
        await self.connection_manager.broadcast(message)
    
    async def send_to_subscribers(self, message: Dict[str, Any], subscription: str):
        """Send a message to all subscribers of a topic.
        
        Args:
            message: Message to send
            subscription: Topic to send to
        """
        await self.connection_manager.send_to_subscribers(message, subscription)
    
    async def send_success(self, data: Any, user_id: int, action: Optional[str] = None):
        """Send a success message to a user.
        
        Args:
            data: Data to send
            user_id: ID of the user to send to
            action: Optional action identifier
        """
        message = {
            "type": "success",
            "data": data,
            "timestamp": asyncio.get_event_loop().time()
        }
        if action:
            message["action"] = action
        await self.send_message(message, user_id)
    
    async def send_error(self, error: str, user_id: int, action: Optional[str] = None):
        """Send an error message to a user.
        
        Args:
            error: Error message
            user_id: ID of the user to send to
            action: Optional action identifier
        """
        message = {
            "type": "error",
            "error": error,
            "timestamp": asyncio.get_event_loop().time()
        }
        if action:
            message["action"] = action
        await self.send_message(message, user_id)
    
    async def send_update(self, update_type: str, data: Any, user_id: int):
        """Send an update message to a user.
        
        Args:
            update_type: Type of update
            data: Update data
            user_id: ID of the user to send to
        """
        message = {
            "type": "update",
            "update_type": update_type,
            "data": data,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.send_message(message, user_id)


# Global instance
websocket_manager = WebSocketManager()