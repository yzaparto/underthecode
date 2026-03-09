from typing import Optional

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query

from app.db import get_pool

router = APIRouter()


class VoteRequest(BaseModel):
    animation_id: str
    vote_type: str  # "up", "down", or "none" to remove vote
    session_id: str


@router.post("/votes")
async def vote(body: VoteRequest) -> dict:
    animation_id = body.animation_id
    vote_type = body.vote_type
    session_id = body.session_id

    if vote_type not in ("up", "down", "none"):
        raise HTTPException(400, "vote_type must be 'up', 'down', or 'none'")
    if not animation_id or "/" not in animation_id:
        raise HTTPException(400, "animation_id must be format 'series/index'")
    if not session_id:
        raise HTTPException(400, "session_id is required")

    pool = get_pool()

    async with pool.acquire() as conn:
        if vote_type == "none":
            await conn.execute(
                "DELETE FROM votes WHERE animation_id = $1 AND session_id = $2",
                animation_id, session_id,
            )
        else:
            await conn.execute(
                """
                INSERT INTO votes (animation_id, session_id, vote_type)
                VALUES ($1, $2, $3)
                ON CONFLICT (animation_id, session_id)
                DO UPDATE SET vote_type = EXCLUDED.vote_type
                """,
                animation_id, session_id, vote_type,
            )

    return {"ok": True, "animation_id": animation_id, "vote_type": vote_type}


@router.get("/votes")
async def get_votes(
    animation_ids: str,
    session_id: Optional[str] = Query(default=None),
) -> dict:
    ids = [x.strip() for x in animation_ids.split(",") if x.strip()]
    if not ids:
        return {}

    pool = get_pool()

    placeholders = ", ".join(f"${i+1}" for i in range(len(ids)))
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"""
            SELECT animation_id, vote_type, session_id
            FROM votes
            WHERE animation_id IN ({placeholders})
            """,
            *ids,
        )

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
        if sid == session_id:
            result[aid]["user_vote"] = vtype

    return result
