document.addEventListener("DOMContentLoaded", () => {
    // Get user profile elements
    const userNameElement = document.getElementById("user-name");
    const userEmailElement = document.getElementById("user-email");
    // Set the user name from localStorage if available
    const userName = localStorage.getItem("userName");
    if (userName) {
        userNameElement.textContent = userName;
    } else {
        window.location.href = "Extra.html"; // Redirect if not logged in
    }
    // Set the user email from localStorage if available
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
        userEmailElement.textContent = userEmail;
    }
    // Functions to open modals
    function openModal(modal) {
        modal.style.display = "flex";
    }
    // Functions to close modals
    function closeModal(modal) {
        modal.style.display = "none";
    }
    // Get the share button element
const shareButton = document.getElementById('share-button');
    // Add event listener to the Share button
    shareButton.addEventListener('click', function() {
    if (navigator.share) {
        // Web Share API is supported
        navigator.share({
            title: 'Mutual Funds Recommendation Chatbot',
            text: 'Check out this awesome chatbot for Mutual Fund recommendations!',
            url: window.location.href // Current page URL
        }).then(() => {
            console.log('Successfully shared');
        }).catch((error) => {
            console.log('Error sharing:', error);
        });
    } else {
        // Fallback if Web Share API is not supported
        alert('Sharing is not supported on this browser.');
    }
    });
    // Logout functionality
    document.querySelector(".logout-confirm").addEventListener("click", () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userLoggedIn");
        window.location.href = "Extra.html";
    });    
    // Get elements
    const attachFileButton = document.getElementById('attach-file');
    const fileInput = document.getElementById('file-input');
    // Attach event listener to open file input when the button is clicked
    attachFileButton.addEventListener('click', function() {
    fileInput.click();
    });
    // Handle file input change event to get the selected file
    fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Display or send the file (You can send the file to your backend or process it as needed)
        console.log('File selected:', file.name);
        // Add functionality here to display the file in chat or send it to your backend
    }
    });
    // Chat functionality
