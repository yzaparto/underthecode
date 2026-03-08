import uuid
from typing import Optional

import aiosqlite
from pydantic import BaseModel
from fastapi import APIRouter, Cookie, Response, HTTPException

from app.db import DB_PATH

router = APIRouter()

COOKIE_NAME = "vote_session"
COOKIE_MAX_AGE = 365 * 24 * 60 * 60  # 1 year


class VoteRequest(BaseModel):
    animation_id: str
    vote_type: str  # "up", "down", or "none" to remove vote


def get_or_create_session(
    vote_session: Optional[str],
    response: Response,
) -> str:
    if vote_session:
        return vote_session
    session_id = str(uuid.uuid4())
    response.set_cookie(
        key=COOKIE_NAME,
        value=session_id,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return session_id


@router.post("/votes")
async def vote(
    body: VoteRequest,
    response: Response,
    vote_session: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
) -> dict:
    animation_id = body.animation_id
    vote_type = body.vote_type
    if vote_type not in ("up", "down", "none"):
        raise HTTPException(400, "vote_type must be 'up', 'down', or 'none'")
    if not animation_id or "/" not in animation_id:
        raise HTTPException(400, "animation_id must be format 'series/index'")

    session_id = get_or_create_session(vote_session, response)

    async with aiosqlite.connect(DB_PATH) as db:
        if vote_type == "none":
            await db.execute(
                "DELETE FROM votes WHERE animation_id = ? AND session_id = ?",
                (animation_id, session_id),
            )
        else:
            await db.execute(
                """
                INSERT INTO votes (animation_id, session_id, vote_type)
                VALUES (?, ?, ?)
                ON CONFLICT (animation_id, session_id) DO UPDATE SET vote_type = excluded.vote_type
                """,
                (animation_id, session_id, vote_type),
            )
        await db.commit()

    return {"ok": True, "animation_id": animation_id, "vote_type": vote_type}


@router.get("/votes")
async def get_votes(
    animation_ids: str,
    vote_session: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
) -> dict:
    ids = [x.strip() for x in animation_ids.split(",") if x.strip()]
    if not ids:
        return {}

    placeholders = ",".join("?" * len(ids))
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            f"""
            SELECT animation_id, vote_type, session_id
            FROM votes
            WHERE animation_id IN ({placeholders})
            """,
            ids,
        )
        rows = await cursor.fetchall()

    result: dict[str, dict] = {}
    for aid in ids:
        result[aid] = {"up": 0, "down": 0, "user_vote": None}

    for row in rows:
        aid = row["animation_id"]
        vtype = row["vote_type"]
        sid = row["session_id"]
        if aid not in result:
            result[aid] = {"up": 0, "down": 0, "user_vote": None}
        result[aid][vtype] = result[aid].get(vtype, 0) + 1
        if sid == vote_session:
            result[aid]["user_vote"] = vtype

    return result
