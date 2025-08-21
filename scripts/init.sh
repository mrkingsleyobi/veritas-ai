#!/bin/bash

# Initialize VeritasAI development environment

echo "Initializing VeritasAI development environment..."

# Create necessary directories
mkdir -p logs backups

# Initialize database
echo "Running database migrations..."
alembic upgrade head

# Initialize object storage
echo "Initializing object storage..."
python -c "
import boto3
from botocore.client import Config

# Create MinIO client
s3 = boto3.client(
    's3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin',
    config=Config(signature_version='s3v4'),
    region_name='us-east-1'
)

# Create bucket
try:
    s3.create_bucket(Bucket='veritasai-content')
    print('Created bucket: veritasai-content')
except Exception as e:
    if 'BucketAlreadyOwnedByYou' in str(e):
        print('Bucket already exists: veritasai-content')
    else:
        print(f'Error creating bucket: {e}')
"

echo "Development environment initialized successfully!"
echo ""
echo "To start the development environment, run:"
echo "  docker-compose up"
echo ""
echo "To access the application:"
echo "  http://localhost:8000"
echo "  API Documentation: http://localhost:8000/docs"