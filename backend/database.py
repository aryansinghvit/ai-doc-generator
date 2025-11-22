from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# FORMAT: postgresql://user:password@localhost/database_name
# Replace 'root' with your actual password if it's different
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:root@localhost/ai_doc_platform"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()