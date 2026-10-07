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
    user = User(
        name=request.name.strip(),
        email=request.email,
        password_hash=_password_hash(request.password),
        role="user",
        status="active",
        last_login=datetime.utcnow(),
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

    # Success: update last_login and log activity
    user.last_login = datetime.utcnow()
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
        if not user:
            user = User(
                name=profile.get("name") or profile["email"].split("@")[0],
                email=profile["email"].lower(),
                google_sub=profile["sub"],
                role="user",
                status="active",
                last_login=datetime.utcnow(),
            )
            db.add(user)
        else:
            if not user.google_sub:
                user.google_sub = profile["sub"]
            user.last_login = datetime.utcnow()

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
