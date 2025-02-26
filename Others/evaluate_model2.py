import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_absolute_error, mean_squared_error
import math

# Load the model
def load_trained_model(model_file):
    model = load_model(model_file)
    return model

# Load processed data
def load_processed_data(filename):
    df = pd.read_csv(filename)
    return df

# Prepare the data for evaluation
def prepare_data(df, n_lags=5):
    X = df[[f'lag_{i}' for i in range(1, n_lags + 1)]].values
    y = df['Net Asset Value'].values
    X = X.reshape((X.shape[0], X.shape[1], 1))  # Reshape for LSTM
    return X, y

# Evaluate the model
def evaluate_model():
    # Load the processed data
    df = load_processed_data('processed_nav.csv')
    
    # Evaluate each model for each fund
    for fund_name, fund_data in df.groupby('Fund Name'):
        print(f'Evaluating model for {fund_name}')
        
        # Load the trained model for this fund
        model = load_trained_model(f'{fund_name}_nav_prediction_model.h5')
        
        # Prepare the data for evaluation
        X, y = prepare_data(fund_data)
        
        # Predict the NAV values
        predictions = model.predict(X)
        
        # Denormalize predictions
        predictions = predictions.flatten()  # Flatten for easier comparison
        
        # Calculate performance metrics
        mae = mean_absolute_error(y, predictions)
        rmse = math.sqrt(mean_squared_error(y, predictions))
        
        print(f'Mean Absolute Error for {fund_name}: {mae}')
        print(f'Root Mean Squared Error for {fund_name}: {rmse}')
        
        # Optional: Plot the actual vs predicted values
        import matplotlib.pyplot as plt
        plt.plot(fund_data['NAV date'], y, color='blue', label='Actual NAV')
        plt.plot(fund_data['NAV date'], predictions, color='red', label='Predicted NAV')
        plt.xlabel('Date')
        plt.ylabel('Net Asset Value (NAV)')
        plt.title(f'NAV Prediction for {fund_name}')
        plt.legend()
        plt.show()

if __name__ == '__main__':
    evaluate_model()
