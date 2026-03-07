from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.articles import router as articles_router

app = FastAPI(title="underthecode API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles_router, prefix="/api")
