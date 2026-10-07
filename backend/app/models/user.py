from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    google_sub = Column(String(255), unique=True, index=True, nullable=True)
    role = Column(String(50), default="user", nullable=False)  # "user" | "admin"
    status = Column(String(50), default="active", nullable=False)  # "active" | "inactive"
    last_login = Column(DateTime, nullable=True)
    first_login_at = Column(DateTime, nullable=True)
    last_active_date = Column(String(20), nullable=True)  # "YYYY-MM-DD"
    total_login_count = Column(Integer, default=0, nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    programs_executed = Column(Integer, default=0, nullable=False)
    programs_completed = Column(Integer, default=0, nullable=False)
    chapters_completed = Column(Integer, default=0, nullable=False)
    overall_progress = Column(Integer, default=0, nullable=False)
    learning_sessions = Column(Integer, default=0, nullable=False)
    current_chapter = Column(String(50), default="Not Started", nullable=False)
    current_program = Column(String(50), default="Not Started", nullable=False)
    progress_data = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
