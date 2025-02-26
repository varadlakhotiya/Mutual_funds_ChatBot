from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib  # Import matplotlib
matplotlib.use('Agg')  # Use a backend suitable for server environments
import matplotlib.pyplot as plt  # Import pyplot after setting the backend
import seaborn as sns
import os
from io import BytesIO
import base64
from datetime import timedelta

# Initialize Flask app
app = Flask(__name__)

# Constants
DATA_FILE = "processed_nav.csv"
MODEL_DIR = "models"  # Directory where trained models are stored

# Load processed data
def load_data():
    data = pd.read_csv(DATA_FILE)
    data['NAV date'] = pd.to_datetime(data['NAV date'])
    return data

# Load LSTM model
def load_model(fund_name):
    model_path = os.path.join(MODEL_DIR, f"{fund_name}_nav_prediction_model.h5")
    return tf.keras.models.load_model(model_path)

# Predict future NAV using LSTM (Soft Computing)
def predict_nav(model, data, prediction_window):
    data = data[['lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5']]  # Select only the necessary columns
    last_sequence = data.iloc[-1].values.reshape(1, 5, 1)  # Use only the last row for prediction

    predictions = []
    for _ in range(prediction_window):
        next_value = model.predict(last_sequence)[0][0]  # Predict the next value
        predictions.append(next_value)
        last_sequence = np.append(last_sequence[:, 1:, :], [[[next_value]]], axis=1)  # Update the sequence
    
    return predictions


@app.route('/predict_nav_for_date', methods=['POST'])
def predict_nav_for_date():
    selected_fund = request.form['fund_name']
    prediction_date = pd.to_datetime(request.form['prediction_date'])

    # Load data and filter for the selected fund
    data = load_data()
    fund_data = data[data['Fund Name'] == selected_fund]
    fund_data = fund_data.sort_values(by="NAV date")

    # Check if the prediction_date is valid
    max_date = fund_data['NAV date'].max()
    if prediction_date <= max_date:
        return jsonify({"error": "Prediction date must be beyond the latest available date."}), 400

    # Prepare data for prediction
    model = load_model(selected_fund)
    last_sequence = fund_data[['lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5']].iloc[-1].values.reshape(1, 5, 1)

    # Predict NAV for the selected date
    prediction_days = (prediction_date - max_date).days
    predicted_nav = predict_nav(model, fund_data[['lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5']], prediction_days)[-1]

    return render_template(
        'predict_nav_date.html',
        selected_fund=selected_fund,
        prediction_date=prediction_date.strftime('%Y-%m-%d'),
        predicted_nav=predicted_nav
    )
def validate_prediction_date(fund_data, prediction_date):
    max_date = fund_data['NAV date'].max()
    if prediction_date <= max_date:
        raise ValueError("Prediction date must be beyond the latest available date.")

# Plot actual vs predicted NAV (Visualization for comparison)
def plot_predictions(actual, predicted, fund_name):
    plt.figure(figsize=(10, 6))
    plt.plot(actual, label="Actual NAV", marker='o')
    plt.plot(predicted, label="Predicted NAV", marker='x')
    plt.title(f"{fund_name} - Actual vs Predicted NAV")
    plt.xlabel("Time")
    plt.ylabel("Normalized NAV")
    plt.legend()
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    return plot_url

# Performance metrics (Soft Computing using error metrics)
def calculate_metrics(actual, predicted):
    mae = mean_absolute_error(actual, predicted)
    rmse = np.sqrt(mean_squared_error(actual, predicted))
    return mae, rmse

# Fuzzy Logic: Investment Advice (Using heuristics based on predicted NAV)
def get_investment_advice(predicted_nav):
    nav_change = (predicted_nav[-1] - predicted_nav[0]) / predicted_nav[0] * 100
    if nav_change > 2:
        return "Recommendation: Buy (NAV is expected to rise)."
    elif nav_change < -2:
        return "Recommendation: Sell (NAV is expected to fall)."
    else:
        return "Recommendation: Hold (NAV is expected to remain stable)."

# Calculate risk (Soft Computing using statistical analysis)
def calculate_risk(data):
    return np.std(data)

# Add Confidence Interval (Prediction Interval)
def get_prediction_interval(predictions, mae, confidence_level=0.95):
    error_margin = mae * 1.96  # Approximate margin of error for 95% confidence interval
    return [predictions[0] - error_margin, predictions[-1] + error_margin]

# Historical Performance Comparison: Benchmark (e.g., Nifty/Sensex)
def plot_benchmark_comparison(actual_nav, benchmark_nav, fund_name, benchmark_name):
    plt.figure(figsize=(10, 6))
    plt.plot(actual_nav, label=f"{fund_name} Actual NAV", marker='o')
    plt.plot(benchmark_nav, label=f"{benchmark_name} Actual NAV", marker='x')
    plt.title(f"{fund_name} vs {benchmark_name} - NAV Comparison")
    plt.xlabel("Time")
    plt.ylabel("NAV")
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    return plot_url