const sendButton = document.getElementById('send-button');
const inputField = document.getElementById('message-input');
sendButton.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
function sendMessage() {
    const userMessage = inputField.value.trim();
    const token = localStorage.getItem('token'); // Assuming token is saved in localStorage

    if (userMessage === '') {
        console.log("Empty message, not sending.");
        return; // Prevent empty messages
    }

    displayMessage(userMessage, 'user'); // Display user's message
    inputField.value = ''; // Clear the input field

    // Updated to use the Node.js backend endpoint
    fetch('http://127.0.0.1:3000/query', { // Node.js backend endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Optional, if you require token authentication
        },
        body: JSON.stringify({ query: userMessage }), // Send the user's query to the backend
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`); // Handle non-2xx status codes
        }
        return response.json();
    })
    .then(data => {
        if (data && data.response) {  // Adjusted to check for 'response' field in Node.js output
            displayMessage(data.response, 'bot'); // Display bot's response
        } else {
            displayMessage("No response received. Please try again later.", 'bot');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage("Sorry, there was an issue connecting to the server. Please check your connection.", 'bot');
    });
}

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    
    // Change the class based on sender
    if (sender === 'user') {
        messageElement.className = 'user-message';
    } else {
        messageElement.className = 'backend-message'; // Change class for backend messages
        document.getElementById('chat-messages').appendChild(messageElement);
        simulateTypingEffect(messageElement, message); // Call the typing effect function
        return; // Exit the function early to avoid immediate display
    }

    // Create a timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create a span for the message text
    const messageText = document.createElement('p');
    messageText.textContent = message;

    // Create a span for the timestamp
    const timestampElement = document.createElement('span');
    timestampElement.className = 'timestamp';
    timestampElement.textContent = timestamp; // Set timestamp text

    // Append message text and timestamp to the message element
    messageElement.appendChild(messageText);
    messageElement.appendChild(timestampElement);

    document.getElementById('chat-messages').appendChild(messageElement);

    // Scroll to the bottom of chat messages
    const chatArea = document.getElementById('chat-messages');
    chatArea.scrollTop = chatArea.scrollHeight;
}
function simulateTypingEffect(messageElement, message) {
    const messageText = document.createElement('p'); // Create a new paragraph for message text
    messageElement.appendChild(messageText); // Append message text to the message element

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create a span for the timestamp
    const timestampElement = document.createElement('span');
    timestampElement.className = 'timestamp';
    timestampElement.textContent = timestamp; // Set timestamp text
    messageElement.appendChild(timestampElement); // Append timestamp

    // Typing effect logic
    let index = 0;
    const baseTypingSpeed = 10; // Reduced base typing speed to 50ms
    const randomRange = 30; // Reduced randomization to 30ms for smoother experience

    const typingInterval = setInterval(() => {
        messageText.textContent += message[index]; // Add one character at a time
        index++;

        // Clear the interval once all characters are typed
        if (index === message.length) {
            clearInterval(typingInterval);
        }
    }, baseTypingSpeed + Math.random() * randomRange); // Introduce slight randomization
}
// Functionality for typing effect
function typeMessage(message) {
    const messageContainer = document.querySelector('.typing-effect');
    messageContainer.innerHTML = ''; // Clear any existing content

    const words = message.split(' ');
    let currentIndex = 0;

    function typeNextWord() {
        if (currentIndex < words.length) {
            messageContainer.innerHTML += words[currentIndex] + ' '; // Add the next word
            currentIndex++;
            setTimeout(typeNextWord, 250); // Wait for 250ms before typing the next word
        } else {
            // After finishing the typing effect, display the timestamp
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timestampElement = document.createElement('span');
            timestampElement.className = 'timestamp';
            timestampElement.textContent = timestamp; // Set timestamp text

            // Append the timestamp after the message
            messageContainer.appendChild(timestampElement);
        }
    }

    typeNextWord(); // Start typing the first word
}
// Example usage
typeMessage("Welcome! How can I assist you today, Ask me Regarding Mutual Funds?");
});

// Functionality for Open And Edit Profile
document.addEventListener("DOMContentLoaded", function() {
    // Elements
    const userProfile = document.getElementById("user-profile");
    const profileModal = document.getElementById("profile-modal");
    const editProfileModal = document.getElementById("edit-profile-modal");
    const closeProfileModalButton = document.getElementById("close-profile-modal");
    const closeEditProfileModalButton = document.getElementById("close-edit-profile-modal");
    const editProfileButton = document.getElementById("edit-profile-button");
    const saveProfileButton = document.getElementById("save-profile-button");

    // User Details Elements
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userNameModal = document.getElementById("user-name-modal");
    const userEmailModal = document.getElementById("user-email-modal");

    // Edit Form Elements
    const editNameInput = document.getElementById("edit-name");
    const editEmailInput = document.getElementById("edit-email");

    // Open Profile Modal
    userProfile.addEventListener("click", function() {
        profileModal.style.display = "block";
        userNameModal.textContent = userName.textContent;
        userEmailModal.textContent = userEmail.textContent;
    });

    // Close Profile Modal
    closeProfileModalButton.addEventListener("click", function() {
        profileModal.style.display = "none";
    });

    // Open Edit Profile Modal
    editProfileButton.addEventListener("click", function() {
        editProfileModal.style.display = "block";
        profileModal.style.display = "none";
        editNameInput.value = userName.textContent;
        editEmailInput.value = userEmail.textContent;
    });

    // Close Edit Profile Modal
    closeEditProfileModalButton.addEventListener("click", function() {
        editProfileModal.style.display = "none";
    });

    // Save Profile Changes
    saveProfileButton.addEventListener("click", function() {
        userName.textContent = editNameInput.value;
        userEmail.textContent = editEmailInput.value;
        userNameModal.textContent = editNameInput.value;
        userEmailModal.textContent = editEmailInput.value;
        editProfileModal.style.display = "none";
    });

    // Close Modals on Click Outside
    window.addEventListener("click", function(event) {
        if (event.target === profileModal) {
            profileModal.style.display = "none";
        }
        if (event.target === editProfileModal) {
            editProfileModal.style.display = "none";
        }
    });
});

// Functionality for Dashboard Button
document.addEventListener("DOMContentLoaded", function() {
    // Elements
    const dashboardModal = document.getElementById('dashboard-modal');
    const dashboardButton = document.getElementById('dashboard-button');
    const closeModalButton = document.querySelector('#dashboard-modal .modal-close');
    const calculateProjectionButton = document.getElementById('calculate-projection');

    let myChart; // Global chart variable for re-use

    // Open Dashboard Modal and Fetch Data
    dashboardButton.addEventListener('click', function() {
        dashboardModal.style.display = 'flex';
        fetchDashboardData();
    });

    // Close Modal Button
    closeModalButton.addEventListener('click', function() {
        dashboardModal.style.display = 'none';
    });

    // Close Modal on Click Outside
    window.addEventListener('click', function(event) {
        if (event.target === dashboardModal) {
            dashboardModal.style.display = 'none';
        }
    });

    // Fetch and Update Dashboard Data
    async function fetchDashboardData() {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:3000/fund-details', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
            updateDashboard(data);

            // Fetch insights
            fetchPersonalizedInsights();

        } catch (error) {
            console.error(error);
        }
    }

    function updateDashboard(data) {
        const { fundResults, historyResults } = data;

        // Portfolio Overview Calculation
        const totalInvestment = fundResults.reduce((sum, fund) => sum + fund.investment_amount, 0);
        const currentValue = totalInvestment + (totalInvestment * fundResults[0]?.expected_return / 100);
        const gainLoss = currentValue - totalInvestment;

        document.getElementById('total-investment').innerText = `₹${totalInvestment.toFixed(2)}`;
        document.getElementById('current-value').innerText = `₹${currentValue.toFixed(2)}`;
        document.getElementById('gain-loss').innerText = `₹${gainLoss.toFixed(2)} (${((gainLoss / totalInvestment) * 100).toFixed(2)}%)`;

        // Chart Data Preparation
        const labels = historyResults.map(entry => entry.month);
        const chartData = historyResults.map(entry => entry.total_investment);

        updatePortfolioChart(labels, chartData);
    }

    // Chart Update Function
    function updatePortfolioChart(labels, data) {
        if (myChart) {
            myChart.destroy();
        }

        const ctx = document.getElementById('portfolio-chart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Portfolio Growth',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Future Projection Calculation
    calculateProjectionButton.addEventListener('click', function() {
        const growthRate = parseFloat(document.getElementById('growth-rate').value);
        const totalInvestment = parseFloat(document.getElementById('total-investment').innerText.replace('₹', ''));

        if (!isNaN(growthRate) && totalInvestment > 0) {
            const years = 5;
            const projectedValue = totalInvestment * Math.pow((1 + (growthRate / 100)), years);
            document.getElementById('projected-value').innerText = `₹${projectedValue.toFixed(2)}`;
        } else {
            alert('Please enter a valid growth rate.');
        }
    });

    // Function to fetch and display personalized insights
    async function fetchPersonalizedInsights() {
    try {
        const response = await fetch('http://localhost:3000/personalized-insights', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store JWT token in localStorage
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch personalized insights.');
        }

        const data = await response.json();
        const insightList = document.getElementById('insight-list');
        insightList.innerHTML = ''; // Clear existing content

        if (data.insights.length > 0) {
            data.insights.forEach(insight => {
                const listItem = document.createElement('li');
                listItem.textContent = insight; // Add insight message to the list
                insightList.appendChild(listItem);
            });
        } else {
            // Handle case where there are no insights
            const noInsightMessage = document.createElement('li');
            noInsightMessage.textContent = 'No personalized insights available at this time.';
            insightList.appendChild(noInsightMessage);
        }
    } catch (error) {
        console.error('Error fetching insights:', error);
        const insightList = document.getElementById('insight-list');
        const errorMessage = document.createElement('li');
        errorMessage.textContent = 'Error fetching insights. Please try again later.';
        insightList.appendChild(errorMessage);
    }
    }
    // Call the function to fetch and display insights when the page loads
    window.onload = fetchPersonalizedInsights;
});

// Functionality for Recommendations Button
document.addEventListener("DOMContentLoaded", function() {
document.getElementById('recommendations-button').addEventListener('click', function () {
    document.getElementById('recommendations-modal').style.display = 'flex'; // Show modal
    fetchRecommendationsData(); // Fetch data when opening the modal
});

// Function to fetch personalized investment recommendations
async function fetchRecommendationsData() {
    const token = localStorage.getItem('token'); // Get the JWT token from local storage

    try {
        const response = await fetch('http://localhost:3000/recommendations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recommendations: ' + response.status);
        }

        const data = await response.json();
        console.log("Fetched Recommendations Data:", data); // Log to ensure data accuracy
        updateRecommendations(data); // Populate the modal with the received data
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

// Update the recommendations modal with dynamic data
function updateRecommendations(data) {
    if (!data || !data.recommendations) {
        console.error("Invalid recommendations data received:", data);
        return;
    }

    const fundsContainer = document.querySelector('#recommended-funds .fund-data');
    fundsContainer.innerHTML = ''; // Clear previous content

    // Populate fund recommendations
    data.recommendations.forEach(fund => {
        const fundElement = document.createElement('div');
        fundElement.classList.add('fund');
        fundElement.innerHTML = `
            <h4>${fund.name}</h4>
            <p><em>${fund.tagline}</em></p>
            <p>${fund.description}</p>
            <p><strong>Annualized Returns:</strong> ${fund.annualized_returns}%</p>
            <p><strong>Expense Ratio:</strong> ${fund.expense_ratio}%</p>
            <p><strong>AUM:</strong> $${fund.aum} Billion</p>
        `;
        fundsContainer.appendChild(fundElement);
        const hr = document.createElement('hr');
        fundsContainer.appendChild(hr);
    });
}

// Close modal functionality for the close button
document.querySelector('#recommendations-modal .modal-close').addEventListener('click', function () {
    document.getElementById('recommendations-modal').style.display = 'none'; // Hide modal
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('recommendations-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
});

// Functionality for Show Performance Tracker 
document.addEventListener("DOMContentLoaded", function() {
document.getElementById('performance-tracker-button').addEventListener('click', function () {
    document.getElementById('performance-tracker-modal').style.display = 'flex'; // Show modal
    fetchPerformanceData(); // Fetch data when opening the modal
});
// Fetch performance data from the server
async function fetchPerformanceData() {
    const token = localStorage.getItem('token'); // Get the JWT token from local storage

    const response = await fetch('http://localhost:3000/performance-data', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (response.ok) {
        const performanceData = await response.json();
        updatePerformanceTracker(performanceData);
    } else {
        console.error('Failed to fetch performance data:', response.status);
    }
}
// Update the Performance Tracker with fetched data
function updatePerformanceTracker(performanceData) {
    // Calculate total portfolio value
    const totalPortfolioValue = performanceData.reduce((acc, fund) => acc + fund.investment_amount, 0);

    // Calculate overall growth (example logic)
    const overallGrowth = calculateOverallGrowth(performanceData, totalPortfolioValue);

    // Calculate annualized return (example logic)
    const annualizedReturn = calculateAnnualizedReturn(performanceData);

    // Update the Portfolio Snapshot with RS sign
    document.querySelector('.tile-content p:nth-child(1) span.highlight').innerText = `₹${totalPortfolioValue.toFixed(2)}`;
    document.querySelector('.tile-content p:nth-child(2) span.highlight').innerText = `+${overallGrowth.toFixed(2)}%`;
    document.querySelector('.tile-content p:nth-child(3) span.highlight').innerText = `+${annualizedReturn.toFixed(2)}%`;

    // Update Top Performing Investments (Example)
    const investmentList = document.querySelector('.investment-list');
    investmentList.innerHTML = ''; // Clear existing list
    performanceData.forEach(fund => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${fund.fund_name}:</strong> <span class="highlight">+${fund.expected_return}%</span> (Risk Level: ${fund.risk_level})`;
        investmentList.appendChild(listItem);
    });

    // Update Risk Assessment
    const currentRiskLevel = getCurrentRiskLevel(performanceData);
    document.querySelector('.risk').innerText = currentRiskLevel;

    // Update Market Insights & Recommendations (Add your own logic)
}
// Calculate overall growth based on investment amount and expected returns
function calculateOverallGrowth(performanceData, totalPortfolioValue) {
    let totalGain = 0;

    performanceData.forEach(fund => {
        // Assuming expected_return is in percentage
        totalGain += (fund.investment_amount * fund.expected_return / 100);
    });

    // Overall growth percentage formula
    const overallGrowth = (totalGain / totalPortfolioValue) * 100; // Calculate growth as a percentage of total portfolio value
    return overallGrowth;
}
// Calculate annualized return based on investment duration and expected return
function calculateAnnualizedReturn(performanceData) {
    let totalReturn = 0;
    let totalDuration = 0;

    performanceData.forEach(fund => {
        totalReturn += (fund.expected_return / 100) * fund.investment_amount; // Simple expected return
        totalDuration += fund.investment_duration; // Sum of durations
    });

    // Assuming average duration gives us a general idea of the annualized return
    const averageReturn = totalReturn / performanceData.length;
    return (averageReturn / (totalDuration / performanceData.length)); // Annualized return formula
}
// Determine current risk level based on risk levels of investments
function getCurrentRiskLevel(performanceData) {
    const riskLevels = performanceData.map(fund => fund.risk_level);

    // Determine the overall risk level
    const riskLevelCounts = {
        Low: 0,
        Moderate: 0,
        High: 0
    };

    riskLevels.forEach(level => {
        if (level in riskLevelCounts) {
            riskLevelCounts[level]++;
        }
    });

    // Determine which risk level is predominant
    const highestRiskLevel = Object.entries(riskLevelCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return highestRiskLevel; // Return the predominant risk level
}
// Close modal functionality for the close button
document.querySelector('#performance-tracker-modal .modal-close').addEventListener('click', function () {
    document.getElementById('performance-tracker-modal').style.display = 'none'; // Hide modal
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('performance-tracker-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
});

// Functionality for Comparative Analysis 
document.addEventListener("DOMContentLoaded", function() {
document.getElementById('comparative-analysis-button').addEventListener('click', function () {
    document.getElementById('comparative-analysis-modal').style.display = 'flex'; // Show modal
    fetchComparativeAnalysisData(); // Fetch data when opening the modal
});

// Fetch comparative analysis data from the server
async function fetchComparativeAnalysisData() {
    const token = localStorage.getItem('token'); // Get the JWT token from local storage

    const response = await fetch('http://localhost:3000/comparative-analysis-data', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (response.ok) {
        const comparativeData = await response.json();
        updateComparativeAnalysisTable(comparativeData);
    } else {
        console.error('Failed to fetch comparative analysis data:', response.status);
    }
}
// Update the Comparative Analysis Table with fetched data
function updateComparativeAnalysisTable(comparativeData) {
    const tableBody = document.getElementById('comparative-analysis-body');
    tableBody.innerHTML = ''; // Clear existing rows

    comparativeData.forEach(fund => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${fund.fund_name}</strong></td>
            <td><strong>${fund.expected_return}%</strong></td>
            <td><strong>${fund.risk_level}</strong></td>
            <td><strong>${fund.expense_ratio || 'N/A'}</strong></td>
        `;
        tableBody.appendChild(row);
    });
}
// Close modal functionality for the close button
document.querySelector('#comparative-analysis-modal .modal-close').addEventListener('click', function () {
    document.getElementById('comparative-analysis-modal').style.display = 'none'; // Hide modal
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('comparative-analysis-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

});

document.addEventListener("DOMContentLoaded", function() {
    // Show Investment Goals Modal
    document.getElementById('investment-goals-button').addEventListener('click', function () {
        document.getElementById('investment-goals-modal').style.display = 'flex';
    });

    // Close modal functionality
    document.querySelector('#investment-goals-modal .modal-close').addEventListener('click', function () {
        document.getElementById('investment-goals-modal').style.display = 'none';
    });

    // Close modal when clicking outside content
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('investment-goals-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Monthly Contribution Calculation
    document.getElementById('calculate-contribution-button').addEventListener('click', function() {
        const targetAmount = parseFloat(document.getElementById('goal-target').value);
        const timeline = parseInt(document.getElementById('goal-timeline').value);

        if (isNaN(targetAmount) || isNaN(timeline) || targetAmount <= 0 || timeline <= 0) {
            alert('Please enter valid numbers for target amount and timeline.');
            return;
        }

        const months = timeline * 12;
        const monthlyContribution = targetAmount / months;
        document.getElementById('monthly-contribution-result').textContent = 
            `You need to invest ₹${monthlyContribution.toFixed(2)} per month to reach your target of ₹${targetAmount} in ${timeline} years.`;
    });

    // Risk Profile Assessment
    document.getElementById('assess-risk-button').addEventListener('click', function() {
        const experience = document.getElementById('experience').value;
        const comfortLevel = document.getElementById('comfort').value;
        let riskProfile = '';

        if (experience === 'beginner' && comfortLevel === 'low') {
            riskProfile = 'Low Risk - Suitable for conservative investments like Fixed Deposits and PPF.';
        } else if (experience === 'intermediate' && comfortLevel === 'moderate') {
            riskProfile = 'Moderate Risk - Suitable for balanced investments like Mutual Funds and a mix of stocks.';
        } else if (experience === 'expert' && comfortLevel === 'high') {
            riskProfile = 'High Risk - Suitable for aggressive investments like Stock Market and Real Estate.';
        } else {
            riskProfile = 'Your risk profile is not clearly defined. Consider discussing with a financial advisor.';
        }

        document.getElementById('risk-profile-result').textContent = `Your Risk Profile: ${riskProfile}`;
    });

    // Dynamic Investment Recommendations
    function showInvestmentRecommendations() {
        const timeline = parseInt(document.getElementById('goal-timeline').value);
        const comfortLevel = document.getElementById('comfort').value;
        let recommendations = '';

        if (timeline <= 5) {
            recommendations = '<ul><li>Consider investing in Fixed Deposits or PPF for low-risk, short-term goals.</li></ul>';
        } else if (timeline <= 10) {
            recommendations = (comfortLevel === 'moderate')
                ? '<ul><li>Balanced Mutual Funds with moderate equity exposure.</li></ul>'
                : '<ul><li>Consider a mix of Mutual Funds and Stocks for higher returns.</li></ul>';
        } else {
            recommendations = '<ul><li>Consider long-term investments in Real Estate and Stock Market for higher returns over the long term.</li></ul>';
        }

        document.getElementById('investment-recommendations').innerHTML = recommendations;
    }

    document.getElementById('goal-timeline').addEventListener('change', showInvestmentRecommendations);
    document.getElementById('comfort').addEventListener('change', showInvestmentRecommendations);

    // Schedule Consultation
    document.getElementById('schedule-consultation-button').addEventListener('click', function() {
        alert("You can now schedule a consultation with our financial advisor. We’ll get in touch with you shortly.");
    });
});

// Functionality for Watchlist
document.addEventListener("DOMContentLoaded", function() {
    // Show the Watchlist Modal when the button is clicked
    document.getElementById('watchlist-button').addEventListener('click', function() {
        const modal = document.getElementById('watchlist-modal'); // Reference the modal
        modal.style.display = 'flex'; // Show modal
        fetchWatchlistData(); // Fetch watchlist data when opening the modal
    });

    // Close modal functionality for the close button
    document.querySelector('#watchlist-modal .modal-close').addEventListener('click', function() {
        const modal = document.getElementById('watchlist-modal'); // Reference the modal
        modal.style.display = 'none'; // Hide modal
    });

    // Close modal when clicking outside of the modal content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('watchlist-modal'); // Reference the modal
        if (event.target === modal) {
            modal.style.display = 'none'; // Hide modal
        }
    });

    // Fetch Watchlist data from the server
    async function fetchWatchlistData() {
        const token = localStorage.getItem('token'); // Get the JWT token from local storage

        try {
            const response = await fetch('http://localhost:3000/watchlist-data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const watchlistData = await response.json();
                updateWatchlistItems(watchlistData); // Update the modal with fetched data
            } else {
                console.error('Failed to fetch watchlist data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching watchlist data:', error);
        }
    }

    // Update the Watchlist Modal with fetched data
    function updateWatchlistItems(watchlistData) {
        const watchlistItems = document.getElementById('watchlist-items');
        watchlistItems.innerHTML = ''; // Clear existing items

        // Loop through the fetched data and populate the list
        watchlistData.forEach(fund => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${fund.fund_name}</strong> (${fund.fund_type}) - 
                Goal: ${fund.investment_goal}, 
                Timeframe: ${fund.timeframe_years} years, 
                Risk Level: ${fund.risk_level}
                <button class="set-alert-button" onclick="setAlert(${fund.id})">Set Alert</button>
            `;
            watchlistItems.appendChild(listItem);
        });
    }

    // Set alert functionality for each fund
    function setAlert(fundId) {
        const thresholdInput = document.getElementById('alert-threshold');
        const thresholdValue = parseFloat(thresholdInput.value);

        // Check if the threshold value is valid
        if (isNaN(thresholdValue) || thresholdValue <= 0) {
            alert('Please enter a valid percentage change.');
            return;
        }

        // Logic to save the alert threshold (e.g., save to server or local storage)
        // For now, just log it to the console for simplicity
        console.log(`Alert set for Fund ID ${fundId} when exceeding ${thresholdValue}% change.`);

        // Clear the input field
        thresholdInput.value = '';

        // Inform the user
        alert(`Alert set for Fund ID ${fundId} when it exceeds ${thresholdValue}%.`);
    }

    // Contact expert advisors functionality
    document.querySelector('.cta-button').addEventListener('click', function() {
        // Redirect to the advisor contact page or show contact form
        window.location.href = 'Financial Expert Advice.html'; // Uncomment to redirect
    });

    // Show insights modal when the "View Insights" button is clicked
    document.querySelector('.learn-more-button').addEventListener('click', function() {
        const insightsModal = document.getElementById('fundInsightsModal'); // Reference the insights modal
        insightsModal.style.display = 'flex'; // Show the modal
    });

    // Function to close the insights modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId); // Reference the modal using its ID
        modal.style.display = 'none'; // Hide the modal
    }

    // Close insights modal when clicking outside of the modal content
    window.addEventListener('click', function(event) {
        const insightsModal = document.getElementById('fundInsightsModal'); // Reference the insights modal
        if (event.target === insightsModal) {
            insightsModal.style.display = 'none'; // Hide modal
        }
    });
});

// Functionality for Resources
document.addEventListener("DOMContentLoaded", function() {
    // Show Resources Modal when button is clicked
document.getElementById('resources-button').addEventListener('click', function () {
    document.getElementById('resources-modal').style.display = 'flex'; // Show modal
});

// Close modal functionality for the close button
document.querySelector('#resources-modal .modal-close').addEventListener('click', function () {
    document.getElementById('resources-modal').style.display = 'none'; // Hide modal
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('resources-modal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Hide modal
    }
});

});

// Functionality for Testimonials 
document.addEventListener("DOMContentLoaded", function() {
    // Open the Testimonials Modal when a button is clicked
document.getElementById('testimonials-button').addEventListener('click', function() {
    document.getElementById('testimonials-modal').style.display = 'flex'; // Show modal
});

// Close the modal when clicking on the close button
document.getElementById('close-testimonials-modal').addEventListener('click', function() {
    document.getElementById('testimonials-modal').style.display = 'none'; // Hide modal
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('testimonials-modal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Hide modal if clicked outside
    }
});

// Carousel functionality - navigating testimonials
let currentIndex = 0;
const testimonials = document.querySelectorAll('.testimonial-tile');
const totalTestimonials = testimonials.length;

// Show the next testimonial
function showNextTestimonial() {
    testimonials[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % totalTestimonials; // Cycle through testimonials
    testimonials[currentIndex].classList.add('active');
}

// Show the previous testimonial
function showPrevTestimonial() {
    testimonials[currentIndex].classList.remove('active');
    currentIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials; // Cycle through testimonials
    testimonials[currentIndex].classList.add('active');
}

// Event listeners for carousel control buttons
document.querySelector('.carousel-control.next').addEventListener('click', showNextTestimonial);
document.querySelector('.carousel-control.prev').addEventListener('click', showPrevTestimonial);

// Submit Testimonial button functionality
document.getElementById('submit-testimonial').addEventListener('click', function() {
    // Logic to handle submitting a testimonial can be added here.
    // For example, open a new form or modal, or send data to a server.
    alert("Thank you for wanting to share your testimonial!"); // Placeholder for action
});

// Initial setup to show the first testimonial as active
testimonials[currentIndex].classList.add('active');

});

// Functionality for About Us
document.addEventListener("DOMContentLoaded", function() {
    // Show the About Us Modal when button is clicked
    document.getElementById('about-us-button').addEventListener('click', function () {
        document.getElementById('about-us-modal').style.display = 'flex'; // Show modal
    });
    
    // Close the About Us Modal when the close button (×) is clicked
    document.querySelector('#about-us-modal .modal-close').addEventListener('click', function () {
        document.getElementById('about-us-modal').style.display = 'none'; // Hide modal
    });
    
    // Close the About Us Modal if the user clicks outside the modal content
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('about-us-modal');
        if (event.target === modal) {
            modal.style.display = 'none'; // Hide modal
        }
    });
    
    
});
// About Us Contact form
document.addEventListener("DOMContentLoaded", function () {
    // Select elements
    const contactButton = document.getElementById("contact-us-button");
    const contactForm = document.getElementById("contact-form");
    const formCloseButton = contactForm.querySelector(".form-close");

    // Create an overlay for the popup
    const overlay = document.createElement("div");
    overlay.id = "contact-form-overlay";
    document.body.appendChild(overlay);

    // Function to open the contact form as a modal
    function openContactForm() {
        contactForm.style.display = "block";
        overlay.style.display = "block";
    }

    // Function to close the contact form
    function closeContactForm() {
        contactForm.style.display = "none";
        overlay.style.display = "none";
    }

    // Event listener to open the contact form when clicking the "Get in Touch" button
    contactButton.addEventListener("click", function (event) {
        event.preventDefault();
        openContactForm();
    });

    // Event listener to close the contact form when clicking the close button
    formCloseButton.addEventListener("click", function () {
        closeContactForm();
    });

    // Event listener to close the form if clicking outside of it
    overlay.addEventListener("click", function () {
        closeContactForm();
    });
});

