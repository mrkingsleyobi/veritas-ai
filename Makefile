# Makefile for VeritasAI development

# Variables
PYTHON := python3
PIP := pip3
TEST_FLAGS := -v

# Default target
.PHONY: help
help:
	@echo "VeritasAI Development Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make setup           Install dependencies"
	@echo "  make run             Start development server"
	@echo "  make test            Run tests"
	@echo "  make test-cov        Run tests with coverage"
	@echo "  make lint            Run linter"
	@echo "  make security        Run security scan"
	@echo "  make docker          Build Docker image"
	@echo "  make docker-run      Run Docker container"
	@echo "  make compose         Start docker-compose"
	@echo "  make migrations      Create database migrations"
	@echo "  make upgrade         Run database migrations"
	@echo "  make clean           Clean Python cache files"

# Install dependencies
.PHONY: setup
setup:
	$(PIP) install -r requirements.txt
	$(PIP) install pytest pytest-cov flake8 bandit

# Start development server
.PHONY: run
run:
	$(PYTHON) -m uvicorn src.main:app --reload

# Run tests
.PHONY: test
test:
	$(PYTHON) -m pytest src/tests/ $(TEST_FLAGS)

# Run tests with coverage
.PHONY: test-cov
test-cov:
	$(PYTHON) -m pytest src/tests/ --cov=src --cov-report=html --cov-report=term

# Run linter
.PHONY: lint
lint:
	$(PYTHON) -m flake8 src/

# Run security scan
.PHONY: security
security:
	$(PYTHON) -m bandit -r src/

# Build Docker image
.PHONY: docker
docker:
	docker build -t veritasai:latest .

# Run Docker container
.PHONY: docker-run
docker-run:
	docker run -p 8000:8000 --env-file .env veritasai:latest

# Start docker-compose
.PHONY: compose
compose:
	docker-compose up

# Create database migrations
.PHONY: migrations
migrations:
	alembic revision --autogenerate -m "Auto migration"

# Run database migrations
.PHONY: upgrade
upgrade:
	alembic upgrade head

# Clean Python cache files
.PHONY: clean
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage

# Initialize development environment
.PHONY: init
init:
	./scripts/init.sh

# Run all checks
.PHONY: check
check: lint security test

# Run full development setup
.PHONY: dev
dev: setup init run