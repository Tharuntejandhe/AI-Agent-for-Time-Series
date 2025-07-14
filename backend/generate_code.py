import os
import pandas as pd
import numpy as np
from datetime import datetime
import subprocess

def summarize_csv_data(filename):
    csv_path = os.path.join("backend", "files", filename)
    df = pd.read_csv(csv_path)

    summary = f"# Forecast Summary for {filename}\n\n"
    summary += f"Dataset contains {len(df)} records with columns: {', '.join(df.columns)}\n\n"

    if 'Month' in df.columns:
        df['Month'] = pd.to_datetime(df['Month'])
        summary += f"Date range: {df['Month'].min().strftime('%Y-%m')} to {df['Month'].max().strftime('%Y-%m')}\n\n"

    if 'Passengers' in df.columns:
        summary += f"Average Passengers: {df['Passengers'].mean():.2f}\n"
        summary += f"Min Passengers: {df['Passengers'].min()} | Max Passengers: {df['Passengers'].max()}\n"

    summary += "\n12-Month Forecast generated using:\n- LSTM Neural Network\n- Facebook Prophet\n\n"
    summary += "Forecast images and interactive HTML have been saved in the outputs directory.\n"

    return summary

def call_ollama(summary_text):
    prompt_path = os.path.join("backend", "outputs", "forecast_prompt.txt")
    with open(prompt_path, "w") as f:
        f.write("Generate a business-style report based on the following:\n\n")
        f.write(summary_text)

    print("Calling Ollama for report generation...\n")
    subprocess.run([
        "ollama", "run", "llama3", "<", prompt_path
    ], shell=True)

if __name__ == "__main__":
    filename = "boost.csv"
    summary = summarize_csv_data(filename)
    call_ollama(summary)
