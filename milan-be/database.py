import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_CON_STR = os.getenv("DB_CON_STR", "").strip()

_VALID_SCHEMES = ("postgresql://", "postgresql+psycopg2://", "postgresql+asyncpg://")
if not DB_CON_STR or not any(DB_CON_STR.startswith(s) for s in _VALID_SCHEMES):
    raise RuntimeError(
        "DB_CON_STR is missing or invalid. "
        "Set it to a valid PostgreSQL URL, e.g.: "
        "postgresql://user:password@host:5432/dbname?sslmode=require"
    )

engine = create_engine(DB_CON_STR)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
