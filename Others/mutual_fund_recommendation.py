import pandas as pd

# Load the CSV file
file_path = 'SchemeData0107242055SS.csv'  # Update the file path if necessary
data = pd.read_csv(file_path)

# Define functions to categorize risk and age group
def categorize_risk(scheme_category):
    if "Liquid" in scheme_category or "Short Term" in scheme_category or "Ultra Short Term" in scheme_category or "Fixed Maturity" in scheme_category:
        return "Low-Risk"
    elif "Balanced" in scheme_category and "Conservative" in scheme_category or "Income" in scheme_category or "Gilt" in scheme_category:
        return "Medium-Risk"
    elif "Equity" in scheme_category or "Sectoral" in scheme_category or "Aggressive" in scheme_category:
        return "High-Risk"
    elif "Small Cap" in scheme_category or "Thematic" in scheme_category or "Emerging Market" in scheme_category:
        return "Very High-Risk"
    else:
        return "General"

def categorize_age_group(scheme_category):
    if "Equity" in scheme_category or "Sectoral" in scheme_category or "Aggressive" in scheme_category:
        return "Young Investors (20s-30s)"
    elif "Balanced" in scheme_category and "Conservative" in scheme_category or "Flexi-cap" in scheme_category or "Large Cap" in scheme_category:
        return "Middle-Aged Investors (40s-50s)"
    elif "Debt" in scheme_category or "Fixed Maturity" in scheme_category:
        return "Pre-Retirement"
    elif  "Senior Citizen" in scheme_category or "Large Cap" in scheme_category:
        return "Retirement"
    else:
        return "General"

# Apply categorization functions to the data
data['Risk Level'] = data['Scheme Category'].apply(categorize_risk)
data['Age Group'] = data['Scheme Category'].apply(categorize_age_group)

# Define a function to categorize investment duration
def categorize_duration(scheme_category):
    if ("Liquid" in scheme_category or
        "Ultra Short Term" in scheme_category or
        "Short Term" in scheme_category or
        "Fixed Maturity" in scheme_category):
        return "Short-Term"
    else:
        return "Long-Term"

# Apply the duration categorization function to the data
data['Investment Duration'] = data['Scheme Category'].apply(categorize_duration)
data['AMC']=data['AMC'].apply(lambda x: x.split()[0])

# Define a function to create tags
def create_tags(row):
    tags = []
    tags.append(row['AMC'].replace(" ", "").replace("Limited", "").replace("AMC", "").lower())
    tags.append(row['Scheme Type'].replace(" ", "").lower())
    tags.append(row['Scheme Category'].replace(" ", "").replace("&", "and").replace("-", "").lower())
    tags.append(row['Risk Level'].replace("-", "").replace(" ", "").lower())
    tags.append(row['Age Group'].replace(" ", "").replace("(", "").replace(")", "").replace("-", "").lower())
    tags.append(row['Investment Duration'].replace("-", "").replace(" ", "").lower())
    return list(tags)

# Apply the tags function to the data
data['Tags'] = data.apply(create_tags, axis=1)

# Save the updated data to a new CSV file
output_file_path = 'Updated_SchemeData.csv'
data.to_csv(output_file_path, index=False)

print("Updated data saved to:", output_file_path)

data=pd.read_csv("Updated_SchemeData.csv")
data.head()

data=data[["AMC",'Code','Scheme Category','Scheme Type','Risk Level','Age Group','Investment Duration','Tags']]

output_file_path = 'final_MutualFunds_SchemeData.csv'
data.to_csv(output_file_path, index=False)

data['Scheme Category'].value_counts()


import re

# Process 'Tags' column in the dataset
for i in range(len(data)):
    data_1 = data['Tags'][i]  # Access the current 'Tags' value
    data_1 = data_1[2:-2]  # Remove the first two and last two characters
    data_1 = data_1.replace(" ", "").replace("'", "")  # Remove spaces and single quotes
    data_1 = data_1.split(',')  # Split into a list
    
    # Split the third element of data_1 by 'scheme' and extend the list
    data_2 = data_1[2].split('scheme')
    for tags in data_2:
        data_1.append(tags)  # Append each tag to data_1
    
    del data_1[2]  # Remove the third element
    data['Tags'][i] = data_1  # Update the 'Tags' column for the current row

# Display the first row of the 'Tags' column
print(data.head(1)['Tags'].values)

# Print each tag from the processed 'Tags' list
for tags in data_1:
    print(tags)

# Display the dataset
print(data)

# Display the count of each unique value in the 'Tags' column
print(data['Tags'].value_counts())

# Display unique values in the 'AMC' column
print(data["AMC"].unique())



import pandas as pd
import random
import numpy as np

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Number of users
num_users = 25

# Generate user profiles
user_profiles = pd.DataFrame({
    'user_id': range(num_users),
    'age': [random.randint(20, 60) for _ in range(num_users)],
    'investment_amount': [random.randint(1000, 50000) for _ in range(num_users)],
    'risk_tolerance': [random.choice(['low', 'medium', 'high']) for _ in range(num_users)],
    'investment_horizon': [random.randint(1, 20) for _ in range(num_users)]
})

