from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from app.database import Base


class LoginActivity(Base):
    __tablename__ = "login_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(120), nullable=True)
    email = Column(String(255), index=True, nullable=False)
    role = Column(String(50), nullable=False, default="user")
    login_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), nullable=False, default="success")  # "success" | "failed"

