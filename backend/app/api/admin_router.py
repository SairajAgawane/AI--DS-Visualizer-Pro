from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.history import OperationHistory
from app.models.login_activity import LoginActivity
from app.models.user import User

router = APIRouter()
TOKEN_SECRET = os.getenv("AUTH_SECRET", "change-this-local-secret")


def _verify_admin(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
        )
    raw_token = authorization.split("Bearer ", 1)[1].strip()
    try:
        parts = raw_token.split(".")
        if len(parts) != 2:
            raise ValueError()
        raw_b64, signature = parts
        expected_sig = hmac.new(TOKEN_SECRET.encode(), raw_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError()
        padding = "=" * (-len(raw_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(raw_b64 + padding).decode())
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError()
        if getattr(user, "role", "user") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You do not have administrator permissions.",
            )
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


class UpdateStatusRequest(BaseModel):
    status: str  # "active" | "inactive"


@router.get("/stats")
def get_admin_stats(admin: User = Depends(_verify_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "active").count()
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users = db.query(User).filter(User.created_at >= week_ago).count()
    login_sessions = db.query(LoginActivity).filter(LoginActivity.status == "success").count()

    return {
        "success": True,
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "new_users": new_users,
            "login_sessions": login_sessions,
        },
    }


@router.get("/users")
def get_admin_users(admin: User = Depends(_verify_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    result = []
    for u in users:
        # Calculate completed programs from operation_history if available
        op_count = db.query(OperationHistory).filter(OperationHistory.user_id == str(u.id)).count()
        last_login_formatted = (
            u.last_login.strftime("%d %b %Y, %I:%M %p")
            if getattr(u, "last_login", None)
            else "Never"
        )
        reg_date_formatted = (
            u.created_at.strftime("%d %b %Y")
            if getattr(u, "created_at", None)
            else "Unknown"
        )

        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": getattr(u, "role", "user") or "user",
            "status": getattr(u, "status", "active") or "active",
            "registration_date": reg_date_formatted,
            "last_login": last_login_formatted,
            "raw_created_at": u.created_at.isoformat() if u.created_at else None,
            "raw_last_login": u.last_login.isoformat() if u.last_login else None,
            "programs_completed": op_count,
            "current_streak": max(1, min(7, op_count)),
        })

    return {"success": True, "users": result}


@router.get("/login-activity")
def get_login_activity(admin: User = Depends(_verify_admin), db: Session = Depends(get_db)):
    activities = (
        db.query(LoginActivity)
        .order_by(LoginActivity.login_time.desc())
        .limit(100)
        .all()
    )
    result = []
    for a in activities:
        result.append({
            "id": a.id,
            "user_id": a.user_id,
            "user": a.user_name or (a.email.split("@")[0] if a.email else "Unknown"),
            "email": a.email,
            "role": a.role,
            "login_time": a.login_time.strftime("%d %b %Y, %I:%M %p"),
            "status": "Successful" if a.status == "success" else "Failed",
            "raw_status": a.status,
        })
    return {"success": True, "activities": result}


@router.post("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    req: UpdateStatusRequest,
    admin: User = Depends(_verify_admin),
    db: Session = Depends(get_db),
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change status of currently logged in admin")

    if req.status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    target_user.status = req.status
    db.commit()
    db.refresh(target_user)
    return {"success": True, "user_id": target_user.id, "status": target_user.status}
