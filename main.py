"""FastAPI application setup and configuration"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes import router

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

# Include API routes
app.include_router(router)

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
