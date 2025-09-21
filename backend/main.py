from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import api, streaming, reports, chatbot, optimizer

app = FastAPI()

# This is the crucial part for allowing your frontend to connect
origins = [
    "http://localhost:5173", # For local development
    # The URL of your deployed frontend will be added by Render/Vercel automatically
    # Or you can add it manually if needed, e.g., "https://kiln-ai-frontend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for simplicity, can be restricted to origins list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all your API routers
app.include_router(api.router, prefix="/api")
app.include_router(streaming.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(optimizer.router, prefix="/api")

@app.get("/api")
def read_root():
    return {"message": "Welcome to the Cement-AI Backend!"}