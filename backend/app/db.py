import os

import asyncpg

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/postgres",
)

pool: asyncpg.Pool | None = None


async def init_db() -> asyncpg.Pool:
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                animation_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                PRIMARY KEY (animation_id, session_id)
            )
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_votes_animation ON votes(animation_id)
        """)
    return pool


async def close_db() -> None:
    global pool
    if pool:
        await pool.close()
        pool = None


def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    return pool
