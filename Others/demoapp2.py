import streamlit as st
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set page configuration
st.set_page_config(
    page_title="Mutual Fund NAV Prediction and Performance Analysis",
    layout="wide",
    initial_sidebar_state="expanded"
)

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

# Plot actual vs predicted NAV (Visualization for comparison)
def plot_predictions(actual, predicted, fund_name):
    plt.figure(figsize=(10, 6))
    plt.plot(actual, label="Actual NAV", marker='o')
    plt.plot(predicted, label="Predicted NAV", marker='x')
    plt.title(f"{fund_name} - Actual vs Predicted NAV")
    plt.xlabel("Time")
    plt.ylabel("Normalized NAV")
    plt.legend()
    st.pyplot(plt)

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
    plt.legend()
    st.pyplot(plt)

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
    
    st.write(f"**Expected Portfolio Return:** {portfolio_return * 100:.2f}%")
    st.write(f"**Expected Portfolio Risk (Standard Deviation):** {portfolio_risk:.4f}")

# Fund Correlation Matrix
def plot_correlation_matrix(data, funds):
    fund_data = data[data['Fund Name'].isin(funds)]
    fund_pivot = fund_data.pivot_table(values='Net Asset Value', index='NAV date', columns='Fund Name')
    
    # Calculate correlation matrix
    corr_matrix = fund_pivot.corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt='.2f')
    plt.title("Fund Correlation Matrix")
    st.pyplot(plt)

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


# Sidebar options
st.sidebar.title("Mutual Fund NAV Analysis")
option = st.sidebar.radio(
    "Choose an Analysis Option:",
    ("Individual Fund NAV Prediction", "Comparative Fund Performance Analysis", "Portfolio Builder", "Fund Risk Analysis", "Fund Correlation Matrix", "Fund Ranking Based on Returns and Risk")
)

prediction_window = st.sidebar.slider(
    "Select Prediction Window (Days):", min_value=1, max_value=30, value=10, step=1,
    key="prediction_window_slider_1"  # Unique key for this slider
)


# Main app functionality
st.title("Mutual Fund NAV Prediction and Performance Analysis")
data = load_data()
funds = data['Fund Name'].unique()

if option == "Individual Fund NAV Prediction":
    st.header("Individual Fund NAV Prediction")
    selected_fund = st.selectbox("Select a Mutual Fund:", funds)

    if st.button("Predict NAV"):
        fund_data = data[data['Fund Name'] == selected_fund]
        fund_data = fund_data.sort_values(by="NAV date")

        # Load model and predict using LSTM (Soft Computing)
        model = load_model(selected_fund)
        actual_nav = fund_data['Net Asset Value'].values
        predicted_nav = predict_nav(model, fund_data[[f'lag_{i}' for i in range(1, 6)]], prediction_window)

        # Plot and display metrics
        st.subheader(f"Predicted NAV for {selected_fund}")
        plot_predictions(actual_nav[-prediction_window:], predicted_nav, selected_fund)

        # Calculate MAE and RMSE
        mae, rmse = calculate_metrics(actual_nav[-prediction_window:], predicted_nav)
        st.write(f"**Mean Absolute Error (MAE):** {mae:.4f}")
        st.write(f"**Root Mean Squared Error (RMSE):** {rmse:.4f}")

        # Fuzzy logic-based investment advice
        investment_advice = get_investment_advice(predicted_nav)
        st.write(f"**Investment Advice:** {investment_advice}")

        # Risk Calculation (Statistical Soft Computing)
        fund_risk = calculate_risk(fund_data['Net Asset Value'])
        st.write(f"**Fund Risk Level (Standard Deviation):** {fund_risk:.4f}")
        if fund_risk < 0.02:
            st.write("Risk Level: Low")
        elif fund_risk < 0.05:
            st.write("Risk Level: Moderate")
        else:
            st.write("Risk Level: High")

        # Confidence Interval / Prediction Interval
        prediction_interval = get_prediction_interval(predicted_nav, mae)
        st.write(f"**Prediction Interval (95% Confidence):** {prediction_interval[0]:.4f} to {prediction_interval[1]:.4f}")

        # Display historical accuracy
        historical_accuracy = np.mean(np.abs((actual_nav[-prediction_window:] - predicted_nav) / actual_nav[-prediction_window:])) * 100
        st.write(f"**Historical Accuracy:** {100 - historical_accuracy:.2f}%")

