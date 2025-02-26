CREATE DATABASE mutual_funds;
USE mutual_funds;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);
SHOW TABLES;
-- Create MutualFunds Table
CREATE TABLE MutualFunds (
    fund_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id INTEGER,
    fund_name VARCHAR(100) NOT NULL,
    investment_amount FLOAT NOT NULL,
    investment_date DATE NOT NULL,
    investment_duration INTEGER NOT NULL,
    risk_level VARCHAR(50),
    expected_return FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES Users(id)
);

-- Create Transactions Table
CREATE TABLE Transactions (
    transaction_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id INTEGER,
    fund_id INTEGER,
    transaction_type VARCHAR(50),
    amount FLOAT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES Users(id),
    FOREIGN KEY (fund_id) REFERENCES MutualFunds(fund_id)
);

-- Create Goals Table
CREATE TABLE Goals (
    goal_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id INTEGER,
    goal_name VARCHAR(100) NOT NULL,
    target_amount FLOAT NOT NULL,
    timeline_years INTEGER NOT NULL,
    purpose VARCHAR(255),
    current_progress FLOAT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES Users(id)
);

-- Create Watchlist Table
CREATE TABLE watchlist (
    watchlist_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    fund_name VARCHAR(255) NOT NULL,
    fund_type VARCHAR(50) NOT NULL,
    investment_goal VARCHAR(255) NOT NULL,
    timeframe_years INT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id)
);

SELECT * FROM users;
SELECT * FROM MutualFunds;
SELECT * FROM Transactions;
SELECT * FROM Goals;
SELECT * FROM watchlist;

-- Insert data into Transactions table
INSERT INTO Transactions (id, fund_id, transaction_type, amount, transaction_date)
VALUES 
    (1, 1, 'buy', 200000, '2023-10-15 10:30:00'),
    (1, 2, 'buy', 500000, '2023-11-01 09:45:00'),
    (2, 3, 'buy', 1000000, '2023-08-25 14:15:00'),
    (4, 4, 'buy', 1000, '2024-10-05 16:00:00');


CREATE TABLE Funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    risk_level VARCHAR(50),
    expense_ratio FLOAT,
    one_year_return FLOAT,
    three_year_return FLOAT,
    five_year_return FLOAT
);

CREATE TABLE FAQ (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255),
    answer TEXT
);

SELECT * FROM Funds;
SELECT * FROM FAQ;

-- SBI PSU Fund - DIRECT PLAN - GROWTH
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('SBI PSU Fund - DIRECT PLAN - GROWTH', 'Equity: Sectoral', 'High', 0.89, 32.50, 24.75, 18.50);

-- ICICI Prudential BHARAT 22 FOF
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('ICICI Prudential BHARAT 22 FOF', 'Equity: FoF', 'Very High', 0.12, 38.64, 135.63, 224.25);

-- HDFC Focused 30 Fund
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('HDFC Focused 30 Fund', 'Equity: Focused', 'High', 0.77, 24.10, 28.30, 20.75);

-- BANK OF INDIA MID & SMALL CAP EQUITY & DEBT FUND
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('BANK OF INDIA MID & SMALL CAP EQUITY & DEBT FUND', 'Hybrid: Aggressive', 'Moderate', 1.12, 19.50, 27.40, NULL);

-- HSBC Equity Savings Fund
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('HSBC Equity Savings Fund', 'Hybrid: Equity Savings', 'Low', 0.85, 12.00, 15.80, 11.50);

-- Kotak Equity Savings Fund
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('Kotak Equity Savings Fund', 'Hybrid: Equity Savings', 'Low', 0.72, 11.50, 14.90, 10.20);

-- Nippon India Large Cap Fund
INSERT INTO Funds (name, category, risk_level, expense_ratio, one_year_return, three_year_return, five_year_return)
VALUES ('Nippon India Large Cap Fund', 'Equity: Large Cap', 'High', 1.10, 14.75, 16.50, 14.20);

-- FAQ 1
INSERT INTO FAQ (question, answer)
VALUES ('What is a mutual fund?', 
        'A mutual fund is an investment vehicle that pools money from multiple investors to invest in securities like stocks, bonds, and other assets. Professional fund managers manage these funds to achieve specific investment objectives.');

-- FAQ 2
INSERT INTO FAQ (question, answer)
VALUES ('What are the types of mutual funds?', 
        'Mutual funds can be categorized as equity funds, debt funds, hybrid funds, sectoral/thematic funds, index funds, and fund of funds, depending on the investment objective and asset allocation.');

-- FAQ 3
INSERT INTO FAQ (question, answer)
VALUES ('What is an expense ratio in mutual funds?', 
        'The expense ratio is the annual fee charged by a mutual fund to manage your money. It is expressed as a percentage of the fund’s average assets under management (AUM).');

-- FAQ 4
INSERT INTO FAQ (question, answer)
VALUES ('How can I invest in mutual funds?', 
        'You can invest in mutual funds online through platforms like AMC websites, third-party apps, and brokers, or offline by visiting the fund house or submitting an application through a distributor.');

-- FAQ 5
INSERT INTO FAQ (question, answer)
VALUES ('What is NAV in mutual funds?', 
        'NAV stands for Net Asset Value, which represents the per-unit price of a mutual fund. It is calculated by dividing the total value of the fund’s assets by the number of outstanding units.');

-- FAQ 6
INSERT INTO FAQ (question, answer)
VALUES ('What are the risks of investing in mutual funds?', 
        'Risks include market risk, credit risk, interest rate risk, and liquidity risk. The level of risk depends on the type of mutual fund.');

-- FAQ 7
INSERT INTO FAQ (question, answer)
VALUES ('What is SIP in mutual funds?', 
        'SIP, or Systematic Investment Plan, allows you to invest a fixed amount regularly in a mutual fund scheme, promoting disciplined investing.');

-- FAQ 8
INSERT INTO FAQ (question, answer)
VALUES ('Can I redeem mutual funds anytime?', 
        'Yes, open-ended mutual funds allow redemption anytime. However, there might be exit loads or tax implications based on the holding period.');

-- FAQ 9
INSERT INTO FAQ (question, answer)
VALUES ('What is the lock-in period for ELSS mutual funds?', 
        'Equity Linked Savings Schemes (ELSS) have a lock-in period of three years, which is the shortest among tax-saving investments under Section 80C.');

-- FAQ 10
INSERT INTO FAQ (question, answer)
VALUES ('How are mutual funds taxed?', 
        'Taxation depends on the fund type and holding period. For example, equity funds held for less than one year attract 15% short-term capital gains tax, while those held for over a year attract 10% long-term capital gains tax above ₹1 lakh.');














