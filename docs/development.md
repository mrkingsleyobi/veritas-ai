# VeritasAI Development Setup

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.9 or higher
- PostgreSQL 12 or higher
- Redis 6 or higher
- MinIO or AWS S3 access
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/veritas-ai.git
cd veritas-ai
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Database Setup

1. Create the database:
```sql
CREATE DATABASE veritasai;
CREATE USER veritasai_user WITH PASSWORD 'veritasai_password';
GRANT ALL PRIVILEGES ON DATABASE veritasai TO veritasai_user;
```

2. Run database migrations:
```bash
alembic upgrade head
```

## Object Storage Setup

### Using MinIO (Recommended for Development)

1. Download and install MinIO:
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server /data
```

2. Configure MinIO:
   - Access the MinIO console at http://localhost:9000
   - Create access key and secret key
   - Create a bucket named `veritasai-content`

### Using AWS S3

1. Create an S3 bucket
2. Create IAM user with S3 permissions
3. Configure environment variables in `.env`

## Running the Application

1. Start Redis:
```bash
redis-server
```

2. Start the development server:
```bash
uvicorn src.main:app --reload
```

3. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Running Tests

1. Run all tests:
```bash
pytest src/tests/ -v
```

2. Run specific test file:
```bash
pytest src/tests/test_auth.py -v
```

3. Run tests with coverage:
```bash
pip install pytest-cov
pytest src/tests/ --cov=src --cov-report=html
```

## Code Quality

1. Run linter:
```bash
pip install flake8
flake8 src/
```

2. Run security scanner:
```bash
pip install bandit
bandit -r src/
```

## Docker Setup (Optional)

1. Build the Docker image:
```bash
docker build -t veritasai .
```

2. Run the container:
```bash
docker run -p 8000:8000 veritasai
```

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

1. **Build**: Installs dependencies and builds the application
2. **Test**: Runs unit tests and integration tests
3. **Security Scan**: Performs security scanning with Bandit
4. **Deploy Staging**: Deploys to staging environment
5. **Deploy Production**: Deploys to production environment

## Project Structure

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
├── .github/          # GitHub Actions workflows
├── .env.example      # Environment variables example
├── .gitignore        # Git ignore file
├── alembic.ini       # Alembic configuration
├── README.md         # Project README
└── requirements.txt  # Python dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Create a pull request

## Best Practices

1. Follow the conventional commits specification for commit messages
2. Write unit tests for new features
3. Run linter and security scanner before committing
4. Update documentation when making changes
5. Use feature branches for development