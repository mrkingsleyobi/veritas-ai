"""
Redis client setup for VeritasAI.
"""
import redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

# Redis client (lazy initialization)
_redis_client = None


def get_redis():
    """Dependency to get Redis client (lazy initialization)."""
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True
        )
    return _redis_client


def ping_redis():
    """Check if Redis is accessible."""
    try:
        redis_client = get_redis()
        return redis_client.ping()
    except Exception as e:
        print(f"Redis connection error: {e}")
        return False


def set_cache(key: str, value: str, expire: int = 3600):
    """Set a value in Redis cache with expiration time (default 1 hour)."""
    try:
        redis_client = get_redis()
        return redis_client.setex(key, expire, value)
    except Exception as e:
        print(f"Error setting cache: {e}")
        return False


def get_cache(key: str):
    """Get a value from Redis cache."""
    try:
        redis_client = get_redis()
        return redis_client.get(key)
    except Exception as e:
        print(f"Error getting cache: {e}")
        return None


def delete_cache(key: str):
    """Delete a value from Redis cache."""
    try:
        redis_client = get_redis()
        return redis_client.delete(key)
    except Exception as e:
        print(f"Error deleting cache: {e}")
        return 0