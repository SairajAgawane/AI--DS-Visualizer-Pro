from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, date

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

router = APIRouter()
TOKEN_SECRET = os.getenv("AUTH_SECRET", "change-this-local-secret")


def _get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
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
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )


class RecordExecutionRequest(BaseModel):
    chapter_id: str
    program_id: str
    program_name: str
    completed: bool = True


class SyncProgressRequest(BaseModel):
    current_streak: int | None = None
    longest_streak: int | None = None
    programs_executed: int | None = None
    programs_completed: int | None = None
    chapters_completed: int | None = None
    overall_progress: int | None = None
    learning_sessions: int | None = None
    current_chapter: str | None = None
    current_program: str | None = None
    chapter_progress: dict | None = None
    recent_activity: list | None = None


# Total chapters in curriculum
TOTAL_CHAPTERS = 14
TOTAL_PROGRAMS = 80

DEFAULT_CHAPTER_PROGRESS = {
    "array": 0,
    "stack": 0,
    "queue": 0,
    "circular_queue": 0,
    "linked_list": 0,
    "doubly_linked_list": 0,
    "binary_tree": 0,
    "bst": 0,
    "heap": 0,
    "graph": 0,
    "searching": 0,
    "sorting": 0,
    "hash_table": 0,
    "recursion": 0,
}


def _parse_progress_data(user: User) -> dict:
    try:
        raw = getattr(user, "progress_data", None)
        if raw:
            return json.loads(raw)
    except Exception:
        pass
    return {
        "chapter_progress": dict(DEFAULT_CHAPTER_PROGRESS),
        "executed_programs": [],
        "completed_programs": [],
        "recent_activity": [],
    }


@router.get("/progress")
def get_user_progress(user: User = Depends(_get_current_user)):
    data = _parse_progress_data(user)
    
    return {
        "success": True,
        "profile": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": getattr(user, "role", "user") or "user",
            "createdAt": user.created_at.isoformat() if user.created_at else None,
            "firstLoginAt": user.first_login_at.isoformat() if getattr(user, "first_login_at", None) else (user.created_at.isoformat() if user.created_at else None),
            "lastLoginAt": user.last_login.isoformat() if getattr(user, "last_login", None) else None,
            "lastActiveDate": getattr(user, "last_active_date", None),
            "totalLoginCount": getattr(user, "total_login_count", 1) or 1,
            "currentStreak": getattr(user, "current_streak", 0) or 0,
            "longestStreak": getattr(user, "longest_streak", 0) or 0,
            "overallProgress": getattr(user, "overall_progress", 0) or 0,
            "chaptersCompleted": getattr(user, "chapters_completed", 0) or 0,
            "totalChapters": TOTAL_CHAPTERS,
            "programsExecuted": getattr(user, "programs_executed", 0) or 0,
            "programsCompleted": getattr(user, "programs_completed", 0) or 0,
            "totalPrograms": TOTAL_PROGRAMS,
            "totalExecutionCount": getattr(user, "programs_executed", 0) or 0,
            "learningSessions": getattr(user, "learning_sessions", 0) or 0,
            "currentChapter": getattr(user, "current_chapter", "Not Started") or "Not Started",
            "currentProgram": getattr(user, "current_program", "Not Started") or "Not Started",
            "chapterProgress": data.get("chapter_progress", DEFAULT_CHAPTER_PROGRESS),
            "completedPrograms": data.get("completed_programs", []),
            "recentActivity": data.get("recent_activity", []),
        },
    }


@router.post("/progress/execute")
def record_execution(
    req: RecordExecutionRequest,
    user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    data = _parse_progress_data(user)
    chapter_prog = data.get("chapter_progress", dict(DEFAULT_CHAPTER_PROGRESS))
    executed_progs = set(data.get("executed_programs", []))
    completed_progs = set(data.get("completed_programs", []))
    recent_acts = list(data.get("recent_activity", []))

    prog_key = f"{req.chapter_id}:{req.program_id}"
    executed_progs.add(prog_key)

    if req.completed:
        completed_progs.add(prog_key)

    # Approximate programs per chapter
    chapter_capacity = {
        "array": 6, "stack": 6, "queue": 5, "circular_queue": 5,
        "linked_list": 7, "doubly_linked_list": 6, "binary_tree": 6,
        "bst": 6, "heap": 6, "graph": 6, "searching": 2,
        "sorting": 5, "hash_table": 5, "recursion": 4,
    }
    cap = chapter_capacity.get(req.chapter_id, 5)

    # Count how many programs in this chapter are completed
    completed_in_chap = sum(1 for p in completed_progs if p.startswith(f"{req.chapter_id}:"))
    chap_pct = min(100, round((completed_in_chap / cap) * 100))
    chapter_prog[req.chapter_id] = chap_pct

    # Count completed chapters (at 100% or at least 1 program completed if small)
    chaps_done = sum(1 for cid, pct in chapter_prog.items() if pct >= 100)
    
    # Overall progress = percentage of all 80 programs completed
    overall_pct = min(100, round((len(completed_progs) / TOTAL_PROGRAMS) * 100))

    # Add to recent activity
    now_str = datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    new_act = {
        "title": f"Executed {req.program_name}",
        "chapter": req.chapter_id,
        "program": req.program_id,
        "time": "Just now",
        "timestamp": now_str,
        "status": "SUCCESS",
    }
    recent_acts.insert(0, new_act)
    if len(recent_acts) > 20:
        recent_acts = recent_acts[:20]

    # Save to user model
    user.programs_executed = getattr(user, "programs_executed", 0) + 1
    user.programs_completed = len(completed_progs)
    user.chapters_completed = chaps_done
    user.overall_progress = overall_pct
    user.current_chapter = req.chapter_id
    user.current_program = req.program_name

    updated_data = {
        "chapter_progress": chapter_prog,
        "executed_programs": list(executed_progs),
        "completed_programs": list(completed_progs),
        "recent_activity": recent_acts,
    }
    user.progress_data = json.dumps(updated_data)

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "profile": {
            "id": user.id,
            "programsExecuted": user.programs_executed,
            "programsCompleted": user.programs_completed,
            "chaptersCompleted": user.chapters_completed,
            "overallProgress": user.overall_progress,
            "currentChapter": user.current_chapter,
            "currentProgram": user.current_program,
            "chapterProgress": chapter_prog,
            "recentActivity": recent_acts,
        },
    }