elif option == "Comparative Fund Performance Analysis":
    st.header("Comparative Fund Performance Analysis")
    selected_funds = st.multiselect("Select Funds for Comparison:", funds, default=funds[:2])

    if st.button("Compare Performance"):
        comparison_results = []

        for fund in selected_funds:
            fund_data = data[data['Fund Name'] == fund]
            fund_data = fund_data.sort_values(by="NAV date")

            # Load model and predict using LSTM (Soft Computing)
            model = load_model(fund)
            actual_nav = fund_data['Net Asset Value'].values
            predicted_nav = predict_nav(model, fund_data[[f'lag_{i}' for i in range(1, 6)]], prediction_window)

            # Calculate performance metrics
            mae, rmse = calculate_metrics(actual_nav[-prediction_window:], predicted_nav)
            comparison_results.append({
                'Fund Name': fund,
                'MAE': mae,
                'RMSE': rmse
            })

            # Plot comparisons
            plot_predictions(actual_nav[-prediction_window:], predicted_nav, fund)

        comparison_df = pd.DataFrame(comparison_results)
        st.write("**Fund Performance Comparison (MAE & RMSE):**")
        st.dataframe(comparison_df)

elif option == "Portfolio Builder":
    st.header("Portfolio Builder and Analysis")
    selected_funds = st.multiselect("Select Funds for Portfolio:", funds)

    if st.button("Analyze Portfolio"):
        portfolio_analysis(selected_funds, data, prediction_window)

elif option == "Fund Risk Analysis":
    st.header("Fund Risk Analysis")
    selected_fund = st.selectbox("Select a Fund to Analyze Risk:", funds)

    if st.button("Analyze Risk"):
        fund_data = data[data['Fund Name'] == selected_fund]
        risk = calculate_risk(fund_data['Net Asset Value'])
        st.write(f"**Risk Level (Standard Deviation):** {risk:.4f}")
        if risk < 0.02:
            st.write("Risk Level: Low")
        elif risk < 0.05:
            st.write("Risk Level: Moderate")
        else:
            st.write("Risk Level: High")

        # Historical performance vs benchmark (e.g., Nifty)
        benchmark_nav = np.linspace(fund_data['Net Asset Value'].min(), fund_data['Net Asset Value'].max(), len(fund_data))
        plot_benchmark_comparison(fund_data['Net Asset Value'], benchmark_nav, selected_fund, "Benchmark")

elif option == "Fund Correlation Matrix":
    st.sidebar.subheader("Fund Correlation Matrix")
    selected_funds_for_correlation = st.sidebar.multiselect(
        "Select Funds for Correlation Matrix:", funds, default=funds[:2]
    )

    if len(selected_funds_for_correlation) > 1:
        plot_correlation_matrix(data, selected_funds_for_correlation)
elif option == "Fund Ranking Based on Returns and Risk":
    st.header("Fund Ranking Based on Predicted Returns and Risk")
    prediction_window = st.sidebar.slider(
    "Select Prediction Window (Days):", min_value=1, max_value=30, value=10, step=1,
    key="prediction_window_slider_2"  # Unique key for this slider
)

    # Get ranked funds
    ranking_df = rank_funds(data, prediction_window)

    # Display ranked funds table
    st.write("**Fund Ranking (Based on Predicted Return and Risk):**")
    st.dataframe(ranking_df)

    # Plot Return vs Risk scatter plot
    plt.figure(figsize=(10, 6))
    plt.scatter(ranking_df['Predicted Return'], ranking_df['Risk'], color='blue', label='Funds')
    plt.title("Return vs Risk for Mutual Funds")
    plt.xlabel("Predicted Return")
    plt.ylabel("Risk (Standard Deviation)")
    for i, txt in enumerate(ranking_df['Fund Name']):
        plt.annotate(txt, (ranking_df['Predicted Return'].iloc[i], ranking_df['Risk'].iloc[i]), fontsize=9)
    st.pyplot(plt)


