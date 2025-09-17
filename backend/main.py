from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.db.base import Base # Import Base
from app.db.db import engine # Import engine

Base.metadata.create_all(engine)
# This command will create the tables if they don't exist.
# Alembic is the preferred way for migrations, but this is good for initial setup.
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Billiards One API",
    description="API for managing billiards cafes.",
    version="1.0.0"
)

# --- CORS Middleware Setup ---
# This is the new section to add.
# It defines which frontend URLs are allowed to make requests to the backend.

origins = [
    "http://localhost:5173", # Default for Vite + React
    "http://10.79.44.88:5173",
    # "http://127.0.0.1:8000/api/v1/auth/login"
    # Add your deployed frontend URL here when you go to production
    # "*"
    "https://billiardsone.in",        # Aapka live domain
    "https://www.billiardsone.in",    # "www" version
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Billiards One!"}
