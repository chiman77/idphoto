import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.process import router as process_router
import uvicorn

app = FastAPI(title="ID Photo Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Serve frontend static files
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"ID Photo Generator running at http://localhost:{port}")
    print("Press Ctrl+C to stop")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
