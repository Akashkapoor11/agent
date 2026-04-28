import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_CON_STR = os.getenv("DB_CON_STR", "").strip()

if not DB_CON_STR:
    raise RuntimeError("DB_CON_STR environment variable is not set.")

USE_SQLITE = False
engine = create_engine(DB_CON_STR)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
