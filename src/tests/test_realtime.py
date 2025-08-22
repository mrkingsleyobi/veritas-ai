"""
Tests for real-time processing components.
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import json
from datetime import datetime

from src.realtime.websocket.manager import ConnectionManager, WebSocketManager
from src.realtime.streaming.processor import StreamingProcessor


@pytest.fixture
def connection_manager():
    """Create a connection manager for testing."""
    return ConnectionManager()


@pytest.fixture
def websocket_manager():
    """Create a WebSocket manager for testing."""
    return WebSocketManager()


@pytest.fixture
def streaming_processor():
    """Create a streaming processor for testing."""
    return StreamingProcessor()


def test_connection_manager_initialization(connection_manager):
    """Test that the connection manager initializes correctly."""
    assert connection_manager.active_connections == {}
    assert connection_manager.user_subscriptions == {}


def test_websocket_manager_initialization(websocket_manager):
    """Test that the WebSocket manager initializes correctly."""
    assert websocket_manager.connection_manager is not None
    assert websocket_manager.message_handlers == {}


def test_streaming_processor_initialization(streaming_processor):
    """Test that the streaming processor initializes correctly."""
    assert streaming_processor.processors == {}
    assert streaming_processor.active_streams == {}


@pytest.mark.asyncio
async def test_connection_manager_connect_disconnect(connection_manager):
    """Test connecting and disconnecting WebSocket connections."""
    # Mock WebSocket with async methods
    mock_websocket = AsyncMock()
    mock_websocket.accept = AsyncMock()
    mock_websocket.send_text = AsyncMock()
    
    # Connect user
    await connection_manager.connect(mock_websocket, 1)
    assert 1 in connection_manager.active_connections
    assert mock_websocket in connection_manager.active_connections[1]
    
    # Disconnect user
    connection_manager.disconnect(mock_websocket, 1)
    assert 1 not in connection_manager.active_connections


def test_websocket_manager_register_handler(websocket_manager):
    """Test registering message handlers."""
    def test_handler(message, user_id):
        pass
    
    websocket_manager.register_handler("test_type", test_handler)
    assert "test_type" in websocket_manager.message_handlers
    assert websocket_manager.message_handlers["test_type"] == test_handler


def test_streaming_processor_register_processor(streaming_processor):
    """Test registering stream processors."""
    def test_processor(chunk_data, stream_id):
        return {"result": "processed"}
    
    streaming_processor.register_processor("test_content", test_processor)
    assert "test_content" in streaming_processor.processors
    assert streaming_processor.processors["test_content"] == test_processor


@pytest.mark.asyncio
async def test_streaming_processor_start_stop_stream(streaming_processor):
    """Test starting and stopping stream processing."""
    # Mock the websocket_manager
    with patch('src.realtime.streaming.processor.websocket_manager') as mock_ws_manager:
        mock_ws_manager.send_update = AsyncMock()
        mock_ws_manager.send_error = AsyncMock()
        
        async def test_processor(chunk_data, stream_id):
            return {"result": "processed"}
        
        streaming_processor.register_processor("test_content", test_processor)
        
        # Start stream
        success = await streaming_processor.start_stream_processing(
            "test_stream_1", "test_content", {"initial": "data"}, 1
        )
        assert success is True
        assert "test_stream_1" in streaming_processor.active_streams
        assert streaming_processor.active_streams["test_stream_1"]["status"] == "active"
        
        # Stop stream
        success = await streaming_processor.stop_stream_processing("test_stream_1")
        assert success is True
        assert "test_stream_1" not in streaming_processor.active_streams


@pytest.mark.asyncio
async def test_streaming_processor_process_chunk(streaming_processor):
    """Test processing stream chunks."""
    # Mock the websocket_manager
    with patch('src.realtime.streaming.processor.websocket_manager') as mock_ws_manager:
        mock_ws_manager.send_update = AsyncMock()
        mock_ws_manager.send_error = AsyncMock()
        
        async def test_processor(chunk_data, stream_id):
            return {"result": "processed", "chunk_id": chunk_data.get("chunk_id")}
        
        streaming_processor.register_processor("test_content", test_processor)
        
        # Start stream
        await streaming_processor.start_stream_processing(
            "test_stream_1", "test_content", {"initial": "data"}, 1
        )
        
        # Process chunk
        chunk_data = {"chunk_id": "chunk_1", "data": "test data"}
        success = await streaming_processor.process_stream_chunk("test_stream_1", chunk_data)
        assert success is True
        assert streaming_processor.active_streams["test_stream_1"]["processed_chunks"] == 1


@pytest.mark.asyncio
async def test_streaming_processor_get_stream_status(streaming_processor):
    """Test getting stream status."""
    # Mock the websocket_manager
    with patch('src.realtime.streaming.processor.websocket_manager') as mock_ws_manager:
        mock_ws_manager.send_update = AsyncMock()
        mock_ws_manager.send_error = AsyncMock()
        
        async def test_processor(chunk_data, stream_id):
            return {"result": "processed"}
        
        streaming_processor.register_processor("test_content", test_processor)
        
        # Start stream
        await streaming_processor.start_stream_processing(
            "test_stream_1", "test_content", {"initial": "data"}, 1
        )
        
        # Get status
        status = streaming_processor.get_stream_status("test_stream_1")
        assert status is not None
        assert status["content_type"] == "test_content"
        assert status["status"] == "active"
        
        # Get status for non-existent stream
        status = streaming_processor.get_stream_status("non_existent_stream")
        assert status is None