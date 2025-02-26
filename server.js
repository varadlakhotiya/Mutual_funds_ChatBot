const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // For making requests to the Flask API
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Create MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Establish connection to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// Create a secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET; // Load from environment variable

// Create the 'users' table if it doesn't already exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);`;
db.query(createTableQuery, (err) => {
    if (err) throw err;
    console.log('Users table created or already exists.');
});

// Registration endpoint
app.post('/register', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and email are required.');
    }

    // Check if the user already exists in the database
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error occurred.');
        }
        if (results.length > 0) {
            return res.status(400).send('User already exists.');
        }

        // Insert the new user into the database
        const insertUserQuery = 'INSERT INTO users (name, email) VALUES (?, ?)';
        db.query(insertUserQuery, [name, email], (err) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Error registering user.');
            }
            res.send('Registration successful.');
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required.');
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error occurred.');
        }
        if (results.length > 0) {
            // Generate JWT token
            const token = jwt.sign({ id: results[0].id, name: results[0].name }, JWT_SECRET, { expiresIn: '1h' });
            // Send token and name back to the client
            res.json({ token, name: results[0].name, id: results[0].id }); // Include token here
        } else {
            res.status(400).send('Invalid user. Please register first.');
        }
    });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token, forbidden
        req.user = user; // Save user info to request
        next();
    });
};

// Protected endpoint for submitting fund details
app.post('/submit-fund-details', authenticateToken, (req, res) => {
    const { fundName, investmentAmount, investmentDate, investmentDuration, riskLevel, expectedReturn } = req.body;

    console.log('Request body:', req.body);  // Log the request body to verify the data

    // Retrieve user ID from the token
    const userId = req.user.id;

    // Ensure that the required fields are provided
    if (!fundName || !investmentAmount || !investmentDate || !investmentDuration || !expectedReturn) {
        return res.status(400).send('All fields are required.');
    }

    // Insert the mutual fund data into the database
    const insertFundQuery = `
        INSERT INTO MutualFunds (id, fund_name, investment_amount, investment_date, investment_duration, risk_level, expected_return)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertFundQuery, [userId, fundName, investmentAmount, investmentDate, investmentDuration, riskLevel, expectedReturn], (err, results) => {
        if (err) {
            console.error('Error inserting fund details:', err);
            return res.status(500).send('Error saving fund details.');
        }
        res.send('Mutual fund details saved successfully.');
    });
});

// Endpoint to get mutual fund details for the authenticated user
app.get('/fund-details', authenticateToken, (req, res) => {
    const userId = req.user.id; // Get user ID from the token
    const fetchFundDetailsQuery = 'SELECT * FROM MutualFunds WHERE id = ?';
    const fetchPortfolioHistoryQuery = `
        SELECT 
            date_format(investment_date, '%Y-%m') as month,
            SUM(investment_amount) as total_investment
        FROM MutualFunds 
        WHERE id = ?
        GROUP BY month
        ORDER BY month;
    `;

    db.query(fetchFundDetailsQuery, [userId], (err, fundResults) => {
        if (err) {
            console.error('Error fetching fund details:', err);
            return res.status(500).send('Error fetching fund details.');
        }

        db.query(fetchPortfolioHistoryQuery, [userId], (err, historyResults) => {
            if (err) {
                console.error('Error fetching portfolio history:', err);
                return res.status(500).send('Error fetching portfolio history.');
            }

            res.json({ fundResults, historyResults }); // Send both as JSON
        });
    });
});

// Protected endpoint for fetching recent transactions
app.get('/recent-transactions', authenticateToken, (req, res) => {
    const userId = req.user.id; // Get user ID from the token

    const fetchRecentTransactionsQuery = `
        SELECT 
            T.transaction_date, 
            T.transaction_type, 
            T.amount, 
            MF.fund_name 
        FROM Transactions T
        JOIN MutualFunds MF ON T.fund_id = MF.fund_id
        WHERE T.id = ? 
        ORDER BY T.transaction_date DESC 
        LIMIT 5;
    `;

    db.query(fetchRecentTransactionsQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching recent transactions:', err);
            return res.status(500).send('Error fetching recent transactions.');
        }
        res.json(results);
    });
});

// Protected endpoint for fetching personalized insights
app.get('/personalized-insights', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const fetchPersonalizedInsightsQuery = `
        SELECT 
            fund_name,
            investment_amount,
            risk_level,
            expected_return 
        FROM MutualFunds 
        WHERE id = ?;
    `;

    db.query(fetchPersonalizedInsightsQuery, [userId], (err, insightsResults) => {
        if (err) {
            console.error('Error fetching personalized insights:', err);
            return res.status(500).send('Error fetching personalized insights.');
        }

        // Generate insight messages based on user's investment data
        const insightsMessage = insightsResults.map(insight => {
            let recommendation = '';
            if (insight.risk_level === 'low') {
                recommendation = `Your investment in ${insight.fund_name} is low risk. Consider exploring higher return funds to balance risk.`;
            } else if (insight.risk_level === 'moderate') {
                recommendation = `Your investment in ${insight.fund_name} is moderately risky with an expected return of ${insight.expected_return}%. Keep monitoring performance.`;
            } else {
                recommendation = `Your investment in ${insight.fund_name} has a higher risk with a potential return of ${insight.expected_return}%. Diversification might help reduce risk.`;
            }
            return recommendation;
        });

        res.json({ insights: insightsMessage });
    });
});

// Protected endpoint for submitting watchlist details
app.post('/submit-watchlist-details', authenticateToken, (req, res) => {
    const { fund_name, fund_type, investment_goal, timeframe_years, risk_level } = req.body;

    console.log('Request body:', req.body);  // Log the request body to verify the data

    // Retrieve user ID from the token
    const userId = req.user.id;

    // Ensure that the required fields are provided
    if (!fund_name || !fund_type || !investment_goal || !timeframe_years || !risk_level) {
        return res.status(400).send('All fields are required.');
    }

    // Insert the watchlist data into the database
    const insertWatchlistQuery = `
        INSERT INTO watchlist (id, fund_name, fund_type, investment_goal, timeframe_years, risk_level)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertWatchlistQuery, [userId, fund_name, fund_type, investment_goal, timeframe_years, risk_level], (err, results) => {
        if (err) {
            console.error('Error inserting watchlist details:', err);
            return res.status(500).send('Error saving watchlist details.');
        }
        res.send('Watchlist details saved successfully.');
    });
});

