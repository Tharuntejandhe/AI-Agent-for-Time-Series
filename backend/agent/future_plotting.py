# future_plotting.py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pastplotter import future_plot  # Ensure pastplotter is installed or implemented

def plot_lstm_predictions(sold_data, actual_predictions, train_window):
    x = np.arange(len(sold_data), len(sold_data) + len(actual_predictions))
    train_df = pd.DataFrame(sold_data['Passengers'][:-train_window])
    actual_df = pd.DataFrame(actual_predictions, columns=['passengers'])
    new_predict = pd.concat([train_df, actual_df]).reset_index(drop=True)
    future_plot(x, new_predict, sold_data, train_window)

