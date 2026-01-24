"""FastAPI application setup and configuration"""
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes_baseline import router as baseline_router
from backend.routes_tt import router as tt_router

app = FastAPI(
    title="Team Topologies API",
    description="API for visualizing and managing team topologies",
    version="1.0.0"
)

# Log which data directories are being used at startup
@app.on_event("startup")
async def startup_event():
    tt_variant = os.getenv("TT_TEAMS_VARIANT", "tt-teams")
    tt_dir = Path("data") / tt_variant
    baseline_dir = Path("data/baseline-teams")

    print("\n" + "=" * 80)
    print("🚀 Team Topologies Visualizer Starting Up")
    print("=" * 80)
    print(f"📂 TT Design Teams Directory: {tt_dir.absolute()}")
    print(f"   Files found: {len(list(tt_dir.glob('*.md')))}")
    print(f"📂 Baseline Teams Directory: {baseline_dir.absolute()}")
    print(f"   Files found: {len(list(baseline_dir.rglob('*.md')))}")
    print(f"🔧 Environment: TT_TEAMS_VARIANT={os.getenv('TT_TEAMS_VARIANT', 'NOT SET (using default: tt-teams)')}")
    print("=" * 80 + "\n")

# CORS middleware to allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes with prefixes
app.include_router(baseline_router)  # /api/baseline/*
app.include_router(tt_router)        # /api/tt/*

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