// Functionality for Settings 
document.addEventListener("DOMContentLoaded", function() {
    // Open the settings modal when a specific button is clicked
document.getElementById('open-settings-button').addEventListener('click', function () {
    document.getElementById('settings-modal').style.display = 'flex'; // Show modal
});

// Close the modal when clicking the close button (×)
document.getElementById('close-settings-modal').addEventListener('click', function () {
    document.getElementById('settings-modal').style.display = 'none'; // Hide modal
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('settings-modal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Hide modal when clicking outside
    }
});

// Handle logic for each of the settings options
document.getElementById('theme-settings').addEventListener('click', function () {
    alert("Theme customization options will be here.");
    // Logic for theme customization
});

document.getElementById('notification-preferences').addEventListener('click', function () {
    alert("Notification preferences options will be here.");
    // Logic for notification preferences
});

document.getElementById('accessibility-options').addEventListener('click', function () {
    alert("Accessibility options will be here.");
    // Logic for accessibility options
});

document.getElementById('privacy-settings').addEventListener('click', function () {
    alert("Privacy settings options will be here.");
    // Logic for privacy settings
});

document.getElementById('security-settings').addEventListener('click', function () {
    alert("Security settings options will be here.");
    // Logic for security settings
});

document.getElementById('account-deletion').addEventListener('click', function () {
    alert("Account management and deletion options will be here.");
    // Logic for account management
});

document.getElementById('investment-preferences').addEventListener('click', function () {
    alert("Investment preferences options will be here.");
    // Logic for investment preferences
});

document.getElementById('language-settings').addEventListener('click', function () {
    alert("Language and region settings will be here.");
    // Logic for language and region settings
});

document.getElementById('data-backup').addEventListener('click', function () {
    alert("Data backup and restore options will be here.");
    // Logic for data backup and restore
});

document.getElementById('data-export').addEventListener('click', function () {
    alert("Data export options will be here.");
    // Logic for data export
});

document.getElementById('help-center').addEventListener('click', function () {
    alert("Help center options will be here.");
    // Logic for accessing help center
});

document.getElementById('system-notifications').addEventListener('click', function () {
    alert("System notifications options will be here.");
    // Logic for system notifications
});

// Handle apply changes button
document.getElementById('apply-settings').addEventListener('click', function () {
    alert("Changes have been applied.");
    // Logic for applying settings and saving changes

    // For demonstration purposes, close the modal after applying settings
    document.getElementById('settings-modal').style.display = 'none';
});

});

