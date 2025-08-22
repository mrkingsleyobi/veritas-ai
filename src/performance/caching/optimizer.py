"""
Caching optimization module for VeritasAI.
"""
from typing import Dict, Any, Optional, List
import json
import time
from functools import wraps
from src.cache.redis_client import get_cache, set_cache, delete_cache


class CachingOptimizer:
    """Optimize caching strategies for better performance."""
    
    def __init__(self):
        """Initialize the caching optimizer."""
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
        self.cache_prefix = "perf_opt"
    
    def cached_result(self, cache_key: str, expire: int = 300):
        """
        Decorator for caching function results.
        
        Args:
            cache_key: Base key for caching
            expire: Cache expiration time in seconds
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate full cache key
                full_key = f"{self.cache_prefix}:{cache_key}"
                if args:
                    full_key += f":{hash(str(args))}"
                if kwargs:
                    full_key += f":{hash(str(sorted(kwargs.items())))}"
                
                # Try to get from cache
                cached_result = get_cache(full_key)
                if cached_result:
                    self.cache_stats['hits'] += 1
                    return json.loads(cached_result)
                
                # Cache miss - execute function
                self.cache_stats['misses'] += 1
                result = func(*args, **kwargs)
                
                # Cache the result
                set_cache(full_key, json.dumps(result), expire=expire)
                self.cache_stats['sets'] += 1
                
                return result
            return wrapper
        return decorator
    
    def batch_cache_get(self, keys: List[str]) -> Dict[str, Any]:
        """
        Get multiple cache entries in a single operation.
        
        Args:
            keys: List of cache keys to retrieve
            
        Returns:
            Dictionary with key-value pairs
        """
        results = {}
        for key in keys:
            cached_value = get_cache(key)
            if cached_value:
                try:
                    results[key] = json.loads(cached_value)
                except json.JSONDecodeError:
                    results[key] = cached_value
        return results
    
    def batch_cache_set(self, items: Dict[str, Any], expire: int = 300) -> bool:
        """
        Set multiple cache entries in a single operation.
        
        Args:
            items: Dictionary with key-value pairs to cache
            expire: Cache expiration time in seconds
            
        Returns:
            True if all items were cached successfully
        """
        success = True
        for key, value in items.items():
            try:
                serialized_value = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
                set_cache(key, serialized_value, expire=expire)
                self.cache_stats['sets'] += 1
            except Exception:
                success = False
        return success
    
    def get_cache_statistics(self) -> Dict[str, Any]:
        """
        Get caching performance statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'hits': self.cache_stats['hits'],
            'misses': self.cache_stats['misses'],
            'sets': self.cache_stats['sets'],
            'deletes': self.cache_stats['deletes'],
            'total_requests': total_requests,
            'hit_rate': round(hit_rate, 2),
            'generated_at': time.time()
        }
    
    def clear_cache_statistics(self) -> None:
        """Reset cache statistics."""
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
    
    def optimize_cache_ttl(self, key_pattern: str, new_expire: int) -> int:
        """
        Optimize cache TTL for keys matching a pattern.
        
        Args:
            key_pattern: Pattern to match cache keys
            new_expire: New expiration time in seconds
            
        Returns:
            Number of keys updated
        """
        # This is a simplified implementation
        # In a real system, you might scan Redis keys or use a more sophisticated approach
        return 0
    
    def get_memory_usage_estimate(self) -> Dict[str, Any]:
        """
        Estimate cache memory usage.
        
        Returns:
            Dictionary with memory usage estimates
        """
        # This is a simplified implementation
        # In a real system, you might query Redis INFO or use other monitoring tools
        return {
            'estimated_entries': self.cache_stats['sets'] - self.cache_stats['deletes'],
            'estimated_memory_mb': round((self.cache_stats['sets'] * 0.5) / 1024, 2),  # Rough estimate
            'generated_at': time.time()
        }


# Global instance
caching_optimizer = CachingOptimizer()