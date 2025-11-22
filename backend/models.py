from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    # In real production, we store hashed passwords, not plain text!
    password = Column(String) 

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    doc_type = Column(String) # "docx" or "pptx"
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Link projects to their sections
    sections = relationship("DocumentSection", back_populates="project")

class DocumentSection(Base):
    __tablename__ = "document_sections"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    sequence_order = Column(Integer) # To keep slides/chapters in order
    heading = Column(String) # Slide Title or Chapter Header
    content = Column(Text) # The AI generated text
    
    project = relationship("Project", back_populates="sections")