// Functionality for Feedback
document.addEventListener("DOMContentLoaded", function() {
    // Show the feedback modal when the feedback button is clicked
document.getElementById('feedback').addEventListener('click', function () {
    document.getElementById('feedback-modal').style.display = 'flex'; // Show the feedback modal
});

// Close the modal when the close button (×) is clicked
document.querySelector('.modal-close').addEventListener('click', function () {
    document.getElementById('feedback-modal').style.display = 'none'; // Hide the modal
});

// Close the modal when the cancel button is clicked
document.querySelector('.feedback-cancel').addEventListener('click', function () {
    document.getElementById('feedback-modal').style.display = 'none'; // Hide the modal
});

// Handle the send feedback button
document.querySelector('.send-feedback').addEventListener('click', function () {
    const feedbackText = document.querySelector('.feedback-textarea').value;
    const feedbackEmail = document.querySelector('.feedback-email').value;

    if (feedbackText.trim() === '') {
        alert('Please provide your feedback or describe the issue.');
        return;
    }

    const feedbackData = {
        feedback: feedbackText,
        email: feedbackEmail || null // Include email only if provided
    };

    // Simulate sending the feedback (replace this with actual AJAX or fetch call)
    sendFeedback(feedbackData);
});

// Simulated feedback submission (you can replace this with an actual API call)
function sendFeedback(feedbackData) {
    // For now, just log the feedback data to the console
    console.log('Sending feedback:', feedbackData);

    // After sending feedback, close the modal
    document.getElementById('feedback-modal').style.display = 'none';

    // Clear the textarea and email input
    document.querySelector('.feedback-textarea').value = '';
    document.querySelector('.feedback-email').value = '';

    // Show a confirmation message (optional)
    alert('Thank you for your feedback! We appreciate your input.');
}

});

