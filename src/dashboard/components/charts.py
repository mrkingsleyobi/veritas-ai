"""
Chart components for VeritasAI dashboard.
"""
from typing import Dict, List, Any, Union
import json
from datetime import datetime


class ChartGenerator:
    """Generate chart data for dashboard visualizations."""
    
    @staticmethod
    def generate_time_series_chart(
        data: List[Dict[str, Any]], 
        x_field: str, 
        y_fields: List[str],
        chart_title: str = "",
        chart_type: str = "line"
    ) -> Dict[str, Any]:
        """
        Generate time series chart data.
        
        Args:
            data: List of data points
            x_field: Field name for x-axis (time)
            y_fields: List of field names for y-axis values
            chart_title: Title for the chart
            chart_type: Type of chart (line, bar, area)
            
        Returns:
            Dictionary with chart configuration and data
        """
        # Prepare datasets
        datasets = []
        for i, y_field in enumerate(y_fields):
            dataset = {
                "label": y_field.replace("_", " ").title(),
                "data": [point.get(y_field, 0) for point in data],
                "borderColor": ChartGenerator._get_color(i),
                "backgroundColor": ChartGenerator._get_color(i, 0.1),
                "fill": chart_type == "area"
            }
            datasets.append(dataset)
        
        # Prepare labels (x-axis)
        labels = [point.get(x_field) for point in data]
        
        return {
            "type": chart_type,
            "data": {
                "labels": labels,
                "datasets": datasets
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "plugins": {
                    "title": {
                        "display": bool(chart_title),
                        "text": chart_title
                    },
                    "legend": {
                        "display": True
                    }
                },
                "scales": {
                    "x": {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": x_field.replace("_", " ").title()
                        }
                    },
                    "y": {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": "Values"
                        }
                    }
                }
            }
        }
    
    @staticmethod
    def generate_pie_chart(
        data: Dict[str, Union[int, float]],
        chart_title: str = ""
    ) -> Dict[str, Any]:
        """
        Generate pie chart data.
        
        Args:
            data: Dictionary with labels and values
            chart_title: Title for the chart
            
        Returns:
            Dictionary with chart configuration and data
        """
        labels = list(data.keys())
        values = list(data.values())
        colors = [ChartGenerator._get_color(i) for i in range(len(labels))]
        
        return {
            "type": "pie",
            "data": {
                "labels": labels,
                "datasets": [{
                    "data": values,
                    "backgroundColor": colors,
                    "borderColor": "#fff",
                    "borderWidth": 2
                }]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "plugins": {
                    "title": {
                        "display": bool(chart_title),
                        "text": chart_title
                    },
                    "legend": {
                        "display": True,
                        "position": "right"
                    }
                }
            }
        }
    
    @staticmethod
    def generate_bar_chart(
        data: List[Dict[str, Any]],
        x_field: str,
        y_fields: List[str],
        chart_title: str = "",
        horizontal: bool = False
    ) -> Dict[str, Any]:
        """
        Generate bar chart data.
        
        Args:
            data: List of data points
            x_field: Field name for x-axis labels
            y_fields: List of field names for y-axis values
            chart_title: Title for the chart
            horizontal: Whether to create horizontal bar chart
            
        Returns:
            Dictionary with chart configuration and data
        """
        # Prepare datasets
        datasets = []
        for i, y_field in enumerate(y_fields):
            dataset = {
                "label": y_field.replace("_", " ").title(),
                "data": [point.get(y_field, 0) for point in data],
                "backgroundColor": ChartGenerator._get_color(i, 0.7),
                "borderColor": ChartGenerator._get_color(i),
                "borderWidth": 1
            }
            datasets.append(dataset)
        
        # Prepare labels (x-axis)
        labels = [point.get(x_field) for point in data]
        
        return {
            "type": "bar" if not horizontal else "horizontalBar",
            "data": {
                "labels": labels,
                "datasets": datasets
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "indexAxis": "y" if horizontal else "x",
                "plugins": {
                    "title": {
                        "display": bool(chart_title),
                        "text": chart_title
                    },
                    "legend": {
                        "display": len(y_fields) > 1
                    }
                },
                "scales": {
                    "x": {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": "Values"
                        }
                    } if not horizontal else {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": x_field.replace("_", " ").title()
                        }
                    },
                    "y": {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": x_field.replace("_", " ").title()
                        }
                    } if not horizontal else {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": "Values"
                        }
                    }
                }
            }
        }
    
    @staticmethod
    def _get_color(index: int, alpha: float = 1.0) -> str:
        """
        Generate a color based on index.
        
        Args:
            index: Color index
            alpha: Alpha transparency (0-1)
            
        Returns:
            RGBA color string
        """
        colors = [
            (54, 162, 235),   # Blue
            (255, 99, 132),   # Red
            (75, 192, 192),   # Teal
            (255, 159, 64),   # Orange
            (153, 102, 255),  # Purple
            (255, 205, 86),   # Yellow
            (201, 203, 207),  # Grey
        ]
        
        color = colors[index % len(colors)]
        if alpha < 1.0:
            return f"rgba({color[0]}, {color[1]}, {color[2]}, {alpha})"
        return f"rgb({color[0]}, {color[1]}, {color[2]})"
    
    @staticmethod
    def generate_heatmap(
        data: List[Dict[str, Any]],
        x_field: str,
        y_field: str,
        value_field: str,
        chart_title: str = ""
    ) -> Dict[str, Any]:
        """
        Generate heatmap data.
        
        Args:
            data: List of data points
            x_field: Field name for x-axis
            y_field: Field name for y-axis
            value_field: Field name for values
            chart_title: Title for the chart
            
        Returns:
            Dictionary with chart configuration and data
        """
        # Extract unique x and y values
        x_values = sorted(list(set(point.get(x_field) for point in data)))
        y_values = sorted(list(set(point.get(y_field) for point in data)))
        
        # Create data matrix
        matrix_data = []
        for y_val in y_values:
            row = []
            for x_val in x_values:
                # Find matching data point
                matching_point = next(
                    (point for point in data 
                     if point.get(x_field) == x_val and point.get(y_field) == y_val),
                    None
                )
                row.append(matching_point.get(value_field, 0) if matching_point else 0)
            matrix_data.append(row)
        
        return {
            "type": "heatmap",
            "data": {
                "xLabels": x_values,
                "yLabels": y_values,
                "datasets": [{
                    "data": matrix_data,
                    "backgroundColor": ChartGenerator._get_heatmap_colors(matrix_data)
                }]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "plugins": {
                    "title": {
                        "display": bool(chart_title),
                        "text": chart_title
                    }
                },
                "scales": {
                    "x": {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": x_field.replace("_", " ").title()
                        }
                    },
                    "y": {
                        "display": True,
                        "title": {
                            "display": True,
                            "text": y_field.replace("_", " ").title()
                        }
                    }
                }
            }
        }
    
    @staticmethod
    def _get_heatmap_colors(data_matrix: List[List[float]]) -> List[str]:
        """
        Generate colors for heatmap based on data values.
        
        Args:
            data_matrix: 2D array of values
            
        Returns:
            List of color strings
        """
        # Flatten matrix to find min/max values
        flat_data = [val for row in data_matrix for val in row]
        min_val = min(flat_data) if flat_data else 0
        max_val = max(flat_data) if flat_data else 1
        
        # Generate colors based on normalized values
        colors = []
        for row in data_matrix:
            row_colors = []
            for val in row:
                # Normalize value (0-1)
                normalized = (val - min_val) / (max_val - min_val) if max_val != min_val else 0
                
                # Generate color from blue (low) to red (high)
                r = int(255 * normalized)
                g = int(255 * (1 - abs(normalized - 0.5) * 2))
                b = int(255 * (1 - normalized))
                row_colors.append(f"rgb({r}, {g}, {b})")
            colors.append(row_colors)
        
        return colors