# Portfolio Builder: Risk and Return Calculation
def portfolio_analysis(selected_funds, data, prediction_window=10):
    weights = np.ones(len(selected_funds)) / len(selected_funds)  # Assume equal weight for each fund
    expected_returns = []
    risks = []
    
    for fund in selected_funds:
        fund_data = data[data['Fund Name'] == fund]
        fund_data = fund_data.sort_values(by="NAV date")
        actual_nav = fund_data['Net Asset Value'].values
        predicted_nav = predict_nav(load_model(fund), fund_data[[f'lag_{i}' for i in range(1, 6)]], prediction_window)
        
        # Expected return: average predicted NAV change
        expected_returns.append(np.mean(np.diff(predicted_nav)) / predicted_nav[0])
        risks.append(np.std(np.diff(predicted_nav)))
    
    # Portfolio expected return and risk
    portfolio_return = np.dot(weights, expected_returns)
    portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(np.cov(risks), weights)))  # Portfolio risk as weighted sum of risks
    
    return portfolio_return, portfolio_risk

# Rank Funds
def rank_funds(data, prediction_window):
    fund_ranking = []

    for fund in data['Fund Name'].unique():
        fund_data = data[data['Fund Name'] == fund]
        fund_data = fund_data.sort_values(by="NAV date")

        # Predict NAV using the LSTM model
        model = load_model(fund)
        predicted_nav = predict_nav(model, fund_data[['lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5']], prediction_window)

        # Calculate predicted return: average change in NAV
        predicted_return = np.mean(np.diff(predicted_nav)) / predicted_nav[0]

        # Calculate risk: standard deviation of predicted NAV changes
        risk = np.std(np.diff(predicted_nav))

        fund_ranking.append({
            'Fund Name': fund,
            'Predicted Return': predicted_return,
            'Risk': risk
        })

    # Convert list to DataFrame for easy sorting
    ranking_df = pd.DataFrame(fund_ranking)
    ranking_df = ranking_df.sort_values(by=['Predicted Return', 'Risk'], ascending=[False, True])

    return ranking_df

@app.route('/')
def home():
    data = load_data()
    funds = data['Fund Name'].unique()
    return render_template('index.html', funds=funds)

@app.route('/predict_nav', methods=['POST'])
def predict_nav_view():
    selected_fund = request.form['fund_name']
    prediction_window = int(request.form['prediction_window'])

    data = load_data()
    fund_data = data[data['Fund Name'] == selected_fund]
    fund_data = fund_data.sort_values(by="NAV date")

    # Load model and predict using LSTM
    model = load_model(selected_fund)
    actual_nav = fund_data['Net Asset Value'].values
    predicted_nav = predict_nav(model, fund_data[[f'lag_{i}' for i in range(1, 6)]], prediction_window)

    # Plot predictions
    plot_url = plot_predictions(actual_nav[-prediction_window:], predicted_nav, selected_fund)

    # Calculate MAE and RMSE
    mae, rmse = calculate_metrics(actual_nav[-prediction_window:], predicted_nav)

    # Fuzzy logic-based investment advice
    investment_advice = get_investment_advice(predicted_nav)

    # Risk Calculation
    fund_risk = calculate_risk(fund_data['Net Asset Value'])

    # Confidence Interval
    prediction_interval = get_prediction_interval(predicted_nav, mae)

    return render_template(
        'predict_nav.html',
        selected_fund=selected_fund,
        plot_url=plot_url,
        mae=mae,
        rmse=rmse,
        investment_advice=investment_advice,
        fund_risk=fund_risk,
        prediction_interval=prediction_interval
    )

@app.route('/compare_performance', methods=['POST'])
def compare_performance():
    selected_funds = request.form.getlist('funds')
    prediction_window = int(request.form['prediction_window'])

    data = load_data()
    comparison_results = []

    for fund in selected_funds:
        fund_data = data[data['Fund Name'] == fund]
        fund_data = fund_data.sort_values(by="NAV date")

        # Load model and predict using LSTM
        model = load_model(fund)
        actual_nav = fund_data['Net Asset Value'].values
        predicted_nav = predict_nav(model, fund_data[['lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5']], prediction_window)

        # Calculate MAE and RMSE
        mae, rmse = calculate_metrics(actual_nav[-prediction_window:], predicted_nav)

        comparison_results.append({
            'Fund Name': fund,
            'MAE': mae,
            'RMSE': rmse
        })

    comparison_df = pd.DataFrame(comparison_results)

    return render_template('compare_performance.html', comparison_df=comparison_df)

@app.route('/portfolio_analysis', methods=['POST'])
def portfolio_analysis_view():
    selected_funds = request.form.getlist('funds')
    prediction_window = int(request.form['prediction_window'])

    data = load_data()
    portfolio_return, portfolio_risk = portfolio_analysis(selected_funds, data, prediction_window)

    return render_template('portfolio_analysis.html', portfolio_return=portfolio_return, portfolio_risk=portfolio_risk)

@app.route('/fund_ranking', methods=['GET'])
def fund_ranking_view():
    data = load_data()
    ranking_df = rank_funds(data, prediction_window=10)
    return render_template('fund_ranking.html', ranking_df=ranking_df)

if __name__ == "__main__":
    app.run(debug=True)
