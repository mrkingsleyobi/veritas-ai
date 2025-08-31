# VeritasAI

An AI-powered platform designed to combat digital misinformation by verifying content authenticity and detecting deepfakes across various media types.
![Alt](https://repobeats.axiom.co/api/embed/9a393c4995b2fabcd3af0c50f1a6fa07c287d91a.svg "Repobeats analytics image")

[![CI/CD](https://github.com/mrkingsleyobi/veritas-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/mrkingsleyobi/veritas-ai/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

## Phase 1: Foundation & Core Ingestion ✅ COMPLETED

This phase establishes the core infrastructure and basic functionality for the VeritasAI platform.

### Features Implemented:
- Cloud environment setup (VPC, basic compute, object storage)
- Database setup (PostgreSQL, Redis)
- Backend service scaffolding (FastAPI, API Gateway)
- User authentication and basic user management
- Content direct upload and URL ingestion functionality
- Initial object storage integration
- Basic CI/CD pipeline setup with Dagger

### Phase 1 Summary
See [Phase 1 Implementation Summary](docs/phase1-summary.md) for a complete overview of all implemented features, components, and next steps.

## Phase 2: AI Content Verification & Deepfake Detection ✅ COMPLETED

This phase implements advanced AI-powered content verification and deepfake detection capabilities.

### Features Implemented:
- AI Content Verification Engine with support for multiple content types (text, HTML, images, videos, JSON)
- Deepfake Detection Algorithms for image and video content analysis
- Third-Party Verification Services integration with Snopes, FactCheck.org, and PolitiFact
- Analysis Dashboard with user analytics, trends, and verification summaries
- Database schema updates to store AI analysis results
- Comprehensive API endpoints for all AI functionality
- Extensive test suite and documentation

### Technology Stack:
- **Backend**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Caching**: Redis
- **Object Storage**: MinIO/AWS S3
- **Containerization**: Docker
- **CI/CD**: GitHub Actions with Dagger
- **Authentication**: JWT
- **AI/ML**: Custom verification algorithms with third-party service integration

## Phase 3: ML Model Integration & Real-time Processing ✅ COMPLETED

This phase focuses on integrating advanced machine learning models and implementing real-time processing capabilities.

### Features Implemented:
- Integration of advanced ML models for content analysis
- Real-time processing pipeline for continuous content verification
- Streaming data processing with WebSocket support
- Enhanced deepfake detection with real-time analysis
- Performance optimizations for ML model inference
- Scalable architecture for handling high-volume real-time data

### Technology Stack:
- **ML Frameworks**: Scikit-learn, TensorFlow, PyTorch
- **Streaming**: WebSocket, Kafka (simulated)
- **Real-time Processing**: Async processing with asyncio
- **Model Management**: Custom model loading and caching system

### Phase 3 Summary
See [Phase 3 Implementation Summary](docs/phase3-summary.md) for a complete overview of all implemented features, components, and next steps.

## Phase 4: Enhanced Dashboard, Performance Optimizations, and Advanced Analytics ✅ COMPLETED

This phase enhances the user experience through improved dashboard visualizations, optimizes system performance, and implements advanced analytics capabilities.

### Features Implemented:
- Enhanced dashboard with interactive visualizations
- Performance optimizations with intelligent caching and profiling
- Advanced analytics with predictive modeling and trend analysis
- Automated insights generation from analytics data
- Comprehensive API endpoints for all new functionality

### Technology Stack:
- **Visualization**: Custom chart generation components
- **Caching**: Redis with intelligent cache strategies
- **Analytics**: Scikit-learn, SciPy, NumPy
- **Performance Monitoring**: Custom profiling and monitoring tools

### Phase 4 Summary
See [Phase 4 Implementation Summary](docs/phase4-summary.md) for a complete overview of all implemented features, components, and next steps.

## Phase 5: Mobile Application Development & User Experience Enhancement 🚀 PLANNED

This phase focuses on expanding user reach through mobile applications and significantly improving the overall user experience with enhanced interfaces, accessibility features, and advanced reporting capabilities.

### Features Planned:
- **Mobile Applications**: Native iOS and Android apps with React Native
- **Web UI Enhancement**: Modern React-based dashboard with interactive visualizations
- **Advanced Reporting**: PDF/Excel report generation with scheduled delivery
- **User Experience Improvements**: Onboarding, feedback systems, and multi-language support

### Technology Stack:
- **Mobile**: React Native with Expo, TypeScript
- **Web UI**: React with TypeScript, Material-UI
- **State Management**: Redux Toolkit
- **Reporting**: PDFKit, ExcelJS
- **Accessibility**: WCAG 2.1 compliance

### Phase 5 Planning
See [Phase 5 Planning Document](docs/phase5-planning.md) for a complete overview of the implementation roadmap, GitHub issues, and development timeline.

## Project Structure:
```
veritas-ai/
├── src/
│   ├── ai/           # AI components (verification, deepfake detection, third-party services)
│   ├── api/          # API endpoints
│   ├── auth/         # Authentication modules
│   ├── dashboard/    # Analysis dashboard components
│   ├── database/     # Database setup
│   ├── models/       # Database models
│   ├── schemas/      # Pydantic schemas
│   ├── storage/      # Object storage integration
│   ├── tests/        # Test files
│   └── utils/        # Utility functions
├── alembic/          # Database migrations
├── dagger/           # CI/CD pipeline
├── docs/             # Documentation
├── scripts/          # Utility scripts
├── .github/          # GitHub Actions workflows
├── .env.example      # Environment variables example
├── .gitignore        # Git ignore file
├── alembic.ini       # Alembic configuration
├── Dockerfile        # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── Makefile          # Development tasks
├── README.md         # Project README
└── requirements.txt  # Python dependencies
```

## Quick Start

### Prerequisites
- Python 3.9+
- Docker and Docker Compose (recommended)
- PostgreSQL 12+ (if not using Docker)
- Redis 6+ (if not using Docker)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/mrkingsleyobi/veritas-ai.git
cd veritas-ai

# Start the development environment
docker-compose up
```

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/mrkingsleyobi/veritas-ai.git
cd veritas-ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-ai.txt  # Additional AI dependencies

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the server
uvicorn src.main:app --reload
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Running Tests
```bash
# Run all tests
make test

# Run tests with coverage
make test-cov

# Run specific test file
pytest src/tests/test_auth.py -v
```

### Code Quality
```bash
# Run linter
make lint

# Run security scan
make security

# Run all checks
make check
```

### Database Migrations
```bash
# Create new migration
make migrations

# Run migrations
make upgrade
```

## Deployment

### Production Deployment
See [Deployment Guide](docs/deployment.md) for detailed instructions.

### Docker Deployment
```bash
# Build the image
make docker

# Run the container
make docker-run
```

## Documentation

- [API Documentation](docs/api.md)
- [Development Setup](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [AI Verification Features](docs/ai-verification.md)
- [Third-Party Verification Services](docs/third-party-verification.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped with this project
- Inspired by the need to combat digital misinformation
