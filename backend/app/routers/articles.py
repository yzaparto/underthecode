from fastapi import APIRouter, HTTPException

from app.models.article import Article

router = APIRouter()

ARTICLES = [
    Article(
        slug="python-asyncio",
        title="Python Asyncio: Concurrency Made Simple",
        description=(
            "Step-by-step interactive animations showing how async/await, "
            "the event loop, and task scheduling actually work under the hood."
        ),
        tags=["python", "concurrency", "asyncio"],
    ),
]

_BY_SLUG = {a.slug: a for a in ARTICLES}


@router.get("/articles")
def list_articles() -> list[Article]:
    return ARTICLES


@router.get("/articles/{slug}")
def get_article(slug: str) -> Article:
    article = _BY_SLUG.get(slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article
