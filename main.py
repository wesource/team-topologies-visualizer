"""FastAPI application setup and configuration"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes_pre_tt import router as pre_tt_router
from backend.routes_tt import router as tt_router

app = FastAPI(
    title="Team Topologies API",
    description="API for visualizing and managing team topologies",
    version="1.0.0"
)

# CORS middleware to allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes with prefixes
app.include_router(pre_tt_router)  # /api/pre-tt/*
app.include_router(tt_router)      # /api/tt/*

# Serve static frontend files
app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def root():
    """Redirect to static frontend"""
    return {
        "message": "Team Topologies API",
        "docs": "/docs",
        "frontend": "/static/index.html"
    }


@app.get("/api/config")
async def get_config():
    """Get application configuration (e.g., demo mode status)"""
    return {
        "readOnlyMode": os.getenv("READ_ONLY_MODE") == "true"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
