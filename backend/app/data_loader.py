# This is the full content for backend/app/data_loader.py

import pandas as pd
from pathlib import Path

print("Attempting to load data...")
DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data"

try:
    clinker_df = pd.read_csv(DATA_PATH / "clinker.csv")
    energy_df = pd.read_csv(DATA_PATH / "energy.csv")
    fuel_mix_df = pd.read_csv(DATA_PATH / "fuel_mix.csv")

    combined_df = pd.concat([
        clinker_df.drop('timestamp', axis=1), 
        energy_df.drop('timestamp', axis=1), 
        fuel_mix_df.drop('timestamp', axis=1)
    ], axis=1)

    DATA_LENGTH = len(combined_df)
    print("Data loaded successfully!")
except FileNotFoundError as e:
    print(f"Error: Data file not found. {e}")
    combined_df = pd.DataFrame()
    DATA_LENGTH = 0