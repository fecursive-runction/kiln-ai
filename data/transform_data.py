# data/transform_data.py
# This script reads the raw data from the Kaggle dataset, synthesizes missing KPIs,
# and saves the processed data into the four separate CSV files required by the project.

import pandas as pd
import numpy as np

# --- Configuration ---
RAW_DATA_PATH = "data/cement_manufacturing_dataset.csv"
OUTPUT_DIR = "."  # Use the current directory, which is the 'data' folder

def transform_and_save_data():
    """
    Reads the raw data, synthesizes new KPIs, and saves them to the
    project's specific CSV files.
    """
    print("Starting data transformation...")

    try:
        # 1. Read the raw Kaggle dataset
        # The engine is set to 'python' to handle potential parsing issues with the CSV
        df = pd.read_csv(RAW_DATA_PATH, engine='python')
        print(f"Successfully loaded raw data from '{RAW_DATA_PATH}'. Shape: {df.shape}\n")

        # --- IMPORTANT: The following column mapping is based on your specific CSV file ---
        column_mapping = {
            'strength': 'clinker_quality',
            'cement': 'cement',
            'slag': 'blast_furnace_slag',
            'fly_ash': 'fly_ash',
            'water': 'water',
            'superplastic': 'superplasticizer',
            'coarseagg': 'coarse_aggregate',
            'fineagg': 'fine_aggregate',
            'age': 'age'
        }

        # Rename columns using the mapping
        df.rename(columns=column_mapping, inplace=True)
        
        # 3. Add a timestamp column to simulate time-series data
        date_range = pd.date_range(start='2022-01-01', periods=len(df), freq='H')
        df.insert(0, 'timestamp', date_range)

        # 4. Synthesize missing KPIs based on the available data
        
        # Synthesize SPC (Specific Power Consumption) as a function of cement and water
        # This is a mock formula to create a realistic-looking time series.
        df['spc'] = 800 + (df['cement'] * 0.2) + (df['water'] * 0.1) + np.random.normal(0, 5, len(df))
        df['spc'] = df['spc'].round(2)

        # Synthesize TSR (Thermal Substitution Rate) as a randomized value
        df['tsr'] = np.random.uniform(20, 35, len(df)).round(2)
        
        # Synthesize CO2 emissions based on cement and fly ash amounts
        df['co2'] = (df['cement'] * 0.05 + df['fly_ash'] * 0.01 + np.random.normal(0, 0.01, len(df))).round(3)
        
        # Synthesize a mock 'coal_feed_rate' and 'airflow' for utilities.csv
        df['coal_feed_rate'] = (np.random.uniform(10, 15, len(df)) + (df['spc'] / 100)).round(2)
        df['airflow'] = (np.random.uniform(500, 600, len(df)) - (df['tsr'] * 2)).round(2)

        # --- 5. Save the data to the specific CSV files ---

        # clinker.csv: timestamp, clinker_quality
        clinker_df = df[['timestamp', 'clinker_quality']]
        clinker_df.to_csv(f'{OUTPUT_DIR}/clinker.csv', index=False)
        print(f"Generated 'clinker.csv'. Shape: {clinker_df.shape}")

        # energy.csv: timestamp, spc, co2
        energy_df = df[['timestamp', 'spc', 'co2']]
        energy_df.to_csv(f'{OUTPUT_DIR}/energy.csv', index=False)
        print(f"Generated 'energy.csv'. Shape: {energy_df.shape}")

        # fuel_mix.csv: timestamp, tsr
        fuel_mix_df = df[['timestamp', 'tsr']]
        fuel_mix_df.to_csv(f'{OUTPUT_DIR}/fuel_mix.csv', index=False)
        print(f"Generated 'fuel_mix.csv'. Shape: {fuel_mix_df.shape}")

        # utilities.csv: timestamp, coal_feed_rate, airflow
        utilities_df = df[['timestamp', 'coal_feed_rate', 'airflow']]
        utilities_df.to_csv(f'{OUTPUT_DIR}/utilities.csv', index=False)
        print(f"Generated 'utilities.csv'. Shape: {utilities_df.shape}")

        print("\nAll data files have been successfully generated.")

    except FileNotFoundError:
        print(f"Error: The file '{RAW_DATA_PATH}' was not found.")
        print("Please ensure you have downloaded the dataset and placed it in the 'data' directory.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    transform_and_save_data()
