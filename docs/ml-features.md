# Machine Learning Features

VeritasAI Phase 3 introduces advanced machine learning capabilities to enhance content verification and deepfake detection accuracy.

## Overview

The ML system provides state-of-the-art models for analyzing text, images, and other content types. The system includes:

1. **Text Analysis Models**: BERT-based models for detecting misinformation patterns
2. **Image Analysis Models**: CNN-based models for deepfake detection
3. **Model Management**: Versioning system with A/B testing capabilities
4. **Performance Monitoring**: Real-time tracking of model accuracy and performance

## Model Architecture

### Text Analysis Model
- **Base Model**: BERT (Bidirectional Encoder Representations from Transformers)
- **Purpose**: Detect misinformation patterns, credibility assessment
- **Features**: 
  - Sensational language detection
  - Uncertain claims identification
  - Vague authority references
  - Absolute claim analysis

### Image Analysis Model
- **Base Model**: ResNet-50 (Residual Network)
- **Purpose**: Deepfake detection, authenticity verification
- **Features**:
  - Compression artifact analysis
  - Facial landmark consistency
  - Eye blink detection
  - Lighting consistency checking

## API Endpoints

### Text Analysis
```http
POST /api/v1/ml/analyze-text
```

**Parameters:**
- `text` (string, required): Text to analyze
- `model_version` (string, optional): Specific model version to use

**Response:**
```json
{
  "text": "The input text",
  "analysis_result": {
    "text_length": 123,
    "pattern_matches": [
      {
        "type": "sensational_language",
        "matches": ["breaking", "shocking"],
        "count": 2
      }
    ],
    "misinformation_score": 0.25,
    "authenticity_score": 0.75,
    "confidence": 0.85,
    "assessment": "Likely Authentic",
    "model_name": "bert-base-uncased",
    "model_version": "1.0.0",
    "timestamp": "2023-01-01T00:00:00Z"
  }
}
```

### Image Analysis
```http
POST /api/v1/ml/analyze-image
```

**Parameters:**
- `file` (file, required): Image file to analyze
- `model_version` (string, optional): Specific model version to use

**Response:**
```json
{
  "filename": "test.jpg",
  "content_type": "image/jpeg",
  "analysis_result": {
    "image_size": 123456,
    "deepfake_probability": 0.15,
    "authenticity_score": 0.85,
    "confidence": 0.92,
    "assessment": "Likely Authentic",
    "features_analyzed": [
      "compression_artifacts",
      "facial_landmarks",
      "eye_blink_consistency"
    ],
    "model_name": "resnet50",
    "model_version": "1.0.0",
    "timestamp": "2023-01-01T00:00:00Z"
  }
}
```

### Model Management
```http
GET /api/v1/ml/models
```

**Response:**
```json
{
  "models": {
    "text_analysis": ["1.0.0"],
    "image_analysis": ["1.0.0"]
  },
  "active_models": {
    "text_analysis": "1.0.0",
    "image_analysis": "1.0.0"
  }
}
```

### Performance Monitoring
```http
GET /api/v1/ml/models/{model_type}/performance
```

**Response:**
```json
{
  "model_type": "text_analysis",
  "total_predictions": 1250,
  "total_trainings": 3,
  "recent_predictions": [...],
  "recent_trainings": [...],
  "timestamp": "2023-01-01T00:00:00Z"
}
```

## Model Versioning

The system supports multiple versions of each model type, allowing for:

1. **A/B Testing**: Compare performance of different model versions
2. **Rollback Capability**: Revert to previous versions if issues arise
3. **Gradual Deployment**: Deploy new models to subsets of users

### Setting Active Models
```http
POST /api/v1/ml/models/{model_type}/load
```

## Training Models

Authorized users can train models with new data:

```http
POST /api/v1/ml/train
```

**Parameters:**
- `model_type` (string, required): Type of model to train
- `training_data` (array, required): Training data
- `validation_data` (array, required): Validation data
- `model_version` (string, optional): Version to train

**Note**: Only admin users can train models.

## Performance Monitoring

The system tracks model performance metrics including:
- Prediction accuracy
- Response times
- Error rates
- Usage statistics

## Integration with Existing Systems

ML models integrate seamlessly with existing VeritasAI components:
- Content verification engine uses ML models for enhanced accuracy
- Deepfake detection leverages image analysis models
- Dashboard displays ML performance metrics
- Third-party verification services can be enhanced with ML insights

## Future Enhancements

Planned improvements include:
- Integration with more advanced pre-trained models
- Automated model retraining based on performance metrics
- Distributed training for large datasets
- Model compression for edge deployment