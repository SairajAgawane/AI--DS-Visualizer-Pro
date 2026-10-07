from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json

# Load .env before importing the database module so DATABASE_URL is available.
load_dotenv()

from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db, SQLALCHEMY_DATABASE_URL
from app.models.history import OperationHistory
from app.models.user import User
from app.models.login_activity import LoginActivity

app = FastAPI(title="AI-DS VISUALIZER PRO API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-DS VISUALIZER PRO API"}

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        user_count = db.query(User).count()
        history_count = db.query(OperationHistory).count()
        engine_name = "supabase-postgresql" if SQLALCHEMY_DATABASE_URL.startswith("postgresql") else "local-sqlite"
        return {"status": "healthy", "database": "connected", "engine": engine_name, "users": user_count, "history_records": history_count}
    except Exception:
        return {"status": "degraded", "database": "unavailable", "message": "Database could not be opened."}

from app.database import engine, Base
Base.metadata.create_all(bind=engine)
with engine.begin() as connection:
    try:
        if SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
            connection.execute(text("ALTER TABLE operation_history ADD COLUMN IF NOT EXISTS language VARCHAR(20) NOT NULL DEFAULT 'python'"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user'"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active'"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date VARCHAR(20)"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS total_login_count INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS programs_executed INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS programs_completed INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS chapters_completed INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS overall_progress INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_sessions INTEGER NOT NULL DEFAULT 0"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS current_chapter VARCHAR(50) NOT NULL DEFAULT 'Not Started'"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS current_program VARCHAR(50) NOT NULL DEFAULT 'Not Started'"))
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS progress_data TEXT NOT NULL DEFAULT '{}'"))
        else:
            cols = [
                ("role", "VARCHAR(50) NOT NULL DEFAULT 'user'"),
                ("status", "VARCHAR(50) NOT NULL DEFAULT 'active'"),
                ("last_login", "TIMESTAMP"),
                ("first_login_at", "TIMESTAMP"),
                ("last_active_date", "VARCHAR(20)"),
                ("total_login_count", "INTEGER NOT NULL DEFAULT 0"),
                ("current_streak", "INTEGER NOT NULL DEFAULT 0"),
                ("longest_streak", "INTEGER NOT NULL DEFAULT 0"),
                ("programs_executed", "INTEGER NOT NULL DEFAULT 0"),
                ("programs_completed", "INTEGER NOT NULL DEFAULT 0"),
                ("chapters_completed", "INTEGER NOT NULL DEFAULT 0"),
                ("overall_progress", "INTEGER NOT NULL DEFAULT 0"),
                ("learning_sessions", "INTEGER NOT NULL DEFAULT 0"),
                ("current_chapter", "VARCHAR(50) NOT NULL DEFAULT 'Not Started'"),
                ("current_program", "VARCHAR(50) NOT NULL DEFAULT 'Not Started'"),
                ("progress_data", "TEXT NOT NULL DEFAULT '{}'"),
            ]
            for col_name, col_type in cols:
                try:
                    connection.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                except Exception:
                    pass
    except Exception:
        pass

# Seed default admin user if none exists
try:
    from app.database import SessionLocal
    from app.api.auth_router import _password_hash
    _db = SessionLocal()
    admin_exists = _db.query(User).filter(User.role == "admin").first()
    if not admin_exists:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@visualizer.pro").lower()
        admin_user = _db.query(User).filter(User.email == admin_email).first()
        if admin_user:
            admin_user.role = "admin"
            admin_user.status = "active"
        else:
            admin_pwd = os.getenv("ADMIN_PASSWORD", "AdminPassword123!")
            now_dt = datetime.utcnow()
            admin_user = User(
                name="System Administrator",
                email=admin_email,
                role="admin",
                status="active",
                password_hash=_password_hash(admin_pwd),
                first_login_at=now_dt,
                last_login=now_dt,
                last_active_date=now_dt.strftime("%Y-%m-%d"),
                total_login_count=1,
                current_streak=0,
                longest_streak=0,
            )
            _db.add(admin_user)
        _db.commit()
    _db.close()
except Exception:
    pass

from app.api.nlp_router import router as nlp_router
from app.api.execute_router import router as execute_router
from app.api.chatbot_router import router as chatbot_router
from app.api.challenge_router import router as challenge_router
from app.api.learning_router import router as learning_router
from app.api.auth_router import router as auth_router
from app.api.admin_router import router as admin_router
from app.api.user_router import router as user_router
from app.api.program_router import router as program_router

app.include_router(nlp_router, prefix="/api/ai", tags=["ai"])
app.include_router(execute_router, prefix="/api/execute", tags=["execute"])
app.include_router(chatbot_router, prefix="/api/chat", tags=["chat"])
app.include_router(challenge_router, prefix="/api/challenge", tags=["challenge"])
app.include_router(learning_router, prefix="/api", tags=["learning"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(user_router, prefix="/api/user", tags=["user"])
app.include_router(program_router, prefix="/api/program", tags=["program-execution"])


@app.get("/api/history")
def get_history(session_id: str = "demo-session", db: Session = Depends(get_db)):
    rows = db.query(OperationHistory).filter(OperationHistory.session_id == session_id).order_by(OperationHistory.created_at.desc()).limit(100).all()
    return [{"id": row.id, "command": row.command, "data_structure": row.data_structure, "language": row.language or "python", "operations": json.loads(row.operations), "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]


@app.get("/api/programs/search")
def search_programs(q: str = ""):
    from app.services.program_service import program_service
    return {"programs": program_service.search_programs(q)}
