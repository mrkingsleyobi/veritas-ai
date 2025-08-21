"""
Object storage integration for VeritasAI.
"""
import os
from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv
from typing import Optional
import io

# Load environment variables
load_dotenv()

class StorageService:
    def __init__(self):
        """Initialize the MinIO client."""
        self.client = Minio(
            os.getenv("STORAGE_ENDPOINT", "localhost:9000"),
            access_key=os.getenv("STORAGE_ACCESS_KEY", "minioadmin"),
            secret_key=os.getenv("STORAGE_SECRET_KEY", "minioadmin"),
            secure=False  # Set to True if using HTTPS
        )
        self.bucket_name = os.getenv("STORAGE_BUCKET_NAME", "veritasai-content")
        self._bucket_created = False
    
    def _ensure_bucket_exists(self):
        """Create the storage bucket if it doesn't exist."""
        if not self._bucket_created:
            try:
                if not self.client.bucket_exists(self.bucket_name):
                    self.client.make_bucket(self.bucket_name)
                self._bucket_created = True
            except Exception as e:
                print(f"Error creating bucket: {e}")
                # Don't raise the exception to allow the app to start
                # The bucket creation will be retried when needed
    
    def upload_file(self, file_data: bytes, file_name: str, content_type: str) -> str:
        """Upload a file to storage and return the file path."""
        self._ensure_bucket_exists()
        try:
            # Upload the file
            self.client.put_object(
                self.bucket_name,
                file_name,
                io.BytesIO(file_data),
                len(file_data),
                content_type=content_type
            )
            return f"{self.bucket_name}/{file_name}"
        except S3Error as e:
            print(f"Error uploading file: {e}")
            raise
    
    def download_file(self, file_name: str) -> bytes:
        """Download a file from storage."""
        try:
            response = self.client.get_object(self.bucket_name, file_name)
            return response.read()
        except S3Error as e:
            print(f"Error downloading file: {e}")
            raise
        finally:
            response.close()
            response.release_conn()
    
    def delete_file(self, file_name: str) -> bool:
        """Delete a file from storage."""
        try:
            self.client.remove_object(self.bucket_name, file_name)
            return True
        except S3Error as e:
            print(f"Error deleting file: {e}")
            return False
    
    def get_file_url(self, file_name: str) -> str:
        """Get a presigned URL for a file."""
        try:
            url = self.client.presigned_get_object(self.bucket_name, file_name)
            return url
        except S3Error as e:
            print(f"Error generating presigned URL: {e}")
            raise

# Global storage service instance (lazy initialization)
_storage_service = None

def get_storage_service():
    """Get the global storage service instance."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service

# For backward compatibility
storage_service = get_storage_service()