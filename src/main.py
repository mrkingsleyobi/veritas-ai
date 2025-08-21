"""
Main application file for VeritasAI.
"""
from fastapi import FastAPI
from src.database import Base
from src.api.auth import router as auth_router
from src.api.content import router as content_router
from src.ai.api import router as ai_router
from src.dashboard.api import router as dashboard_router
from src.cache.redis_client import ping_redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="VeritasAI",
    description="An AI-powered platform designed to combat digital misinformation by verifying content authenticity and detecting deepfakes across various media types.",
    version="0.2.0"
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(content_router, prefix="/api/v1/content", tags=["content"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to VeritasAI API"}

# Health check endpoint
@app.get("/health")
def health_check():
    db_status = "healthy"
    cache_status = "healthy" if ping_redis() else "unhealthy"
    
    return {
        "status": "healthy" if cache_status == "healthy" else "degraded",
        "services": {
            "database": db_status,
            "cache": cache_status
        }
    }