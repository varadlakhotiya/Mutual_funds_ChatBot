# Import required libraries
from flask import Flask, request, jsonify
from transformers import pipeline
import mysql.connector
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Flask app
app = Flask(__name__)

# Load Hugging Face pipelines
logging.info("Loading Hugging Face pipelines...")
intent_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
entity_recognizer = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english")

# Define database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Varad@2004",
        database="mutual_funds"
    )

# Function to classify intent
def classify_intent(query):
    labels = ["recommendation", "nav_prediction", "general"]
    result = intent_classifier(query, labels)
    intent = result["labels"][0]
    confidence = result["scores"][0]
    logging.info(f"Intent: {intent}, Confidence: {confidence}")
    return intent if confidence > 0.7 else "unknown"

# Function to extract entities
def extract_entities(query):
    entities = entity_recognizer(query)
    extracted = [ent["word"] for ent in entities if ent["entity_group"] in ["ORG", "MISC"]]
    logging.info(f"Entities: {extracted}")
    return extracted

# Route to analyze user query
@app.route('/analyze', methods=['POST'])
def analyze_query():
    data = request.json
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "Query is empty"}), 400

    # Analyze query
    intent = classify_intent(query)
    entities = extract_entities(query)
    
    logging.info(f"Received query: {query}, Intent: {intent}, Entities: {entities}")
    
    response = {"intent": intent, "entities": entities}

    if intent == "recommendation":
        response["data"] = recommend_funds(entities)
    elif intent == "nav_prediction":
        response["data"] = predict_nav(entities)
    elif intent == "general":
        response["data"] = get_general_answer(query)
    else:
        response["data"] = "I'm not sure how to help with that. Can you rephrase?"

    return jsonify(response)

# Function to recommend funds
def recommend_funds(entities):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        # If entities are empty, recommend all funds
        if not entities:
            query = "SELECT * FROM Funds"
            cursor.execute(query)
        else:
            # Match fund names with entities
            fund_name = "%".join(entities)
            query = "SELECT * FROM Funds WHERE name LIKE %s"
            cursor.execute(query, (f"%{fund_name}%",))

        funds = cursor.fetchall()
        db.close()

        if not funds:
            return "No matching funds found. Please refine your search."
        return funds
    except Exception as e:
        logging.error(f"Error recommending funds: {e}")
        return "An error occurred while fetching recommendations."

# Function to predict NAV
def predict_nav(entities):
    if not entities:
        return "Please specify a fund name for NAV prediction."

    fund_name = " ".join(entities)
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        query = """
        SELECT date, nav FROM NavHistory 
        JOIN Funds ON Funds.id = NavHistory.fund_id 
        WHERE Funds.name LIKE %s 
        ORDER BY date DESC
        LIMIT 5
        """
        cursor.execute(query, (f"%{fund_name}%",))
        nav_data = cursor.fetchall()
        db.close()

        if not nav_data:
            return f"No NAV data found for {fund_name}."
        
        # Placeholder for ANN prediction logic
        # For now, return the latest NAV
        latest_nav = nav_data[0]
        return f"The latest NAV for {fund_name} is {latest_nav['nav']} on {latest_nav['date']}."
    except Exception as e:
        logging.error(f"Error predicting NAV: {e}")
        return "An error occurred while predicting NAV."

# Function to get general answers
def get_general_answer(query):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        query = f"SELECT answer FROM FAQ WHERE question LIKE %s LIMIT 1"
        cursor.execute(query, (f"%{query}%",))
        answer = cursor.fetchone()
        db.close()

        if not answer:
            return "I don't have an answer for that. Try asking something else."
        return answer["answer"]
    except Exception as e:
        logging.error(f"Error fetching FAQ: {e}")
        return "An error occurred while fetching the answer."

# Run the app
if __name__ == "__main__":
    app.run(port=5000, debug=True)
