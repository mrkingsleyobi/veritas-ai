"""
Predictive analytics model for VeritasAI.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


class PredictiveAnalyticsModel:
    """Predictive analytics model for content verification trends."""
    
    def __init__(self):
        """Initialize the predictive analytics model."""
        self.models = {
            'linear_regression': LinearRegression(),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42)
        }
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = []
        self.model_performance = {}
    
    def prepare_features(self, historical_data: List[Dict[str, Any]]) -> np.ndarray:
        """
        Prepare features for predictive modeling.
        
        Args:
            historical_data: List of historical data points
            
        Returns:
            NumPy array of features
        """
        features = []
        
        for data_point in historical_data:
            time_features = self._extract_time_features(data_point.get('timestamp', datetime.now()))
            if isinstance(time_features, list):
                feature_vector = [
                    data_point.get('content_count', 0),
                    data_point.get('avg_verification_score', 0),
                    data_point.get('avg_deepfake_probability', 0),
                    data_point.get('third_party_verifications', 0),
                    *time_features
                ]
            else:
                feature_vector = [
                    data_point.get('content_count', 0),
                    data_point.get('avg_verification_score', 0),
                    data_point.get('avg_deepfake_probability', 0),
                    data_point.get('third_party_verifications', 0),
                    time_features
                ]
            features.append(feature_vector)
        
        return np.array(features)
    
    def _extract_time_features(self, timestamp) -> List[float]:
        """
        Extract time-based features from timestamp.
        
        Args:
            timestamp: Timestamp to extract features from
            
        Returns:
            List of time-based features
        """
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        elif not isinstance(timestamp, datetime):
            timestamp = datetime.now()
        
        # Extract various time features
        day_of_week = timestamp.weekday()
        hour_of_day = timestamp.hour
        is_weekend = 1 if day_of_week >= 5 else 0
        month = timestamp.month
        
        return [day_of_week, hour_of_day, is_weekend, month]
    
    def prepare_targets(self, historical_data: List[Dict[str, Any]], target_field: str) -> np.ndarray:
        """
        Prepare target values for predictive modeling.
        
        Args:
            historical_data: List of historical data points
            target_field: Field to predict
            
        Returns:
            NumPy array of target values
        """
        targets = [data_point.get(target_field, 0) for data_point in historical_data]
        return np.array(targets)
    
    def train_model(self, historical_data: List[Dict[str, Any]], target_field: str = 'content_count') -> Dict[str, Any]:
        """
        Train predictive models on historical data.
        
        Args:
            historical_data: List of historical data points
            target_field: Field to predict
            
        Returns:
            Dictionary with training results
        """
        if not historical_data:
            return {'error': 'No historical data provided'}
        
        try:
            # Prepare features and targets
            X = self.prepare_features(historical_data)
            y = self.prepare_targets(historical_data, target_field)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train models
            training_results = {}
            for model_name, model in self.models.items():
                # Train model
                model.fit(X_scaled, y)
                
                # Calculate performance metrics
                predictions = model.predict(X_scaled)
                mse = np.mean((y - predictions) ** 2)
                rmse = np.sqrt(mse)
                mae = np.mean(np.abs(y - predictions))
                
                # R-squared score
                ss_res = np.sum((y - predictions) ** 2)
                ss_tot = np.sum((y - np.mean(y)) ** 2)
                r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
                
                training_results[model_name] = {
                    'mse': float(mse),
                    'rmse': float(rmse),
                    'mae': float(mae),
                    'r2': float(r2),
                    'trained_at': datetime.now().isoformat()
                }
            
            self.is_trained = True
            self.model_performance = training_results
            self.feature_names = ['content_count', 'avg_verification_score', 'avg_deepfake_probability', 
                                'third_party_verifications', 'day_of_week', 'hour_of_day', 'is_weekend', 'month']
            
            return {
                'success': True,
                'models_trained': list(self.models.keys()),
                'performance': training_results,
                'feature_names': self.feature_names,
                'trained_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error training predictive models: {str(e)}")
            return {'error': f'Failed to train models: {str(e)}'}
    
    def predict(self, input_features: Dict[str, Any], model_name: str = 'random_forest') -> Dict[str, Any]:
        """
        Make predictions using trained models.
        
        Args:
            input_features: Dictionary of input features
            model_name: Name of the model to use for prediction
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_trained:
            return {'error': 'Model not trained yet'}
        
        if model_name not in self.models:
            return {'error': f'Model {model_name} not found'}
        
        try:
            # Prepare input features
            feature_vector = [
                input_features.get('content_count', 0),
                input_features.get('avg_verification_score', 0),
                input_features.get('avg_deepfake_probability', 0),
                input_features.get('third_party_verifications', 0),
                *self._extract_time_features(input_features.get('timestamp', datetime.now()))
            ]
            
            # Scale features
            X = np.array([feature_vector])
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            model = self.models[model_name]
            prediction = model.predict(X_scaled)[0]
            
            # Get model performance
            model_performance = self.model_performance.get(model_name, {})
            
            return {
                'prediction': float(prediction),
                'model_used': model_name,
                'model_performance': model_performance,
                'input_features': input_features,
                'predicted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            return {'error': f'Failed to make prediction: {str(e)}'}
    
    def get_model_performance(self) -> Dict[str, Any]:
        """
        Get performance metrics for all trained models.
        
        Returns:
            Dictionary with model performance metrics
        """
        return self.model_performance
    
    def generate_forecast(self, days_ahead: int = 7, model_name: str = 'random_forest') -> Dict[str, Any]:
        """
        Generate forecast for future time periods.
        
        Args:
            days_ahead: Number of days to forecast ahead
            model_name: Name of the model to use for forecasting
            
        Returns:
            Dictionary with forecast results
        """
        if not self.is_trained:
            return {'error': 'Model not trained yet'}
        
        try:
            forecasts = []
            current_date = datetime.now()
            
            for i in range(days_ahead):
                future_date = current_date + timedelta(days=i)
                
                # Create input features for future date
                input_features = {
                    'content_count': 0,  # This would typically be based on historical averages
                    'avg_verification_score': 0.8,  # Example value
                    'avg_deepfake_probability': 0.1,  # Example value
                    'third_party_verifications': 5,  # Example value
                    'timestamp': future_date
                }
                
                # Make prediction
                prediction_result = self.predict(input_features, model_name)
                
                if 'error' not in prediction_result:
                    forecasts.append({
                        'date': future_date.isoformat(),
                        'predicted_value': prediction_result['prediction'],
                        'model_used': model_name,
                        'confidence_interval': self._calculate_confidence_interval(prediction_result['prediction'])
                    })
            
            return {
                'forecasts': forecasts,
                'days_ahead': days_ahead,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating forecast: {str(e)}")
            return {'error': f'Failed to generate forecast: {str(e)}'}
    
    def _calculate_confidence_interval(self, prediction: float, confidence_level: float = 0.95) -> Dict[str, float]:
        """
        Calculate confidence interval for prediction.
        
        Args:
            prediction: Predicted value
            confidence_level: Confidence level (default: 0.95)
            
        Returns:
            Dictionary with confidence interval bounds
        """
        # Simplified confidence interval calculation
        # In a real implementation, this would be based on model uncertainty
        margin_of_error = prediction * 0.1  # 10% margin of error as example
        
        return {
            'lower_bound': max(0, prediction - margin_of_error),
            'upper_bound': prediction + margin_of_error,
            'confidence_level': confidence_level
        }


# Global instance
predictive_model = PredictiveAnalyticsModel()