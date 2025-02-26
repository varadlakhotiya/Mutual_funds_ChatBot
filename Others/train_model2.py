import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.model_selection import train_test_split

# Load processed data
def load_processed_data(filename):
    df = pd.read_csv(filename)
    return df

# Prepare the data for LSTM
def prepare_data(df, n_lags=5):
    X = df[[f'lag_{i}' for i in range(1, n_lags + 1)]].values
    y = df['Net Asset Value'].values
    X = X.reshape((X.shape[0], X.shape[1], 1))  # Reshape for LSTM
    return X, y

# Build the LSTM model
def build_model(input_shape):
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=False, input_shape=input_shape))
    model.add(Dropout(0.2))  # Dropout for regularization
    model.add(Dense(units=1))  # Output layer
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Train the model
def train_model():
    # Load the preprocessed data
    df = load_processed_data('processed_nav.csv')
    
    # Train a separate model for each fund
    for fund_name, fund_data in df.groupby('Fund Name'):
        print(f'Training model for {fund_name}')
        
        # Prepare the data for training
        X, y = prepare_data(fund_data)
        
        # Split the data into training and test sets (80% train, 20% test)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        # Build the LSTM model
        model = build_model((X_train.shape[1], 1))
        
        # Train the model
        model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))
        
        # Save the trained model for each fund
        model.save(f'{fund_name}_nav_prediction_model.h5')
        print(f'Model for {fund_name} saved successfully.')

if __name__ == '__main__':
    train_model()
