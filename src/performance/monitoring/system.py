"""
System monitoring module for VeritasAI.
"""
import psutil
import time
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class SystemMonitor:
    """Monitor system resources and application performance."""
    
    def __init__(self):
        """Initialize the system monitor."""
        self.monitoring_data = []
        self.max_data_points = 1000  # Limit stored data points
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """
        Get current system metrics.
        
        Returns:
            Dictionary with system metrics
        """
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # Memory metrics
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Disk metrics
        disk = psutil.disk_usage('/')
        
        # Network metrics
        net_io = psutil.net_io_counters()
        
        return {
            'timestamp': time.time(),
            'cpu': {
                'percent': cpu_percent,
                'count': cpu_count,
                'frequency_mhz': cpu_freq.current if cpu_freq else 0
            },
            'memory': {
                'total_gb': round(memory.total / (1024**3), 2),
                'available_gb': round(memory.available / (1024**3), 2),
                'used_gb': round(memory.used / (1024**3), 2),
                'percent': memory.percent,
                'swap_percent': swap.percent if swap else 0
            },
            'disk': {
                'total_gb': round(disk.total / (1024**3), 2),
                'used_gb': round(disk.used / (1024**3), 2),
                'free_gb': round(disk.free / (1024**3), 2),
                'percent': disk.percent
            },
            'network': {
                'bytes_sent_mb': round(net_io.bytes_sent / (1024**2), 2),
                'bytes_recv_mb': round(net_io.bytes_recv / (1024**2), 2),
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv
            }
        }
    
    def get_process_metrics(self) -> Dict[str, Any]:
        """
        Get current process metrics.
        
        Returns:
            Dictionary with process metrics
        """
        current_process = psutil.Process()
        process_info = current_process.as_dict()
        
        return {
            'timestamp': time.time(),
            'pid': process_info['pid'],
            'name': process_info['name'],
            'status': process_info['status'],
            'cpu_percent': process_info['cpu_percent'],
            'memory_percent': process_info['memory_percent'],
            'memory_info': {
                'rss_mb': round(process_info['memory_info'].rss / (1024**2), 2),
                'vms_mb': round(process_info['memory_info'].vms / (1024**2), 2)
            },
            'num_threads': process_info['num_threads'],
            'open_files': len(process_info['open_files']) if process_info['open_files'] else 0,
            'connections': len(process_info['connections']) if process_info['connections'] else 0
        }
    
    def start_monitoring(self, interval: int = 5):
        """
        Start continuous system monitoring.
        
        Args:
            interval: Monitoring interval in seconds
        """
        logger.info(f"Starting system monitoring with {interval}s interval")
        
        while True:
            try:
                system_metrics = self.get_system_metrics()
                process_metrics = self.get_process_metrics()
                
                monitoring_point = {
                    'timestamp': time.time(),
                    'system': system_metrics,
                    'process': process_metrics
                }
                
                # Store monitoring data
                self.monitoring_data.append(monitoring_point)
                
                # Limit data points
                if len(self.monitoring_data) > self.max_data_points:
                    self.monitoring_data.pop(0)
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error during monitoring: {str(e)}")
                time.sleep(interval)
    
    def get_monitoring_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get monitoring history.
        
        Args:
            limit: Maximum number of data points to return
            
        Returns:
            List of monitoring data points
        """
        return self.monitoring_data[-limit:] if self.monitoring_data else []
    
    def get_performance_alerts(self) -> List[Dict[str, Any]]:
        """
        Get performance alerts based on current metrics.
        
        Returns:
            List of performance alerts
        """
        alerts = []
        current_metrics = self.get_system_metrics()
        
        # CPU usage alert
        if current_metrics['cpu']['percent'] > 80:
            alerts.append({
                'type': 'high_cpu',
                'severity': 'warning',
                'message': f'High CPU usage: {current_metrics["cpu"]["percent"]}%'
            })
        
        # Memory usage alert
        if current_metrics['memory']['percent'] > 85:
            alerts.append({
                'type': 'high_memory',
                'severity': 'warning',
                'message': f'High memory usage: {current_metrics["memory"]["percent"]}%'
            })
        
        # Disk usage alert
        if current_metrics['disk']['percent'] > 90:
            alerts.append({
                'type': 'high_disk',
                'severity': 'critical',
                'message': f'High disk usage: {current_metrics["disk"]["percent"]}%'
            })
        
        return alerts
    
    def get_resource_utilization_report(self) -> Dict[str, Any]:
        """
        Get a comprehensive resource utilization report.
        
        Returns:
            Dictionary with resource utilization report
        """
        if not self.monitoring_data:
            return {'error': 'No monitoring data available'}
        
        # Calculate averages from recent data (last 10 points)
        recent_data = self.monitoring_data[-10:] if len(self.monitoring_data) >= 10 else self.monitoring_data
        
        avg_cpu = sum(point['system']['cpu']['percent'] for point in recent_data) / len(recent_data)
        avg_memory = sum(point['system']['memory']['percent'] for point in recent_data) / len(recent_data)
        avg_disk = sum(point['system']['disk']['percent'] for point in recent_data) / len(recent_data)
        
        current_metrics = self.get_system_metrics()
        process_metrics = self.get_process_metrics()
        
        return {
            'timestamp': time.time(),
            'current_metrics': current_metrics,
            'process_metrics': process_metrics,
            'averages': {
                'cpu_percent': round(avg_cpu, 2),
                'memory_percent': round(avg_memory, 2),
                'disk_percent': round(avg_disk, 2)
            },
            'alerts': self.get_performance_alerts(),
            'data_points_count': len(self.monitoring_data)
        }


# Global instance
system_monitor = SystemMonitor()