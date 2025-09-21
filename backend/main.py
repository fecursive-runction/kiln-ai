from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Corrected Imports ---
# We now import both 'api' and 'streaming' from the 'app' folder
from app import api, streaming,reports,chatbot, optimizer

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We include both routers, which are now correctly defined
app.include_router(api.router)
app.include_router(streaming.router) 
app.include_router(reports.router)
app.include_router(chatbot.router)
app.include_router(optimizer.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Cement-AI Backend!"}