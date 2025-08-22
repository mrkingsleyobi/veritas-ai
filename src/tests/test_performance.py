"""
Tests for performance optimization modules.
"""
import pytest
from unittest.mock import patch, MagicMock
import json
import time

from src.performance.caching.optimizer import CachingOptimizer
from src.performance.optimization.db_optimizer import DatabaseOptimizer
from src.performance.profiling.analyzer import PerformanceProfiler
from src.performance.monitoring.system import SystemMonitor


@pytest.fixture
def caching_optimizer():
    """Create a caching optimizer for testing."""
    return CachingOptimizer()


@pytest.fixture
def db_optimizer():
    """Create a database optimizer for testing."""
    return DatabaseOptimizer()


@pytest.fixture
def performance_profiler():
    """Create a performance profiler for testing."""
    return PerformanceProfiler()


@pytest.fixture
def system_monitor():
    """Create a system monitor for testing."""
    return SystemMonitor()


def test_caching_optimizer_initialization(caching_optimizer):
    """Test that the caching optimizer initializes correctly."""
    assert caching_optimizer is not None
    assert caching_optimizer.cache_stats['hits'] == 0
    assert caching_optimizer.cache_stats['misses'] == 0
    assert caching_optimizer.cache_prefix == "perf_opt"


def test_caching_optimizer_cached_result(caching_optimizer):
    """Test the cached result decorator."""
    # Mock cache functions
    with patch('src.performance.caching.optimizer.get_cache') as mock_get_cache, \
         patch('src.performance.caching.optimizer.set_cache') as mock_set_cache:
        
        # First call - cache miss
        mock_get_cache.return_value = None
        
        @caching_optimizer.cached_result("test_key", expire=300)
        def test_function(x, y):
            return x + y
        
        result = test_function(2, 3)
        assert result == 5
        assert caching_optimizer.cache_stats['misses'] == 1
        assert caching_optimizer.cache_stats['sets'] == 1
        
        # Second call - cache hit
        mock_get_cache.return_value = json.dumps(5)
        result = test_function(2, 3)
        assert result == 5
        assert caching_optimizer.cache_stats['hits'] == 1


def test_caching_optimizer_batch_operations(caching_optimizer):
    """Test batch cache operations."""
    # Test batch get
    with patch('src.performance.caching.optimizer.get_cache') as mock_get_cache:
        mock_get_cache.return_value = json.dumps("test_value")
        results = caching_optimizer.batch_cache_get(["key1", "key2"])
        assert len(results) == 2
        assert "key1" in results
        assert "key2" in results
    
    # Test batch set
    with patch('src.performance.caching.optimizer.set_cache') as mock_set_cache:
        items = {"key1": "value1", "key2": "value2"}
        success = caching_optimizer.batch_cache_set(items, expire=300)
        assert success is True
        assert caching_optimizer.cache_stats['sets'] == 2


def test_caching_optimizer_statistics(caching_optimizer):
    """Test cache statistics functionality."""
    # Set some stats
    caching_optimizer.cache_stats['hits'] = 10
    caching_optimizer.cache_stats['misses'] = 5
    caching_optimizer.cache_stats['sets'] = 15
    
    # Get statistics
    stats = caching_optimizer.get_cache_statistics()
    assert stats['hits'] == 10
    assert stats['misses'] == 5
    assert stats['sets'] == 15
    assert stats['total_requests'] == 15
    assert stats['hit_rate'] == 66.67
    
    # Clear statistics
    caching_optimizer.clear_cache_statistics()
    assert caching_optimizer.cache_stats['hits'] == 0
    assert caching_optimizer.cache_stats['misses'] == 0


def test_database_optimizer_initialization(db_optimizer):
    """Test that the database optimizer initializes correctly."""
    assert db_optimizer is not None
    assert db_optimizer.query_stats == {}
    assert db_optimizer.slow_query_threshold == 1.0


def test_database_optimizer_optimize_content_queries(db_optimizer):
    """Test database query optimization."""
    # Mock database session
    mock_db = MagicMock()
    
    # Test optimization
    result = db_optimizer.optimize_content_queries(mock_db, 1)
    assert result['user_id'] == 1
    assert 'optimizations_applied' in result
    assert 'performance_improvements' in result
    assert 'query_analytics' in result


def test_database_optimizer_profiling(db_optimizer):
    """Test database query profiling."""
    # Test profiling decorator
    @db_optimizer.profile_query("test_query")
    def mock_query():
        time.sleep(0.01)  # Small delay
        return "result"
    
    result = mock_query()
    assert result == "result"
    assert db_optimizer.query_stats["test_query"] == 1


def test_performance_profiler_initialization(performance_profiler):
    """Test that the performance profiler initializes correctly."""
    assert performance_profiler is not None
    assert performance_profiler.profiles == {}
    assert performance_profiler.memory_snapshots == {}


def test_performance_profiler_function_profiling(performance_profiler):
    """Test function profiling."""
    # Test profiling decorator
    @performance_profiler.profile_function("test_profile")
    def mock_function():
        time.sleep(0.01)  # Small delay
        return "result"
    
    result = mock_function()
    assert result == "result"
    
    # Check profile was created
    profile = performance_profiler.get_performance_profile("test_profile")
    assert profile is not None
    assert 'execution_time' in profile
    assert 'profile_output' in profile
    assert 'memory_usage_bytes' in profile


def test_performance_profiler_benchmarking(performance_profiler):
    """Test function benchmarking."""
    def mock_function(x, y):
        return x + y
    
    # Benchmark the function
    results = performance_profiler.benchmark_function(mock_function, 2, 3, iterations=10)
    assert results['iterations'] == 10
    assert results['successful_iterations'] == 10
    assert 'average_time' in results
    assert 'min_time' in results
    assert 'max_time' in results
    assert results['throughput_per_second'] > 0


def test_system_monitor_initialization(system_monitor):
    """Test that the system monitor initializes correctly."""
    assert system_monitor is not None
    assert system_monitor.monitoring_data == []
    assert system_monitor.max_data_points == 1000


def test_system_monitor_metrics(system_monitor):
    """Test system metrics collection."""
    # Mock psutil functions
    with patch('psutil.cpu_percent') as mock_cpu, \
         patch('psutil.virtual_memory') as mock_memory, \
         patch('psutil.disk_usage') as mock_disk:
        
        mock_cpu.return_value = 25.0
        mock_memory.return_value = MagicMock(total=8*1024**3, available=4*1024**3, used=4*1024**3, percent=50.0)
        mock_disk.return_value = MagicMock(total=500*1024**3, used=200*1024**3, free=300*1024**3, percent=40.0)
        
        metrics = system_monitor.get_system_metrics()
        assert 'timestamp' in metrics
        assert 'cpu' in metrics
        assert 'memory' in metrics
        assert 'disk' in metrics
        assert metrics['cpu']['percent'] == 25.0
        assert metrics['memory']['percent'] == 50.0
        assert metrics['disk']['percent'] == 40.0


def test_system_monitor_alerts(system_monitor):
    """Test performance alerts."""
    # Mock system metrics with high usage
    with patch.object(system_monitor, 'get_system_metrics') as mock_metrics:
        mock_metrics.return_value = {
            'cpu': {'percent': 85.0},
            'memory': {'percent': 90.0},
            'disk': {'percent': 95.0}
        }
        
        alerts = system_monitor.get_performance_alerts()
        assert len(alerts) == 3
        assert any(alert['type'] == 'high_cpu' for alert in alerts)
        assert any(alert['type'] == 'high_memory' for alert in alerts)
        assert any(alert['type'] == 'high_disk' for alert in alerts)