# Function to introduce missing values
def introduce_missing_values(df, missing_percentage):
    df = df.copy()
    for col in df.columns:
        if col != 'user_id':  # Avoid introducing missing values in user_id
            mask = np.random.rand(len(df)) < missing_percentage
            df.loc[mask, col] = np.nan
    return df

# Introduce 60% missing values
user_profiles = introduce_missing_values(user_profiles, 0.6)

print(user_profiles)
#




import pandas as pd
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Embedding, Flatten, concatenate
import numpy as np

# Load the data
file_path = 'final_MutualFunds_SchemeData.csv'
data = pd.read_csv(file_path)

# Clean column names (if needed)
data.columns = data.columns.str.strip()

# Handle non-numeric values in relevant columns
# Example: 'Investment Duration' as integer, 'Risk Level' as categorical
data['Investment Duration'] = pd.to_numeric(data['Investment Duration'], errors='coerce').fillna(0).astype(int)
data['Risk Level'] = data['Risk Level'].astype('category').cat.codes

# One-hot encode categorical variables
# One-hot encode categorical variables
encoder = OneHotEncoder(sparse_output=False)
encoded_scheme_category = encoder.fit_transform(data[['Scheme Category']])


# Generate unique fund IDs
data['fund_id'] = data.index


# Combine user profiles with fund data (simplified example)
user_data = user_profiles.assign(dummy_key=1)
fund_data = data.assign(dummy_key=1)
combined_data = pd.merge(user_data, fund_data, on='dummy_key').drop('dummy_key', axis=1)

# Encode 'Tags' with LabelEncoder for multi-class classification
label_encoder = LabelEncoder()
combined_data['label'] = label_encoder.fit_transform(combined_data['Tags'])

# Split the data into training and validation sets
train_data, val_data = train_test_split(combined_data, test_size=0.2, random_state=42)

# Prepare the input data
train_user_ids = train_data['user_id'].values
train_fund_ids = train_data['fund_id'].values
train_labels = train_data['label'].values

val_user_ids = val_data['user_id'].values
val_fund_ids = val_data['fund_id'].values
val_labels = val_data['label'].values

# Define the model architecture
input_user_id = Input(shape=(1,))
input_fund_id = Input(shape=(1,))

# Embedding layers for users and funds
user_embedding = Embedding(input_dim=user_profiles['user_id'].nunique(), output_dim=10)(input_user_id)
fund_embedding = Embedding(input_dim=data['fund_id'].nunique(), output_dim=10)(input_fund_id)

# Flatten and concatenate the embeddings
user_flat = Flatten()(user_embedding)
fund_flat = Flatten()(fund_embedding)
merged = concatenate([user_flat, fund_flat])

# Add dense layers
dense1 = Dense(64, activation='relu')(merged)
dense2 = Dense(32, activation='relu')(dense1)
output = Dense(len(label_encoder.classes_), activation='softmax')(dense2)  # Multi-class output

# Compile the model
model = Model(inputs=[input_user_id, input_fund_id], outputs=output)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit([train_user_ids, train_fund_ids], train_labels,
          validation_data=([val_user_ids, val_fund_ids], val_labels),
          epochs=10, batch_size=64)
data.columns

import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model

# Assuming 'sample_data' is your sample dataset in a DataFrame format
sample_data = pd.DataFrame({
    'AMC': ['Aditya', 'Aditya', 'Aditya', 'Aditya', 'Aditya'],
    'Code': [100033, 100034, 119433, 119436, 100037],
    'Scheme Category': ['Equity Scheme - Large & Mid Cap Fund'] * 4 + ['Debt Scheme - Medium to Long Duration Fund'],
    'Scheme Type': ['Open Ended'] * 5,
    'Risk Level': ['High-Risk'] * 4 + ['General'],
    'Age Group': ['Young Investors (20s-30s)'] * 5,
    'Investment Duration': ['Long-Term'] * 5,
    'Tags': [['aditya', 'openended', 'equityschemelargeandmidcapfund'],
             ['aditya', 'openended', 'equityschemelargeandmidcapfund'],
             ['aditya', 'openended', 'equityschemelargeandmidcapfund'],
             ['aditya', 'openended', 'equityschemelargeandmidcapfund'],
             ['aditya', 'openended', 'debtschememediumtolongdurationfund']]
})

# Encode categorical variables in sample_data (similar to training data preprocessing)
# One-hot encode categorical variables
encoder = OneHotEncoder(sparse_output=False)
encoded_scheme_category = encoder.fit_transform(data[['Scheme Category']])
# Generate unique fund IDs (assuming you have a mapping for this)
sample_data['fund_id'] = np.arange(len(sample_data))  # Placeholder for fund_id

# Prepare input for prediction
sample_user_ids = np.zeros(len(sample_data))  # Assuming same user_id for all samples

# Make predictions
predictions = model.predict([sample_user_ids, sample_data['fund_id'].values])

# Assuming predictions are probabilities, you can get the predicted labels
predicted_labels = np.argmax(predictions, axis=1)

# Decode predicted labels if needed (using label_encoder.classes_)
# label_encoder.classes_[predicted_labels]

# Display predictions
sample_data['predicted_label'] = label_encoder.classes_[predicted_labels]
print(sample_data[[ 'predicted_label']])


import pickle

# Assuming 'model' is your trained Keras model
with open('recommendation_model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)
    
    
 