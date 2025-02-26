import streamlit as st
import pandas as pd
import numpy as np
import pickle
import ast

# Load the resources (model and data)
@st.cache_resource
def load_resources():
    # Load the trained model using pickle
    with open("recommendation_model.pkl", "rb") as file:
        model = pickle.load(file)
    
    # Load the mutual fund data
    data = pd.read_csv("final_MutualFunds_SchemeData.csv")
    
    # Ensure 'fund_id' column exists (use the DataFrame index or generate a unique id)
    if 'fund_id' not in data.columns:
        data['fund_id'] = data.index  # Create a unique ID using the index
    
    return model, data

# Define recommendation function
def recommend_funds(user_profile, model, data):
    # Combine the user profile with the fund data
    new_user_df = pd.DataFrame([user_profile])
    new_user_df['dummy_key'] = 1  # Add a dummy key for merging
    fund_data = data.assign(dummy_key=1)  # Add a dummy key to fund data
    combined_data = pd.merge(new_user_df, fund_data, on='dummy_key').drop('dummy_key', axis=1)

    # Prepare input for prediction
    user_ids = np.zeros(len(combined_data))  # Use 0 as placeholder for user_id
    fund_ids = combined_data['fund_id'].values  # Get fund IDs for prediction

    # Make predictions using the loaded model
    predictions = model.predict([user_ids, fund_ids])

    # Get predicted labels
    predicted_labels = np.argmax(predictions, axis=1)

    # Decode predicted labels to readable categories
    label_encoder = pickle.loads(data['label_encoder'][0])  # Assuming label encoder was saved
    decoded_labels = label_encoder.inverse_transform(predicted_labels)

    # Add the predictions to the combined data
    combined_data['predicted_label'] = [ast.literal_eval(label)[0] for label in decoded_labels]
    return combined_data[['AMC', 'Code', 'Scheme Category', 'predicted_label']]

# Streamlit app
def main():
    st.title("Mutual Fund Recommendation System")
    st.sidebar.header("User Profile")

    # User input for the profile
    age = st.sidebar.number_input("Age", min_value=18, max_value=100, value=30)
    investment_amount = st.sidebar.number_input("Investment Amount (₹)", min_value=1000, step=1000, value=10000)
    risk_tolerance = st.sidebar.selectbox("Risk Tolerance", options=["low", "medium", "high"])
    investment_horizon = st.sidebar.number_input("Investment Horizon (years)", min_value=1, max_value=30, value=5)

    # Load model and data
    model, data = load_resources()

    # Create user profile
    user_profile = {
        "age": age,
        "investment_amount": investment_amount,
        "risk_tolerance": risk_tolerance,
        "investment_horizon": investment_horizon,
    }

    # Generate recommendations
    if st.button("Get Recommendations"):
        recommendations = recommend_funds(user_profile, model, data)
        st.subheader("Recommended Mutual Funds")
        st.dataframe(recommendations)

if __name__ == "__main__":
    main()
