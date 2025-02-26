import numpy as np
import pandas as pd
import random

# Example mutual fund data
fund_data = {
    'funds': ['Fund A', 'Fund B', 'Fund C', 'Fund D', 'Fund E'],
    'risk': [0.2, 0.5, 0.3, 0.6, 0.4],  # Risk associated with each fund
    'return': [0.12, 0.08, 0.10, 0.15, 0.07]  # Expected return for each fund
}

# Number of portfolios to generate (population size) and number of generations
num_portfolios = 20
num_funds = len(fund_data['funds'])
num_generations = 50
mutation_rate = 0.1
crossover_rate = 0.7

# 1. Initialize population with random portfolio allocations (summing to 1)
def generate_population(size, num_funds):
    population = np.random.rand(size, num_funds)
    population /= population.sum(axis=1, keepdims=True)  # Normalize to sum to 1
    return population

# 2. Fitness function to evaluate portfolios based on risk and return
def fitness_function(portfolio, risk_level, return_rate):
    # Portfolio risk is the weighted sum of risks for each fund
    risk_factor = np.sum(portfolio * risk_level)  
    # Portfolio return is the weighted sum of returns for each fund
    return_factor = np.sum(portfolio * return_rate)  
    # We want to maximize return and minimize risk, so fitness is the return minus the risk
    return return_factor - risk_factor

# 3. Select parents for crossover based on fitness
def select_parents(population, fitness_scores):
    # Tournament selection: pick two portfolios, return the one with higher fitness
    selected_parents = []
    for _ in range(population.shape[0] // 2):
        tournament = random.sample(range(population.shape[0]), 2)
        parent_1 = tournament[0] if fitness_scores[tournament[0]] > fitness_scores[tournament[1]] else tournament[1]
        parent_2 = tournament[1] if fitness_scores[tournament[0]] > fitness_scores[tournament[1]] else tournament[0]
        selected_parents.append([parent_1, parent_2])
    return selected_parents

# 4. Crossover function to combine two parent portfolios
def crossover(parent_1, parent_2):
    if random.random() < crossover_rate:
        crossover_point = random.randint(1, num_funds - 1)
        child_1 = np.concatenate([parent_1[:crossover_point], parent_2[crossover_point:]])
        child_2 = np.concatenate([parent_2[:crossover_point], parent_1[crossover_point:]])
        return child_1, child_2
    else:
        return parent_1.copy(), parent_2.copy()

# 5. Mutation function to randomly change allocations in a portfolio
def mutate(portfolio):
    if random.random() < mutation_rate:
        mutate_point = random.randint(0, num_funds - 1)
        portfolio[mutate_point] = np.random.rand()
        portfolio /= portfolio.sum()  # Re-normalize to ensure the sum of allocations is 1
    return portfolio

# 6. Main GA loop: evolve portfolios over multiple generations
def genetic_algorithm(fund_data, num_portfolios, num_generations):
    population = generate_population(num_portfolios, num_funds)
    fitness_scores = np.array([fitness_function(portfolio, fund_data['risk'], fund_data['return']) for portfolio in population])

    # Iterate over generations
    for generation in range(num_generations):
        print(f"Generation {generation + 1}/{num_generations}")

        # Select parents for crossover
        selected_parents = select_parents(population, fitness_scores)

        # Generate offspring through crossover
        offspring = []
        for parent_1_idx, parent_2_idx in selected_parents:
            parent_1 = population[parent_1_idx]
            parent_2 = population[parent_2_idx]
            child_1, child_2 = crossover(parent_1, parent_2)
            offspring.append(child_1)
            offspring.append(child_2)

        # Apply mutation to offspring
        offspring = [mutate(child) for child in offspring]

        # Create new population by selecting the best individuals
        population = np.array(offspring)

        # Evaluate fitness of new population
        fitness_scores = np.array([fitness_function(portfolio, fund_data['risk'], fund_data['return']) for portfolio in population])

    # After all generations, return the best portfolio
    best_portfolio_idx = np.argmax(fitness_scores)
    best_portfolio = population[best_portfolio_idx]
    return best_portfolio, fitness_scores

# Run the Genetic Algorithm
best_portfolio, fitness_scores = genetic_algorithm(fund_data, num_portfolios, num_generations)

# Display the best portfolio allocation
print(f"Best Portfolio Allocation (normalized): {best_portfolio}")

# Save the best portfolio to a CSV file
best_portfolio_df = pd.DataFrame({
    'Fund Name': fund_data['funds'],
    'Allocation': best_portfolio
})

best_portfolio_df.to_csv('best_portfolio.csv', index=False)
print("Best portfolio saved to 'best_portfolio.csv'")

# Display the fitness scores of the population
print("Final fitness scores of the population:")
print(fitness_scores)
