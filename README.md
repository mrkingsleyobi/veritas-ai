# VeritasAI

An AI-powered platform designed to combat digital misinformation by verifying content authenticity and detecting deepfakes across various media types.

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

### Technology Stack:
- **Backend**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Caching**: Redis
- **Object Storage**: MinIO/AWS S3
- **Containerization**: Docker
- **CI/CD**: GitHub Actions with Dagger
- **Authentication**: JWT

## Project Structure:
```
veritas-ai/
├── src/
│   ├── api/          # API endpoints
│   ├── auth/         # Authentication modules
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