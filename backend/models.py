import os
import pandas as pd
import torch
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
from prophet import Prophet
from prophet.plot import plot_plotly, plot_components_plotly
from pastplotter import future_plot, plot_decompose
import torch.nn as nn

def run_forecasting(filename: str):
    # Set up file paths
    base_dir = os.path.dirname(_file_)
    csv_path = os.path.join(base_dir, "files", filename)
    output_dir = os.path.join(base_dir, "outputs")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"{csv_path} does not exist.")

    os.makedirs(output_dir, exist_ok=True)
    if not filename.endswith('.csv'):
        raise ValueError("Provided file is not a CSV.")

# Load data
    sold_data = pd.read_csv(csv_path, parse_dates=['Month'])
    sold_data['Month'] = pd.to_datetime(sold_data['Month'])
    all_data = sold_data['Passengers'].values.astype(float)

    test_data_size = 12
    train_data = all_data[:-test_data_size]
    scaler = MinMaxScaler(feature_range=(-1, 1))
    train_data_normalized = scaler.fit_transform(train_data.reshape(-1, 1))
    train_data_normalized = torch.FloatTensor(train_data_normalized).view(-1)

    train_window = 12
    def create_inout_sequences(input_data, window):
        inout_seq = []
        L = len(input_data)
        for i in range(L - window):
            train_seq = input_data[i:i + window]
            train_label = input_data[i + window:i + window + 1]
            inout_seq.append((train_seq, train_label))
        return inout_seq

    train_inout_seq = create_inout_sequences(train_data_normalized, train_window)

    # LSTM Model
    class LSTM(nn.Module):
        def _init_(self, input_size=1, hidden_layer_size=128, num_layers=2, output_size=1):
            super()._init_()
            self.lstm = nn.LSTM(input_size, hidden_layer_size, num_layers=num_layers)
            self.linear = nn.Linear(hidden_layer_size, output_size)

        def forward(self, input_seq):
            lstm_out, _ = self.lstm(input_seq.view(len(input_seq), 1, -1))
            predictions = self.linear(lstm_out[-1])
            return predictions

    model = LSTM()
    loss_function = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    epochs = 300

    for i in range(epochs):
        for seq, labels in train_inout_seq:
            optimizer.zero_grad()
            y_pred = model(seq)
            loss = loss_function(y_pred, labels)
            loss.backward()
            optimizer.step()

    # Forecast with LSTM
    model.eval()
    test_inputs = train_data_normalized[-train_window:].tolist()
    for _ in range(12):
        seq = torch.FloatTensor(test_inputs[-train_window:])
        with torch.no_grad():
            test_inputs.append(model(seq).item())
    actual_predictions = scaler.inverse_transform(np.array(test_inputs[train_window:]).reshape(-1, 1))

    # Plot LSTM predictions
    x = np.arange(len(all_data), len(all_data) + 12)
    train_df = pd.DataFrame(sold_data['Passengers'][:-12])
    actual_df = pd.DataFrame(actual_predictions, columns=['passengers'])
    new_predict = pd.concat([train_df, actual_df]).reset_index(drop=True)

    future_plot(x, new_predict, sold_data, filename)
    plt.savefig(os.path.join(output_dir, f"{filename}+_future_plot.png"), dpi=300, bbox_inches='tight')
    plt.close()

    # Decomposition
    from statsmodels.tsa.seasonal import seasonal_decompose
    decomposition = seasonal_decompose(sold_data['Passengers'], period=12)
    plot_decompose(decomposition,filename)
    plt.savefig(os.path.join(output_dir, f"{filename}+_decompose_plot.png"), dpi=300, bbox_inches='tight')
    plt.close()

    # Prophet forecast
    prophet_df = sold_data.rename(columns={'Month': 'ds', 'Passengers': 'y'})
    m = Prophet()
    m.fit(prophet_df)
    future = m.make_future_dataframe(periods=12)
    forecast = m.predict(future)

    # Save Prophet HTML
    fig = plot_plotly(m, forecast)
    fig.write_html(os.path.join(output_dir, f"{filename}+_forecast.html"))