from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    doc_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    sections = relationship("DocumentSection", back_populates="project", cascade="all, delete-orphan")

class DocumentSection(Base):
    __tablename__ = "document_sections"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    sequence_order = Column(Integer)
    heading = Column(String)
    content = Column(Text)
    
    # --- NEW FIELDS FOR FEEDBACK ---
    is_liked = Column(Boolean, default=False)
    is_disliked = Column(Boolean, default=False)
    user_notes = Column(Text, nullable=True)
    
    project = relationship("Project", back_populates="sections")