// Protected endpoint for fetching watchlist data
app.get('/watchlist-data', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            fund_name,
            fund_type,
            investment_goal,
            timeframe_years,
            risk_level
        FROM watchlist
        WHERE id = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching watchlist data:', err);
            return res.status(500).json({ message: 'Error fetching watchlist data.' });
        }
        res.json(results);
    });
});

// Protected endpoint for fetching performance data
app.get('/performance-data', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            fund_name,
            investment_amount,
            investment_duration,
            expected_return,
            risk_level,
            created_at
        FROM MutualFunds
        WHERE id = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching performance data:', err);
            return res.status(500).send('Error fetching performance data.');
        }
        res.json(results);
    });
});

// Protected endpoint for fetching comparative analysis data
app.get('/comparative-analysis-data', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            fund_name,
            expected_return,
            risk_level,
            NULL AS expense_ratio -- Placeholder for expense ratio
        FROM MutualFunds
        WHERE id = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching comparative analysis data:', err);
            return res.status(500).send('Error fetching comparative analysis data.');
        }
        res.json(results);
    });
});

// Route to handle user queries
app.post('/query', async (req, res) => {
    const userInput = req.body.query;

    if (!userInput) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        // Forward the user query to the Python NLP API
        const FLASK_API_URL = process.env.FLASK_API_URL || 'http://127.0.0.1:5000';
        const response = await axios.post(`${FLASK_API_URL}/analyze`, { query: userInput });

        // Extract intent, entities, and data from the Python API's response
        const { intent, entities, data } = response.data;

        // Handle the response based on the detected intent
        if (intent === "recommendation") {
            res.json({ response: data }); // Send the recommended funds back to the user
        } else if (intent === "nav_prediction") {
            res.json({ response: data }); // Send the NAV prediction back to the user
        } else if (intent === "general") {
            res.json({ response: data }); // Send the general answer back to the user
        } else {
            res.json({ response: "I'm not sure how to help with that. Can you rephrase?" });
        }
    } catch (error) {
        console.error('Error communicating with NLP API:', error.message);
        res.status(500).json({ error: "An error occurred while processing your query." });
    }
});

// Example database fetching route (optional)
app.get('/funds', (req, res) => {
    const query = "SELECT * FROM Funds";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching funds:', err);
            return res.status(500).json({ error: "Failed to fetch funds." });
        }
        res.json(results);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});