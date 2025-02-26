import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import joblib  # For saving the scaler

# Load the data
def load_data(filename):
    df = pd.read_csv(filename, parse_dates=['NAV date'])
    return df

# Preprocess the data
def preprocess_data(df, n_lags=5):
    # Convert date column to datetime if not already
    df['NAV date'] = pd.to_datetime(df['NAV date'], format='%Y-%m-%d')
    
    # Sort the data by NAV date and Fund Name
    df.sort_values(by=['Fund Name', 'NAV date'], inplace=True)
    
    # Normalize and create lag features for each fund
    scaler = MinMaxScaler()
    processed_data = []
    
    for fund_name, fund_data in df.groupby('Fund Name'):
        # Create lag features for 'Net Asset Value'
        for i in range(1, n_lags + 1):
            fund_data[f'lag_{i}'] = fund_data['Net Asset Value'].shift(i)
        
        # Drop missing values due to lagging
        fund_data.dropna(inplace=True)
        
        # Normalize the data (only 'Net Asset Value' and lags)
        columns_to_scale = ['Net Asset Value'] + [f'lag_{i}' for i in range(1, n_lags + 1)]
        fund_data[columns_to_scale] = scaler.fit_transform(fund_data[columns_to_scale])
        
        processed_data.append(fund_data)
    
    # Concatenate all the processed fund data back together
    df_processed = pd.concat(processed_data)
    
    return df_processed, scaler

# Save the processed data to a new CSV
def save_processed_data(df, output_file):
    df.to_csv(output_file, index=False)



if __name__ == '__main__':
    # Load and preprocess the data
    df = load_data('combined_mutual_fund_nav_data.csv')

    processed_df, scaler = preprocess_data(df)
    
    # Save the processed data
    save_processed_data(processed_df, 'processed_nav.csv')
    
    
