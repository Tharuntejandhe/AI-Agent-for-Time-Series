# lstm_model.py
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
import numpy as np

# Data Preprocessing
sold_data = pd.read_csv("../files/boost.csv", parse_dates=['Month'])
sold_data['Month'] = pd.to_datetime(sold_data['Month'])
all_data = sold_data['Passengers'].values.astype(float)

test_data_size = 12
train_data = all_data[:-test_data_size]
test_data = all_data[-test_data_size:]

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
    def __init__(self, input_size=1, hidden_layer_size=128, num_layers=2, output_size=1):
        super().__init__()
        self.hidden_layer_size = hidden_layer_size
        self.lstm = nn.LSTM(input_size, hidden_layer_size, num_layers=num_layers)
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq.view(len(input_seq), 1, -1))
        predictions = self.linear(lstm_out[:, -1, :])
        return predictions[-1]

model = LSTM()
loss_function = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

epochs = 500
for i in range(epochs):
    for seq, labels in train_inout_seq:
        optimizer.zero_grad()
        y_pred = model(seq)
        loss = loss_function(y_pred, labels)
        loss.backward()
        optimizer.step()

    if i % 25 == 1:
        print(f'Epoch {i}, Loss: {loss.item():.6f}')

print(f'Final Epoch {epochs}, Loss: {loss.item():.6f}')

# Future Predictions
model.eval()
fut_pred = 12
test_inputs = train_data_normalized[-train_window:].tolist()

for i in range(fut_pred):
    seq = torch.FloatTensor(test_inputs[-train_window:])
    with torch.no_grad():
        test_inputs.append(model(seq).item())

actual_predictions = scaler.inverse_transform(np.array(test_inputs[train_window:]).reshape(-1, 1))
print("Predictions:\n", actual_predictions)