// Functionality for Mutual Fund Details Collection Modal
document.addEventListener("DOMContentLoaded", function() {
    // Open the Modal for Collecting Fund Details
const modal = document.getElementById('fund-details-modal');
document.getElementById('open-fund-details-modal').addEventListener('click', () => {
    modal.style.display = 'block'; // Show modal
    resetModal(); // Reset modal when opened
});

// Close Modal
document.querySelector('.modal-close').addEventListener('click', () => {
    modal.style.display = 'none'; // Hide modal
});

// Step navigation
const steps = document.querySelectorAll('.step');
const nextBtns = document.querySelectorAll('.next-step-btn');
const prevBtns = document.querySelectorAll('.prev-step-btn');
const stepProgress = document.querySelectorAll('.progress-step');
let currentStep = 0;

nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep === 2) { // Step 3 is index 2
                fillReviewDetails(); // Fill in review details
            }
            changeStep(currentStep + 1);
        }
    });
});

prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        changeStep(currentStep - 1); // Go to previous step
    });
});

// Function to change step and update progress indicator
function changeStep(stepIndex) {
    steps[currentStep].classList.remove('active-step');
    stepProgress[currentStep].classList.remove('active');
    currentStep = stepIndex;
    steps[currentStep].classList.add('active-step');
    stepProgress[currentStep].classList.add('active');
}

