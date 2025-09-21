import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Import the live data to give the AI context
from .data_loader import combined_df

# --- Configuration ---
load_dotenv()
router = APIRouter()

try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini AI model for Optimizer configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini AI for Optimizer: {e}")
    model = None

# This defines the structure of the incoming request from the frontend
class OptimizerRequest(BaseModel):
    targetSPC: float
    targetQuality: float
    maxTSR: float

# --- AI Optimizer Endpoint ---
@router.post("/ai/optimize")
async def get_optimization_plan(request: OptimizerRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Gemini AI model is not configured.")

    try:
        # Get the most recent row of data for current context
        latest_data = combined_df.tail(1).to_dict(orient='records')[0]

        # --- Advanced Prompt Engineering for Optimization ---
        prompt = f"""
        **ROLE:** You are a master Process Optimization Engineer for a cement plant.

        **TASK:** Generate a concise, actionable control plan to help the operator move from the 'Current State' to their desired 'Target State'.

        **CURRENT PLANT STATE (LIVE DATA):**
        - Specific Power Consumption (SPC): {latest_data['spc']:.2f} kWh/t
        - Clinker Quality Index: {latest_data['clinker_quality']:.2f}%
        - Thermal Substitution Rate (TSR): {latest_data['tsr']:.2f}%

        **OPERATOR'S TARGETS:**
        - Target SPC: {request.targetSPC} kWh/t
        - Target Clinker Quality: {request.targetQuality}%
        - Maximum allowable TSR: {request.maxTSR}%

        **YOUR RECOMMENDATION:**
        Based on the difference between the current state and the targets, provide a clear, bulleted list of 2-4 specific, numerical adjustments to the following control parameters:
        - Kiln Feed Rate
        - Separator Speed
        - Coal Feed Rate
        - Airflow

        Start your response with a brief summary of the goal, then provide the bulleted list of actions.
        """

        response = await model.generate_content_async(prompt)

        return {"recommendation": response.text}

    except Exception as e:
        print(f"Error during AI optimization: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the optimization plan: {e}")