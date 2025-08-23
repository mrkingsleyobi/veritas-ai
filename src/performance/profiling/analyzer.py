"""
Performance profiling and analysis module for VeritasAI.
"""
import time
import cProfile
import pstats
import io
import tracemalloc
from typing import Dict, Any, Callable, Optional
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class PerformanceProfiler:
    """Analyze and profile application performance."""
    
    def __init__(self):
        """Initialize the performance profiler."""
        self.profiles = {}
        self.memory_snapshots = {}
    
    def profile_function(self, profile_name: str):
        """
        Decorator for profiling function execution.
        
        Args:
            profile_name: Name for the profile
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Start profiling
                pr = cProfile.Profile()
                pr.enable()
                
                # Start memory tracing
                tracemalloc.start()
                snapshot_before = tracemalloc.take_snapshot()
                
                # Execute function
                start_time = time.time()
                result = func(*args, **kwargs)
                end_time = time.time()
                
                # Stop profiling
                pr.disable()
                
                # Stop memory tracing
                snapshot_after = tracemalloc.take_snapshot()
                tracemalloc.stop()
                
                # Calculate statistics
                execution_time = end_time - start_time
                
                # Store profile results
                s = io.StringIO()
                ps = pstats.Stats(pr, stream=s)
                ps.sort_stats('cumulative')
                ps.print_stats(10)  # Top 10 functions
                
                # Calculate memory usage
                top_stats = snapshot_after.compare_to(snapshot_before, 'lineno')
                total_memory = sum(stat.size_diff for stat in top_stats)
                
                self.profiles[profile_name] = {
                    'execution_time': execution_time,
                    'profile_output': s.getvalue(),
                    'memory_usage_bytes': total_memory,
                    'timestamp': time.time()
                }
                
                # Log performance info
                logger.info(f"Function {func.__name__} executed in {execution_time:.4f} seconds")
                logger.info(f"Memory usage: {total_memory / 1024 / 1024:.2f} MB")
                
                return result
            return wrapper
        return decorator
    
    def start_memory_profiling(self, snapshot_name: str):
        """
        Start memory profiling.
        
        Args:
            snapshot_name: Name for the memory snapshot
        """
        tracemalloc.start()
        self.memory_snapshots[snapshot_name] = {
            'start_time': time.time()
        }
    
    def stop_memory_profiling(self, snapshot_name: str) -> Dict[str, Any]:
        """
        Stop memory profiling and return statistics.
        
        Args:
            snapshot_name: Name of the memory snapshot
            
        Returns:
            Dictionary with memory profiling statistics
        """
        if snapshot_name not in self.memory_snapshots:
            return {}
        
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        
        # Calculate total memory usage
        total_memory = sum(stat.size for stat in top_stats)
        
        # Get top memory consumers
        top_consumers = []
        for stat in top_stats[:10]:  # Top 10
            top_consumers.append({
                'filename': stat.traceback.format()[0],
                'size_mb': stat.size / 1024 / 1024,
                'count': stat.count
            })
        
        profiling_result = {
            'total_memory_mb': total_memory / 1024 / 1024,
            'top_memory_consumers': top_consumers,
            'duration': time.time() - self.memory_snapshots[snapshot_name]['start_time']
        }
        
        self.memory_snapshots[snapshot_name].update(profiling_result)
        return profiling_result
    
    def get_performance_profile(self, profile_name: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific performance profile.
        
        Args:
            profile_name: Name of the profile to retrieve
            
        Returns:
            Dictionary with profile data or None if not found
        """
        return self.profiles.get(profile_name)
    
    def get_all_profiles(self) -> Dict[str, Any]:
        """
        Get all performance profiles.
        
        Returns:
            Dictionary with all profile data
        """
        return self.profiles
    
    def clear_profiles(self):
        """Clear all stored profiles."""
        self.profiles.clear()
    
    def benchmark_function(self, func: Callable, *args, iterations: int = 100, **kwargs) -> Dict[str, Any]:
        """
        Benchmark a function by running it multiple times.
        
        Args:
            func: Function to benchmark
            args: Positional arguments for the function
            iterations: Number of iterations to run
            kwargs: Keyword arguments for the function
            
        Returns:
            Dictionary with benchmark results
        """
        execution_times = []
        
        for i in range(iterations):
            start_time = time.perf_counter()
            try:
                func(*args, **kwargs)
                end_time = time.perf_counter()
                execution_times.append(end_time - start_time)
            except Exception as e:
                logger.error(f"Benchmark iteration {i} failed: {str(e)}")
        
        if not execution_times:
            return {'error': 'All benchmark iterations failed'}
        
        # Calculate statistics
        avg_time = sum(execution_times) / len(execution_times)
        min_time = min(execution_times)
        max_time = max(execution_times)
        
        # Calculate percentiles
        sorted_times = sorted(execution_times)
        p50 = sorted_times[len(sorted_times) // 2]
        p90 = sorted_times[int(len(sorted_times) * 0.9)]
        p95 = sorted_times[int(len(sorted_times) * 0.95)]
        p99 = sorted_times[int(len(sorted_times) * 0.99)]
        
        return {
            'iterations': iterations,
            'successful_iterations': len(execution_times),
            'average_time': avg_time,
            'min_time': min_time,
            'max_time': max_time,
            'median_time': p50,
            'p90_time': p90,
            'p95_time': p95,
            'p99_time': p99,
            'total_time': sum(execution_times),
            'throughput_per_second': iterations / sum(execution_times) if sum(execution_times) > 0 else 0
        }


# Global instance
performance_profiler = PerformanceProfiler()