// Step validation logic (e.g., required fields)
function validateStep(stepIndex) {
    const step = steps[stepIndex];
    const inputs = step.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('input-error');
            isValid = false;
        } else {
            input.classList.remove('input-error');
        }
    });

    return isValid;
}

// Pre-fill review data (Step 4)
function fillReviewDetails() {
    document.getElementById('confirm-fund-name').textContent = document.getElementById('fund-name').value;
    document.getElementById('confirm-investment-amount').textContent = document.getElementById('investment-amount').value;
    document.getElementById('confirm-investment-date').textContent = document.getElementById('investment-date').value;
    document.getElementById('confirm-fund-duration').textContent = document.getElementById('fund-duration').value;
    document.getElementById('confirm-risk-level').textContent = document.getElementById('risk-level').value;
    document.getElementById('confirm-expected-return').textContent = document.getElementById('expected-return').value;
}

// Reset the modal (for reuse)
function resetModal() {
    currentStep = 0;
    steps.forEach((step, index) => {
        if (index !== 0) {
            step.classList.remove('active-step');
        } else {
            step.classList.add('active-step');
        }
        stepProgress[index].classList.remove('active');
    });
    stepProgress[0].classList.add('active');
}

// Submit Fund Details
document.getElementById('submit-fund-details-btn').addEventListener('click', () => {
    // Gather data from the input fields
    const fundName = document.getElementById('fund-name').value;
    const investmentAmount = parseFloat(document.getElementById('investment-amount').value);
    const investmentDate = document.getElementById('investment-date').value;
    const investmentDuration = parseInt(document.getElementById('fund-duration').value, 10);
    const riskLevel = document.getElementById('risk-level').value;
    const expectedReturn = parseFloat(document.getElementById('expected-return').value);

    // Create the data object
    const fundDetails = {
        fundName,
        investmentAmount,
        investmentDate,
        investmentDuration,
        riskLevel,
        expectedReturn,
    };

    // Retrieve the token from local storage
    const yourJWTToken = localStorage.getItem('token');

    // Make a POST request to submit the fund details
    fetch('http://localhost:3000/submit-fund-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${yourJWTToken}`, // Use the stored token
        },
        body: JSON.stringify(fundDetails),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Mutual fund details submitted successfully!'); // User notification
        modal.style.display = 'none'; // Close the modal after submission
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error submitting mutual fund details.');
    });
});

