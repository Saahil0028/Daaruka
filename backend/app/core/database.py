
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
is_postgres = settings.DATABASE_URL.startswith("postgresql")

engine_kwargs = {}
if is_sqlite:
    engine_kwargs = {
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool
    }
elif is_postgres:
    # If connecting to remote Supabase or external PostgreSQL, ensure sslmode handling
    # and configure psycopg2 connection parameters
    connect_args = {}
    if "supabase" in settings.DATABASE_URL or "sslmode=" in settings.DATABASE_URL:
        # psycopg2 driver uses sslmode in connect_args or query string
        if "sslmode=" not in settings.DATABASE_URL:
            connect_args["sslmode"] = "require"
    
    # Configure pool pre-ping to detect stale pooler connections
    engine_kwargs = {
        "connect_args": connect_args,
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
