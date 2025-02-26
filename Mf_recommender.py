import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def load_and_clean_data(file_path):
    print("Hold on a moment, Chandu Millionaire is loading and preparing your data...")
    data = pd.read_csv(file_path)
    for col in ['expense_ratio', 'fund_size_cr', 'returns_1yr', 'returns_3yr', 'returns_5yr', 'alpha', 'sd', 'beta', 'sharpe', 'sortino']:
        data[col] = pd.to_numeric(data[col], errors='coerce')
    data.fillna(data.median(numeric_only=True), inplace=True)
    print("Data is ready! Let’s make some smart investment decisions.")
    return data

def normalize_columns(df, columns):
    scaler = MinMaxScaler()
    df[columns] = scaler.fit_transform(df[columns])
    return df

def recommend_mutual_funds(data, preferences):
    filtered_data = data.copy()
    if 'min_investment' in preferences:
        filtered_data = filtered_data[(filtered_data['min_sip'] <= preferences['min_investment']) | (filtered_data['min_lumpsum'] <= preferences['min_investment'])]
    if 'risk_tolerance' in preferences:
        filtered_data = filtered_data[filtered_data['risk_level'] <= preferences['risk_tolerance']]
    if 'investment_horizon' in preferences:
        horizon_column = f'returns_{preferences["investment_horizon"]}yr'
        filtered_data = filtered_data[filtered_data[horizon_column].notnull()]
    
    sort_column = f'returns_{preferences["investment_horizon"]}yr' if preferences.get("investment_horizon") else 'returns_5yr'
    recommended_funds = filtered_data.sort_values(by=sort_column, ascending=False).head(5)
    return recommended_funds

def compare_funds(data, fund_indices):
    selected_funds = data.iloc[fund_indices]
    print("\nComparison of Selected Mutual Funds:")
    print(selected_funds.to_string(index=False))

def chatbot_interaction():
    print("Hello! I'm Chandu Millionaire, your friendly Mutual Fund Assistant.")
    file_path = 'comprehensive_mutual_funds_data.csv'
    data = load_and_clean_data(file_path)
    data = normalize_columns(data, ['expense_ratio', 'fund_size_cr', 'returns_1yr', 'returns_3yr', 'returns_5yr', 'alpha', 'sd', 'beta', 'sharpe', 'sortino'])

    while True:
        user_input = input("Ask me about mutual funds, type 'start' for recommendations, 'help' for assistance, or 'exit' to quit: ").lower()
        if user_input == 'exit':
            print("Thank you for using Chandu Millionaire. Remember, smart investing is the key to success! Goodbye!")
            break
        elif user_input == 'start':
            try:
                min_investment = int(input("What's your initial investment amount / Paise kitne hai bhai ? "))
                risk_tolerance = int(input("On a scale from 1 (low) to 5 (high), what's your risk tolerance / tashrif me kitna dum hai ? "))
                investment_horizon = int(input("How many years are you planning to invest (Please Select from (1yr/3yr/5yr)? "))
                
                preferences = {
                    'min_investment': min_investment,
                    'risk_tolerance': risk_tolerance,
                    'investment_horizon': investment_horizon
                }
                recommendations = recommend_mutual_funds(data, preferences)
                
                if recommendations.empty:
                    print("Hmm, no funds match your criteria. Perhaps try adjusting your preferences?")
                else:
                    print("\nHere are some recommended mutual funds based on your input:")
                    print(recommendations[['scheme_name', 'min_sip', 'min_lumpsum', 'expense_ratio', 'returns_1yr', 'returns_3yr', 'returns_5yr', 'risk_level', 'rating']].to_string(index=False))
                    compare_input = input("\nWould you like to compare any of these funds? Enter indices separated by commas (from 0,1,2,3,4): ")
                    if compare_input:
                        fund_indices = list(map(int, compare_input.split(',')))
                        compare_funds(recommendations, fund_indices)
                
            except ValueError:
                print("Oops! It seems there was an error with your input. Please enter numeric values only.")
            except Exception as e:
                print("Sorry I dont have any info for the particular time stamp ", e)
        elif user_input == 'help':
            print("You can start by telling me how much you want to invest, or ask for general advice on mutual funds.")
        elif user_input == 'hello':
            print("Hi there! I’m Chandu Millionaire, ready to help you grow your wealth. What can I do for you today?")
        else:
            print("I'm not quite sure what you mean. Please type 'help' if you need assistance or 'start' to begin recommendations.")

if __name__ == "__main__":
    chatbot_interaction()