// Open modal for adding Mutual Fund details
document.getElementById('open-fund-details-modal').addEventListener('click', () => {
    modal.style.display = 'block';
});

});

// Functionality for Enhanced Personalized Watchlist Modal
document.addEventListener("DOMContentLoaded", function() {
    // Open Modal for Personalized Watchlist
const personalizedWatchlistModal = document.getElementById('watchlist-details-modal');
const openPersonalizedWatchlistBtn = document.getElementById('open-watchlist-details-modal');
if (openPersonalizedWatchlistBtn) {
    openPersonalizedWatchlistBtn.addEventListener('click', () => {
        personalizedWatchlistModal.style.display = 'block';
    });
}

// Close Modal
const closePersonalizedWatchlistBtn = document.querySelector('#watchlist-details-modal .modal-close');
if (closePersonalizedWatchlistBtn) {
    closePersonalizedWatchlistBtn.addEventListener('click', () => {
        personalizedWatchlistModal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Re-enable background scroll
    });
}

// Close Modal on Outside Click
window.addEventListener('click', (e) => {
    if (e.target === personalizedWatchlistModal) {
        personalizedWatchlistModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
});

// Step Navigation for Personalized Watchlist Modal
const watchlistSteps = document.querySelectorAll('#watchlist-details-modal .step');
const watchlistNextBtns = document.querySelectorAll('#watchlist-details-modal .next-step-btn');
const watchlistPrevBtns = document.querySelectorAll('#watchlist-details-modal .prev-step-btn');
const watchlistStepProgress = document.querySelectorAll('#watchlist-details-modal .progress-step');
let currentWatchlistStep = 0;

// Next Button Functionality
watchlistNextBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        if (validateWatchlistStep(currentWatchlistStep)) {
            // If moving to the review step, populate the review data
            if (currentWatchlistStep === 2) { // Step 3 (index 2) is the risk assessment step
                fillWatchlistReviewDetails();
            }
            changeWatchlistStep(currentWatchlistStep + 1);
        }
    });
});

// Previous Button Functionality
watchlistPrevBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        changeWatchlistStep(currentWatchlistStep - 1);
    });
});

// Function to Change Step and Update Progress
function changeWatchlistStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= watchlistSteps.length) return; // Prevent invalid step index
    watchlistSteps[currentWatchlistStep].classList.remove('active-step');
    watchlistStepProgress[currentWatchlistStep].classList.remove('active');

    currentWatchlistStep = stepIndex;
    watchlistSteps[currentWatchlistStep].classList.add('active-step');
    watchlistStepProgress[currentWatchlistStep].classList.add('active');
    console.log(`Current Step: ${currentWatchlistStep}`);
}

// Step Validation Logic for Watchlist Steps
function validateWatchlistStep(stepIndex) {
    const step = watchlistSteps[stepIndex];
    const inputs = step.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('input-error');
            isValid = false;
        } else {
            input.classList.remove('input-error');
        }
    });

    return isValid;
}

