import os

import aiosqlite
from pathlib import Path

DB_PATH = Path(os.environ.get("DB_PATH", Path(__file__).parent.parent / "data" / "votes.db"))


async def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                animation_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                PRIMARY KEY (animation_id, session_id)
            )
        """)
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_votes_animation ON votes(animation_id)"
        )
        await db.commit()
