import os
import sys
import webbrowser
import threading

# Handle PyInstaller frozen mode path resolution
def _get_base_dir():
    """Get base directory - works in both dev and PyInstaller frozen mode."""
    if getattr(sys, "frozen", False):
        # PyInstaller onedir: sys._MEIPASS points to _internal directory
        return sys._MEIPASS
    else:
        # Normal Python execution
        return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = _get_base_dir()

# Add backend to path
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

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
frontend_dist = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    print(f"[WARN] Frontend dist not found at: {frontend_dist}")
    print("[WARN] The server will start but frontend won't be served.")

def open_browser():
    """Open browser after a short delay to let the server start."""
    import time
    time.sleep(1.5)
    webbrowser.open(f"http://localhost:{port}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print("=" * 50)
    print("  ID Photo Generator - 证件照生成器")
    print("=" * 50)
    print(f"  Running at: http://localhost:{port}")
    print(f"  Press Ctrl+C to stop the server")
    print("=" * 50)

    # Auto-open browser in background
    threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
