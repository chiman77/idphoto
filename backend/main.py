from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.process import router as process_router

app = FastAPI(title="ID Photo Generator API", version="0.1.0")

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
