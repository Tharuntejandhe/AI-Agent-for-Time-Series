import pandas as pd
import numpy as np
import torch
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

# ==== Load and preprocess the daily sales data ====
sold_data = pd.read_csv("G:/AI Agent for Time Series/backend/agent/maggie.csv", parse_dates=['date'], dayfirst=True)
sold_data = sold_data.set_index('date').asfreq('D').reset_index()

# Extract data
all_data = sold_data['sales'].values.astype(float)
test_data_size = 30
train_data = all_data[:-test_data_size]
test_data = all_data[-test_data_size:]

# Normalize data
scaler = MinMaxScaler(feature_range=(-1, 1))
train_data_normalized = scaler.fit_transform(train_data.reshape(-1, 1))
train_data_normalized = torch.FloatTensor(train_data_normalized).view(-1)

# ==== Create sequences ====
train_window = 30

def create_inout_sequences(input_data, window):
    inout_seq = []
    L = len(input_data)
    for i in range(L - window):
        train_seq = input_data[i:i+window]
        train_label = input_data[i+window:i+window+1]
        inout_seq.append((train_seq ,train_label))
    return inout_seq

train_inout_seq = create_inout_sequences(train_data_normalized, train_window)

# ==== LSTM Model ====
import torch.nn as nn

class LSTM(nn.Module):
    def __init__(self, input_size=1, hidden_layer_size=128, num_layers=2, output_size=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_layer_size, num_layers=num_layers)
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq.view(len(input_seq), 1, -1))
        predictions = self.linear(lstm_out[:, -1, :])
        return predictions[-1]

model = LSTM()
loss_function = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# ==== Train model ====
epochs = 300
for i in range(epochs):
    for seq, labels in train_inout_seq:
        optimizer.zero_grad()
        y_pred = model(seq)
        single_loss = loss_function(y_pred, labels)
        single_loss.backward()
        optimizer.step()
    if i % 25 == 1:
        print(f'epoch: {i:3} loss: {single_loss.item():10.8f}')
print(f'Final epoch: {epochs} loss: {single_loss.item():10.8f}')

# ==== Forecast next 30 days ====
fut_pred = 30
test_inputs = train_data_normalized[-train_window:].tolist()
model.eval()

for i in range(fut_pred):
    seq = torch.FloatTensor(test_inputs[-train_window:])
    with torch.no_grad():
        test_inputs.append(model(seq).item())

actual_predictions = scaler.inverse_transform(np.array(test_inputs[train_window:]).reshape(-1, 1))

# ==== Plot the forecast ====
x = pd.date_range(sold_data['date'].iloc[-1] + pd.Timedelta(days=1), periods=fut_pred)
plt.figure(figsize=(12, 6))
plt.plot(sold_data['date'], sold_data['sales'], label="Historical")
plt.plot(x, actual_predictions, label="LSTM Forecast", linestyle="--")
plt.legend()
plt.title("Sales Forecast using LSTM")
plt.xlabel("Date")
plt.ylabel("Sales")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# ==== Prophet ====
from prophet import Prophet
from prophet.plot import plot_plotly, plot_components_plotly
import plotly.io as pio
pio.renderers.default = "browser"

prophet_data = sold_data.rename(columns={'date': 'ds', 'sales': 'y'})

m = Prophet()
m.fit(prophet_data)

future = m.make_future_dataframe(periods=30, freq='D')
forecast = m.predict(future)

fig1 = plot_plotly(m, forecast)
fig1.show()

try:
    fig1.write_html("forecast.html")
    print("Forecast HTML saved.")
except Exception as e:
    print("Save failed:", e)

fig2 = plot_components_plotly(m, forecast)
fig2.show()
