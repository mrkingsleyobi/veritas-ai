"""
Test configuration for VeritasAI.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database import Base
from src.models.user import User
from src.models.content import Content
from src.auth.security import get_password_hash


@pytest.fixture(scope="session")
def engine():
    """Create a test database engine."""
    # Use an in-memory SQLite database for testing
    return create_engine("sqlite:///:memory:")


@pytest.fixture(scope="session")
def tables(engine):
    """Create database tables."""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session(engine, tables):
    """Create a database session for testing."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        username="testuser"
    )
    user.hashed_password = get_password_hash("testpassword")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_content(db_session, test_user):
    """Create test content."""
    content = Content(
        user_id=test_user.id,
        filename="test_image.jpg",
        file_path="test/test_image.jpg",
        content_type="image/jpeg",
        file_size=1024,
        status="uploaded"
    )
    db_session.add(content)
    db_session.commit()
    db_session.refresh(content)
    return content