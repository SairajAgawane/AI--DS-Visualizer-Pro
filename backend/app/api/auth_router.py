from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.login_activity import LoginActivity
from app.models.user import User

router = APIRouter()
TOKEN_SECRET = os.getenv("AUTH_SECRET", "change-this-local-secret")


def _password_hash(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 210_000).hex()
    return f"{salt}${digest}"


def _password_ok(password: str, encoded: str) -> bool:
    salt, expected = encoded.split("$", 1)
    actual = _password_hash(password, salt).split("$", 1)[1]
    return hmac.compare_digest(actual, expected)


def _token(user: User) -> str:
    role = getattr(user, "role", "user") or "user"
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": role,
        "exp": (datetime.utcnow() + timedelta(days=7)).timestamp(),
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(TOKEN_SECRET.encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{signature}"


def _update_user_streak(user: User):
    """
    Real calendar-day streak computation following Sections 4 - 9:
    - First ever login: currentStreak = 0, longestStreak = 0, totalLoginCount = 1
    - Next calendar day: currentStreak += 1, longestStreak = max(longestStreak, currentStreak)
    - Same calendar day: currentStreak unchanged, totalLoginCount += 1
    - Missed 1+ calendar days: currentStreak reset to 0, longestStreak unchanged
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    now_dt = datetime.utcnow()

    if not getattr(user, "last_active_date", None):
        user.first_login_at = user.first_login_at or now_dt
        user.last_login = now_dt
        user.last_active_date = today_str
        user.total_login_count = max(1, getattr(user, "total_login_count", 0) + 1)
        user.current_streak = 0
        user.longest_streak = 0
        return

    try:
        last_date = datetime.strptime(user.last_active_date, "%Y-%m-%d").date()
        today_date = datetime.strptime(today_str, "%Y-%m-%d").date()
        day_diff = (today_date - last_date).days
    except Exception:
        day_diff = 1

    user.last_login = now_dt
    user.total_login_count = getattr(user, "total_login_count", 0) + 1

    if day_diff == 0:
        # Same calendar day login
        pass
    elif day_diff == 1:
        # Next consecutive calendar day login
        new_streak = getattr(user, "current_streak", 0) + 1
        user.current_streak = new_streak
        user.longest_streak = max(getattr(user, "longest_streak", 0), new_streak)
        user.last_active_date = today_str
    elif day_diff > 1:
        # Missed day: streak broken, reset to 0
        user.current_streak = 0
        user.last_active_date = today_str


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)

    @validator("email")
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)
    expected_role: str | None = None

    @validator("email")
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class GoogleRequest(BaseModel):
    credential: str = Field(..., min_length=20)


def _response(user: User) -> dict:
    role = getattr(user, "role", "user") or "user"
    status = getattr(user, "status", "active") or "active"
    return {
        "success": True,
        "token": _token(user),
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role,
            "status": status,
            "firstLoginAt": user.first_login_at.isoformat() if getattr(user, "first_login_at", None) else None,
            "lastLoginAt": user.last_login.isoformat() if getattr(user, "last_login", None) else None,
            "lastActiveDate": getattr(user, "last_active_date", None),
            "totalLoginCount": getattr(user, "total_login_count", 1) or 1,
            "currentStreak": getattr(user, "current_streak", 0) or 0,
            "longestStreak": getattr(user, "longest_streak", 0) or 0,
            "overallProgress": getattr(user, "overall_progress", 0) or 0,
            "chaptersCompleted": getattr(user, "chapters_completed", 0) or 0,
            "programsExecuted": getattr(user, "programs_executed", 0) or 0,
            "programsCompleted": getattr(user, "programs_completed", 0) or 0,
            "currentChapter": getattr(user, "current_chapter", "Not Started") or "Not Started",
            "currentProgram": getattr(user, "current_program", "Not Started") or "Not Started",
        },
    }


@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        return {
            "success": False,
            "error": "Email already registered",
            "message": "An account with this email already exists.",
        }

    now_dt = datetime.utcnow()
    today_str = now_dt.strftime("%Y-%m-%d")

    user = User(
        name=request.name.strip(),
        email=request.email,
        password_hash=_password_hash(request.password),
        role="user",
        status="active",
        first_login_at=now_dt,
        last_login=now_dt,
        last_active_date=today_str,
        total_login_count=1,
        current_streak=0,
        longest_streak=0,
        programs_executed=0,
        programs_completed=0,
        chapters_completed=0,
        overall_progress=0,
        learning_sessions=0,
        current_chapter="Not Started",
        current_program="Not Started",
        progress_data="{}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Record login activity for signup session
    act = LoginActivity(
        user_id=user.id,
        user_name=user.name,
        email=user.email,
        role="user",
        status="success",
    )
    db.add(act)
    db.commit()

    return _response(user)


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    # Check credentials
    if not user or not user.password_hash or not _password_ok(request.password, user.password_hash):
        if user:
            failed_act = LoginActivity(
                user_id=user.id,
                user_name=user.name,
                email=request.email,
                role=getattr(user, "role", "user") or "user",
                status="failed",
            )
            db.add(failed_act)
            db.commit()
        error_msg = (
            "Invalid administrator credentials."
            if request.expected_role == "admin"
            else "Invalid email or password."
        )
        return {"success": False, "error": "Invalid credentials", "message": error_msg}

    # Check account status
    if getattr(user, "status", "active") == "inactive":
        failed_act = LoginActivity(
            user_id=user.id,
            user_name=user.name,
            email=request.email,
            role=getattr(user, "role", "user") or "user",
            status="failed",
        )
        db.add(failed_act)
        db.commit()
        return {
            "success": False,
            "error": "Account disabled",
            "message": "Your account is currently disabled. Please contact an administrator.",
        }

    # Check role if expected_role is 'admin'
    user_role = getattr(user, "role", "user") or "user"
    if request.expected_role == "admin" and user_role != "admin":
        failed_act = LoginActivity(
            user_id=user.id,
            user_name=user.name,
            email=request.email,
            role=user_role,
            status="failed",
        )
        db.add(failed_act)
        db.commit()
        return {
            "success": False,
            "error": "Access denied",
            "message": "Invalid administrator credentials.",
        }

    # Update streak and login stats
    _update_user_streak(user)

    # Success: log activity
    act = LoginActivity(
        user_id=user.id,
        user_name=user.name,
        email=user.email,
        role=user_role,
        status="success",
    )
    db.add(act)
    db.commit()
    db.refresh(user)

    return _response(user)


@router.post("/google")
def google_login(request: GoogleRequest, db: Session = Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        return {
            "success": False,
            "error": "Google login not configured",
            "message": "Set GOOGLE_CLIENT_ID in backend/.env and VITE_GOOGLE_CLIENT_ID in frontend/.env.",
        }
    try:
        query = urllib.parse.urlencode({"id_token": request.credential})
        with urllib.request.urlopen(f"https://oauth2.googleapis.com/tokeninfo?{query}", timeout=5) as response:
            profile = json.loads(response.read().decode())
        if profile.get("aud") != client_id or not profile.get("sub") or not profile.get("email"):
            return {
                "success": False,
                "error": "Invalid Google credential",
                "message": "Google could not verify this account.",
            }
        user = (
            db.query(User).filter(User.google_sub == profile["sub"]).first()
            or db.query(User).filter(User.email == profile["email"].lower()).first()
        )
        now_dt = datetime.utcnow()
        today_str = now_dt.strftime("%Y-%m-%d")
        if not user:
            user = User(
                name=profile.get("name") or profile["email"].split("@")[0],
                email=profile["email"].lower(),
                google_sub=profile["sub"],
                role="user",
                status="active",
                first_login_at=now_dt,
                last_login=now_dt,
                last_active_date=today_str,
                total_login_count=1,
                current_streak=0,
                longest_streak=0,
                programs_executed=0,
                programs_completed=0,
                chapters_completed=0,
                overall_progress=0,
            )
            db.add(user)
        else:
            if not user.google_sub:
                user.google_sub = profile["sub"]
            _update_user_streak(user)

        act = LoginActivity(
            user_id=user.id,
            user_name=user.name,
            email=user.email,
            role=getattr(user, "role", "user") or "user",
            status="success",
        )
        db.add(act)
        db.commit()
        db.refresh(user)
        return _response(user)
    except Exception:
        return {
            "success": False,
            "error": "Google login unavailable",
            "message": "Google sign-in could not be completed. Try email login.",
        }