// Pre-fill Review Data in the Summary Step
function fillWatchlistReviewDetails() {
    // Fetch values from the previous steps
    const fundName = document.getElementById('watchlist-fund-name').value;
    const fundType = document.getElementById('watchlist-fund-type').value;
    const investmentGoal = document.getElementById('watchlist-goal').value;
    const timeframeYears = document.getElementById('watchlist-timeframe').value;
    const riskLevel = document.getElementById('watchlist-risk-level').value;

    console.log('Filling review details...');
    console.log(`Fund Name: ${fundName}, Fund Type: ${fundType}, Investment Goal: ${investmentGoal}, Timeframe: ${timeframeYears}, Risk Level: ${riskLevel}`);

    // Update the review summary with the collected values
    document.getElementById('confirm-watchlist-fund-name').textContent = fundName;
    document.getElementById('confirm-watchlist-fund-type').textContent = fundType;
    document.getElementById('confirm-watchlist-goal').textContent = investmentGoal;
    document.getElementById('confirm-watchlist-timeframe').textContent = timeframeYears;
    document.getElementById('confirm-watchlist-risk-level').textContent = riskLevel;
}

// Submit Button Logic for Watchlist Modal
const submitWatchlistBtn = document.getElementById('submit-watchlist-btn');
if (submitWatchlistBtn) {
    submitWatchlistBtn.addEventListener('click', () => {
        // Gather data from the input fields
        const fundName = document.getElementById('watchlist-fund-name').value;
        const fundType = document.getElementById('watchlist-fund-type').value;
        const investmentGoal = document.getElementById('watchlist-goal').value;
        const timeframeYears = parseInt(document.getElementById('watchlist-timeframe').value, 10); // Match `timeframe_years` in the table
        const riskLevel = document.getElementById('watchlist-risk-level').value;

        // Validate timeframeYears
        if (isNaN(timeframeYears)) {
            alert('Timeframe must be a valid number.');
            return;
        }

        // Create the data object
        const watchlistDetails = {
            fund_name: fundName,  // Match table field names
            fund_type: fundType,
            investment_goal: investmentGoal,
            timeframe_years: timeframeYears,
            risk_level: riskLevel,
        };

        // Retrieve the token from local storage
        const jwtToken = localStorage.getItem('token');

        if (!jwtToken) {
            alert('Authorization token is missing. Please log in again.');
            return;
        }

        // Make a POST request to submit the watchlist details
        fetch('http://localhost:3000/submit-watchlist-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(watchlistDetails),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text(); // Change to .text() for plain text responses
        })
        .then(data => {
            console.log('Success:', data);
            alert(data); // Use the response message from the server
            // Close the modal after submission
            personalizedWatchlistModal.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error submitting watchlist details.'); // More user-friendly error message
        });
    });
}

});

// Functionality for Logout
document.addEventListener("DOMContentLoaded", function() {
        // Get modal and buttons
        const logoutBtn = document.getElementById("logout");
        const logoutModal = document.getElementById("logout-modal");
        const closeModalBtn = document.getElementById("close-logout-modal");
        const cancelBtn = document.querySelector(".cancel-btn");
        const logoutConfirmBtn = document.querySelector(".logout-confirm");
    
        // Open the logout modal
        logoutBtn.addEventListener("click", () => {
            logoutModal.style.display = "block";
            logoutModal.setAttribute("aria-hidden", "false");
        });
    
        // Close the modal when close button is clicked
        closeModalBtn.addEventListener("click", () => {
            logoutModal.style.display = "none";
            logoutModal.setAttribute("aria-hidden", "true");
        });
    
        // Close the modal when cancel button is clicked
        cancelBtn.addEventListener("click", () => {
            logoutModal.style.display = "none";
            logoutModal.setAttribute("aria-hidden", "true");
        });
    
        
    
        // Close modal if user clicks outside of the modal content
        window.addEventListener("click", (event) => {
            if (event.target === logoutModal) {
                logoutModal.style.display = "none";
                logoutModal.setAttribute("aria-hidden", "true");
            }
        });
});

// Functionality for Funds Insights & News Opening & Voice Assistant
document.addEventListener("DOMContentLoaded", function () {
    // Modal elements
    const fundInsightsModal = document.getElementById("fundInsightsModal");
    const voiceAssistantModal = document.getElementById("voiceAssistantModal");

    // Functions to open modals
    function showFundInsights() {
        fundInsightsModal.style.display = "block";
        fundInsightsModal.setAttribute("aria-hidden", "false");
    }

    function activateVoiceAssistant() {
        voiceAssistantModal.style.display = "block";
        voiceAssistantModal.setAttribute("aria-hidden", "false");
    }

    // Function to close modals
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }

    // Close modal when clicking on the 'X' close button
    const closeFundInsightsModalBtn = document.querySelector("#fundInsightsModal .close");
    const closeVoiceAssistantModalBtn = document.querySelector("#voiceAssistantModal .close");

    closeFundInsightsModalBtn.addEventListener("click", () => closeModal('fundInsightsModal'));
    closeVoiceAssistantModalBtn.addEventListener("click", () => closeModal('voiceAssistantModal'));

    // Close modals when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === fundInsightsModal) {
            closeModal('fundInsightsModal');
        }
        if (event.target === voiceAssistantModal) {
            closeModal('voiceAssistantModal');
        }
    });

    // Floating elements' hover tooltip behavior
    const floatingElements = document.querySelectorAll('.floating-element');

    floatingElements.forEach((element) => {
        const tooltip = element.querySelector('.tooltip');
        element.addEventListener('mouseover', () => {
            tooltip.style.visibility = 'visible';
        });
        element.addEventListener('mouseout', () => {
            tooltip.style.visibility = 'hidden';
        });
    });

    // Event listeners for floating elements
    const fundInsightsElement = document.querySelector('.floating-element:nth-child(1)');
    const voiceAssistantElement = document.querySelector('.floating-element:nth-child(2)');

    fundInsightsElement.addEventListener("click", showFundInsights);
    voiceAssistantElement.addEventListener("click", activateVoiceAssistant);
});

