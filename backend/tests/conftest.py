import os
import pytest

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.core.config import settings
settings.DATABASE_URL = "sqlite:///:memory:"

from app.core.database import Base, get_db, engine
from app.main import app

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(setup_db):
    from app.core.database import SessionLocal
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="function")
def client(db):
    from fastapi.testclient import TestClient
    def _get_test_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
