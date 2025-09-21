import pandas as pd
from fastapi import APIRouter
from pathlib import Path

router = APIRouter()

# Define the path to the data directory, assuming it's one level above the backend folder
DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data"

@router.get("/data/clinker")
def get_clinker_data():
    """
    Reads and returns clinker quality data from clinker.csv.
    """
    file_path = DATA_PATH / "clinker.csv"
    df = pd.read_csv(file_path)
    # Convert dataframe to a list of dictionaries for JSON compatibility
    return df.to_dict(orient="records")

@router.get("/data/energy")
def get_energy_data():
    """
    Reads and returns energy consumption data from energy.csv.
    """
    file_path = DATA_PATH / "energy.csv"
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")

@router.get("/data/fuel_mix")
def get_fuel_mix_data():
    """
    Reads and returns fuel mix data from fuel_mix.csv.
    """
    file_path = DATA_PATH / "fuel_mix.csv"
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")

@router.get("/data/utilities")
def get_utilities_data():
    """
    Reads and returns utilities data from utilities.csv.
    """
    file_path = DATA_PATH / "utilities.csv"
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")