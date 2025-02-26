import pandas as pd

# Define the file paths for each fund's CSV
files = {
    "Bank of India Mid Small Cap Fund": "bank_of_india_mid_small_cap_fund_nav.csv",
    "HDFC Focused 30 Fund": "hdfc_focused_30_fund_nav.csv",
    "HSBC Equity Savings Fund": "hsbc_equity_savings_fund_nav.csv",
    "ICICI Prudential Bharat 22 FOF": "icici_prudential_bharat_22_fof_nav.csv",
    "Kotak Equity Savings Fund": "kotak_equity_savings_fund_nav.csv",
    "Nippon India Large Cap Fund": "nippon_india_large_cap_fund_nav.csv",
    "SBI PSU Fund": "sbi_psu_fund_nav.csv"
}

# Initialize an empty list to collect dataframes
df_list = []

# Loop through each file and read the CSV data
for fund_name, file_path in files.items():
    # Load the data
    df = pd.read_csv(file_path)
    
    # Add a new column for the fund name
    df['Fund Name'] = fund_name
    
    # Ensure that 'NAV date' column is in datetime format
    df['NAV date'] = pd.to_datetime(df['NAV date'])
    
    # Append the dataframe to the list
    df_list.append(df)

# Concatenate all dataframes into one
combined_df = pd.concat(df_list, ignore_index=True)

# Optionally, sort the dataframe by date
combined_df = combined_df.sort_values(by=['NAV date'])

# Save the combined dataframe to a new CSV file
combined_df.to_csv("combined_mutual_fund_nav_data.csv", index=False)

print("Combined data saved to 'combined_mutual_fund_nav_data.csv'")
