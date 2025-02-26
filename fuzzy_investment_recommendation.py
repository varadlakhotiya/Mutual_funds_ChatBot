import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt

# Step 1: Define fuzzy variables (Risk Level, Age Group, and Investment Type)
risk_level = ctrl.Antecedent(np.arange(0, 11, 1), 'Risk Level')  # 0 to 10
age_group = ctrl.Antecedent(np.arange(0, 11, 1), 'Age Group')    # 0 to 10
investment_type = ctrl.Consequent(np.arange(0, 11, 1), 'Investment Type')  # Output: 0 to 10

# Step 2: Define fuzzy membership functions
risk_level['low'] = fuzz.trimf(risk_level.universe, [0, 0, 5])
risk_level['medium'] = fuzz.trimf(risk_level.universe, [0, 5, 10])
risk_level['high'] = fuzz.trimf(risk_level.universe, [5, 10, 10])

age_group['young'] = fuzz.trimf(age_group.universe, [0, 0, 5])
age_group['middle'] = fuzz.trimf(age_group.universe, [0, 5, 10])
age_group['old'] = fuzz.trimf(age_group.universe, [5, 10, 10])

investment_type['short_term'] = fuzz.trimf(investment_type.universe, [0, 0, 5])
investment_type['medium_term'] = fuzz.trimf(investment_type.universe, [0, 5, 10])
investment_type['long_term'] = fuzz.trimf(investment_type.universe, [5, 10, 10])

# Step 3: Define fuzzy rules for decision making
rule1 = ctrl.Rule(risk_level['low'] & age_group['young'], investment_type['long_term'])
rule2 = ctrl.Rule(risk_level['medium'] & age_group['middle'], investment_type['medium_term'])
rule3 = ctrl.Rule(risk_level['high'] & age_group['old'], investment_type['short_term'])

# Step 4: Create the control system
investment_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
investment_recommendation = ctrl.ControlSystemSimulation(investment_ctrl)

# Step 5: Test the system with an example input (Risk: 6, Age: 4)
investment_recommendation.input['Risk Level'] = 6  # Risk level (between 0 and 10)
investment_recommendation.input['Age Group'] = 4   # Age group (between 0 and 10)
investment_recommendation.compute()  # Run the computation

# Step 6: Output the recommendation
print(f"Recommended Investment Type: {investment_recommendation.output['Investment Type']}")

# Optional: Visualize the output
investment_type.view(sim=investment_recommendation)
plt.show()
