from pydantic import BaseModel


class Article(BaseModel):
    slug: str
    title: str
    description: str
    tags: list[str]
