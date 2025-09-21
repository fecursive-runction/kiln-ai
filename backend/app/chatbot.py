import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import pandas as pd

# Import the live data to give the AI context
from .data_loader import combined_df

# --- Configuration ---
load_dotenv()
router = APIRouter()

try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini AI model configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini AI: {e}")
    model = None

class ChatRequest(BaseModel):
    message: str

# --- AI Chat Endpoint (Upgraded Persona) ---
@router.post("/ai/chat")
async def get_ai_response(request: ChatRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Gemini AI model is not configured. Check API key.")

    try:
        # Get recent data for context
        recent_data = combined_df.tail(20)
        if recent_data.empty:
            # Provide a fallback if data isn't ready, without crashing
            latest_data_summary = "Plant data is not yet available. Please try again in a moment."
        else:
            avg_spc = recent_data['spc'].mean()
            latest_data = recent_data.iloc[-1]
            latest_data_summary = f"""
            - Specific Power Consumption (SPC): The current reading is {latest_data['spc']:.2f} kWh/t, compared to a recent average of {avg_spc:.2f} kWh/t.
            - Thermal Substitution Rate (TSR): Currently at {latest_data['tsr']:.2f}%.
            - Clinker Quality Index: Currently at {latest_data['clinker_quality']:.2f}%.
            """

        # --- THE NEW, HIGHLY-DETAILED MASTER PROMPT ---
        prompt = f"""
        **//-- MASTER PROMPT: AI CO-PILOT PERSONA --//**

        **YOUR PERSONA:**
        You are "Cement-AI," a world-class AI co-pilot for a cement plant operator. Your personality is the perfect blend of professional, polite, calm, and data-driven. You are a trusted partner in the control room.

        **YOUR CORE DIRECTIVES:**
        1.  **BE CONVERSATIONAL:** Always start your response with a polite and natural-sounding acknowledgment. Never just dump data. If the user offers a greeting, return it warmly before proceeding.
        2.  **BE DATA-DRIVEN:** When the user asks a question about operations, seamlessly integrate the provided "Current Plant Data Context" into your response. Don't just list the numbers; explain what they mean.
        3.  **BE PROACTIVE:** If the data indicates a problem (e.g., SPC is trending higher than the average), identify it clearly and suggest a helpful next step or ask a clarifying question.
        4.  **MAINTAIN YOUR PERSONA:** Even when the user's message is simple (like "got it, thank you"), respond gracefully and professionally. End your conversations with a helpful closing remark.

        **CURRENT PLANT DATA CONTEXT:**
        {latest_data_summary}

        **USER'S MESSAGE:**
        "{request.message}"

        **YOUR RESPONSE:**
        """

        response = await model.generate_content_async(prompt)

        return {"reply": response.text}

    except Exception as e:
        print(f"Error during AI generation: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the AI response: {e}")