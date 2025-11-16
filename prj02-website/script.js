// Game data - dishes with cilantro information
const dishes = [
    { name: "Guacamole", hasCilantro: true, emoji: "🥑", description: "Fresh Mexican avocado dip", fact: "Guacamole traditionally includes cilantro for that fresh, citrusy flavor!" },
    { name: "Pad Thai", hasCilantro: false, emoji: "🍜", description: "Thai stir-fried noodles", fact: "Pad Thai typically uses basil, not cilantro. But some restaurants add it as garnish!" },
    { name: "Salsa Verde", hasCilantro: true, emoji: "🫑", description: "Green Mexican sauce", fact: "Salsa verde almost always contains cilantro - it's a key ingredient!" },
    { name: "Butter Chicken", hasCilantro: true, emoji: "🍗", description: "Creamy Indian curry", fact: "Butter chicken is often garnished with fresh cilantro leaves!" },
    { name: "Pesto Pasta", hasCilantro: false, emoji: "🍝", description: "Italian basil sauce", fact: "Traditional pesto uses basil, not cilantro. Though cilantro pesto exists as a variation!" },
    { name: "Pho", hasCilantro: true, emoji: "🍲", description: "Vietnamese noodle soup", fact: "Pho is typically served with cilantro as a garnish - a Vietnamese staple!" },
    { name: "Margherita Pizza", hasCilantro: false, emoji: "🍕", description: "Classic Italian pizza", fact: "Margherita uses basil and oregano - no cilantro here!" },
    { name: "Tacos", hasCilantro: true, emoji: "🌮", description: "Mexican street food", fact: "Tacos are almost always topped with fresh cilantro!" },
    { name: "Caesar Salad", hasCilantro: false, emoji: "🥗", description: "Classic American salad", fact: "Caesar salad uses romaine lettuce and parmesan - no cilantro!" },
    { name: "Ceviche", hasCilantro: true, emoji: "🐟", description: "Peruvian raw fish dish", fact: "Ceviche is incomplete without cilantro - it's essential to the flavor!" },
    { name: "Spaghetti Carbonara", hasCilantro: false, emoji: "🍝", description: "Italian pasta with eggs", fact: "Carbonara uses pancetta, eggs, and cheese - definitely no cilantro!" },
    { name: "Chipotle Bowl", hasCilantro: true, emoji: "🥙", description: "Mexican-inspired bowl", fact: "Chipotle bowls typically include cilantro-lime rice!" },
    { name: "Burgers", hasCilantro: false, emoji: "🍔", description: "Classic American burger", fact: "Traditional burgers don't have cilantro, though some gourmet versions might!" },
    { name: "Tom Yum Soup", hasCilantro: true, emoji: "🍲", description: "Spicy Thai soup", fact: "Tom Yum often includes cilantro leaves as a garnish!" },
    { name: "Fried Rice", hasCilantro: false, emoji: "🍚", description: "Asian-style rice dish", fact: "While some variations include cilantro, traditional fried rice doesn't!" },
    { name: "Chimichurri", hasCilantro: true, emoji: "🌿", description: "Argentine herb sauce", fact: "Chimichurri is made primarily with parsley, but cilantro versions exist!" },
    { name: "Ramen", hasCilantro: false, emoji: "🍜", description: "Japanese noodle soup", fact: "Traditional ramen doesn't use cilantro - it's more common in Western fusion versions!" },
    { name: "Falafel Wrap", hasCilantro: true, emoji: "🌯", description: "Middle Eastern wrap", fact: "Falafel wraps are often topped with cilantro-rich tahini sauce!" },
    { name: "Mac and Cheese", hasCilantro: false, emoji: "🧀", description: "Creamy pasta dish", fact: "Mac and cheese is all about cheese - cilantro would be very unusual!" },
    { name: "Green Curry", hasCilantro: true, emoji: "🍛", description: "Thai coconut curry", fact: "Green curry paste often contains cilantro root and leaves!" },
];

// Game state
let currentDish = null;
let score = 0;
let streak = 0;
let round = 0;
let bestStreak = 0;
const totalRounds = 5;
let usedDishes = [];
let correctDishes = []; // Track dishes the player identified correctly

// Initialize game
function initGame() {
    score = 0;
    streak = 0;
    round = 0;
    bestStreak = 0;
    usedDishes = [];
    correctDishes = [];
    nextRound();
}

// Get a random dish that hasn't been used
function getRandomDish() {
    let availableDishes = dishes.filter(dish => !usedDishes.includes(dish.name));
    
    // If all dishes have been used, reset
    if (availableDishes.length === 0) {
        availableDishes = dishes;
        usedDishes = [];
    }
    
    const randomIndex = Math.floor(Math.random() * availableDishes.length);
    const dish = availableDishes[randomIndex];
    usedDishes.push(dish.name);
    return dish;
}

// Start next round
function nextRound() {
    // Increment round number
    round++;
    
    // Check if we've completed all rounds
    if (round > totalRounds) {
        endGame();
        return;
    }

    currentDish = getRandomDish();
    
    // Reset UI
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('guessButtons').style.display = 'flex';
    
    // Update dish display
    document.getElementById('dishIcon').textContent = currentDish.emoji;
    document.getElementById('dishName').textContent = currentDish.name;
    document.getElementById('dishDescription').textContent = currentDish.description;
    
    // Enable buttons
    document.getElementById('btnYes').disabled = false;
    document.getElementById('btnNo').disabled = false;
    
    // Update stats to show current round
    updateStats();
}

// Make a guess
function makeGuess(userGuess) {
    // Disable buttons
    document.getElementById('btnYes').disabled = true;
    document.getElementById('btnNo').disabled = true;
    
    const isCorrect = userGuess === currentDish.hasCilantro;
    const resultMessage = document.getElementById('resultMessage');
    const factBox = document.getElementById('factBox');
    const gameArea = document.getElementById('gameArea');
    const resultArea = document.getElementById('resultArea');
    const guessButtons = document.getElementById('guessButtons');
    
    // Hide guess buttons
    guessButtons.style.display = 'none';
    
    // Show result
    if (isCorrect) {
        resultMessage.className = 'result-message result-correct';
        resultMessage.innerHTML = '🎉 Correct! Great sniff! 🎉';
        score++;
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
        }
        // Track correctly identified dish
        correctDishes.push(currentDish);
    } else {
        resultMessage.className = 'result-message result-incorrect';
        resultMessage.innerHTML = '😔 Not quite! Better luck next time!';
        streak = 0;
    }
    
    // Show fact
    factBox.innerHTML = `<p><strong>${currentDish.name}:</strong> ${currentDish.fact}</p>`;
    
    // Update stats
    updateStats();
    
    // Show result area
    resultArea.style.display = 'block';
    
    // If this was the last round, end game after delay
    if (round === totalRounds) {
        setTimeout(() => {
            endGame();
        }, 3000);
    }
}

// Update statistics display
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('round').textContent = round;
}

// Get restaurant recommendations based on correctly identified dishes
function getRestaurantRecommendations() {
    const recommendations = [];
    
    // Map of cuisine types to restaurant recommendations
    const cuisineMap = {
        mexican: {
            dishes: ['Guacamole', 'Salsa Verde', 'Tacos', 'Chipotle Bowl'],
            restaurants: ['Taco Bell', 'Chipotle', 'Qdoba', 'Local Taqueria', 'Authentic Mexican Restaurant']
        },
        thai: {
            dishes: ['Pad Thai', 'Tom Yum Soup', 'Green Curry'],
            restaurants: ['Thai Restaurant', 'Pad Thai Express', 'Thai Fusion', 'Authentic Thai Kitchen']
        },
        indian: {
            dishes: ['Butter Chicken'],
            restaurants: ['Indian Curry House', 'Tandoori Palace', 'Authentic Indian Restaurant']
        },
        vietnamese: {
            dishes: ['Pho'],
            restaurants: ['Pho Restaurant', 'Vietnamese Noodle House', 'Saigon Kitchen']
        },
        peruvian: {
            dishes: ['Ceviche'],
            restaurants: ['Peruvian Restaurant', 'Ceviche Bar', 'Lima Kitchen']
        },
        middleeastern: {
            dishes: ['Falafel Wrap'],
            restaurants: ['Mediterranean Grill', 'Falafel House', 'Middle Eastern Restaurant']
        },
        argentine: {
            dishes: ['Chimichurri'],
            restaurants: ['Argentine Steakhouse', 'South American Restaurant', 'Gaucho Grill']
        }
    };
    
    // Analyze correct dishes and generate recommendations
    const dishNames = correctDishes.map(dish => dish.name);
    
    // Check for Mexican dishes
    const mexicanDishes = cuisineMap.mexican.dishes.filter(d => dishNames.includes(d));
    if (mexicanDishes.length > 0) {
        recommendations.push({
            cuisine: 'Mexican',
            emoji: '🌮',
            dishes: mexicanDishes,
            restaurants: cuisineMap.mexican.restaurants.slice(0, 3)
        });
    }
    
    // Check for Thai dishes
    const thaiDishes = cuisineMap.thai.dishes.filter(d => dishNames.includes(d));
    if (thaiDishes.length > 0) {
        recommendations.push({
            cuisine: 'Thai',
            emoji: '🍜',
            dishes: thaiDishes,
            restaurants: cuisineMap.thai.restaurants.slice(0, 3)
        });
    }
    
    // Check for Indian dishes
    const indianDishes = cuisineMap.indian.dishes.filter(d => dishNames.includes(d));
    if (indianDishes.length > 0) {
        recommendations.push({
            cuisine: 'Indian',
            emoji: '🍛',
            dishes: indianDishes,
            restaurants: cuisineMap.indian.restaurants.slice(0, 3)
        });
    }
    
    // Check for Vietnamese dishes
    const vietnameseDishes = cuisineMap.vietnamese.dishes.filter(d => dishNames.includes(d));
    if (vietnameseDishes.length > 0) {
        recommendations.push({
            cuisine: 'Vietnamese',
            emoji: '🍲',
            dishes: vietnameseDishes,
            restaurants: cuisineMap.vietnamese.restaurants.slice(0, 3)
        });
    }
    
    // Check for Peruvian dishes
    const peruvianDishes = cuisineMap.peruvian.dishes.filter(d => dishNames.includes(d));
    if (peruvianDishes.length > 0) {
        recommendations.push({
            cuisine: 'Peruvian',
            emoji: '🐟',
            dishes: peruvianDishes,
            restaurants: cuisineMap.peruvian.restaurants.slice(0, 3)
        });
    }
    
    // Check for Middle Eastern dishes
    const middleEasternDishes = cuisineMap.middleeastern.dishes.filter(d => dishNames.includes(d));
    if (middleEasternDishes.length > 0) {
        recommendations.push({
            cuisine: 'Middle Eastern',
            emoji: '🌯',
            dishes: middleEasternDishes,
            restaurants: cuisineMap.middleeastern.restaurants.slice(0, 3)
        });
    }
    
    // Check for Argentine dishes
    const argentineDishes = cuisineMap.argentine.dishes.filter(d => dishNames.includes(d));
    if (argentineDishes.length > 0) {
        recommendations.push({
            cuisine: 'Argentine',
            emoji: '🥩',
            dishes: argentineDishes,
            restaurants: cuisineMap.argentine.restaurants.slice(0, 3)
        });
    }
    
    // If no specific cuisine matches, provide general recommendations
    if (recommendations.length === 0 && correctDishes.length > 0) {
        recommendations.push({
            cuisine: 'General',
            emoji: '🍽️',
            dishes: dishNames.slice(0, 3),
            restaurants: ['International Restaurant', 'Fusion Kitchen', 'Global Cuisine']
        });
    }
    
    return recommendations;
}

// End game
function endGame() {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('bestStreak').textContent = bestStreak;
    document.getElementById('totalRounds').textContent = totalRounds;
    
    // Generate and display restaurant recommendations
    const recommendations = getRestaurantRecommendations();
    const recommendationsHtml = generateRecommendationsHtml(recommendations);
    document.getElementById('restaurantRecommendations').innerHTML = recommendationsHtml;
}

// Generate HTML for restaurant recommendations
function generateRecommendationsHtml(recommendations) {
    if (recommendations.length === 0) {
        return '<p class="no-recommendations">Keep playing to get personalized restaurant recommendations!</p>';
    }
    
    let html = '<h3>🍴 Restaurant Recommendations</h3>';
    html += '<p class="recommendations-intro">Based on the dishes you identified correctly, here are some restaurants you might enjoy:</p>';
    
    recommendations.forEach(rec => {
        html += `<div class="recommendation-card">`;
        html += `<div class="recommendation-header">`;
        html += `<span class="cuisine-emoji">${rec.emoji}</span>`;
        html += `<h4>${rec.cuisine} Cuisine</h4>`;
        html += `</div>`;
        html += `<p class="recommendation-dishes">You correctly identified: <strong>${rec.dishes.join(', ')}</strong></p>`;
        html += `<div class="restaurant-list">`;
        html += `<p class="restaurant-label">Try these restaurants:</p>`;
        html += `<ul>`;
        rec.restaurants.forEach(restaurant => {
            html += `<li>${restaurant}</li>`;
        });
        html += `</ul>`;
        html += `</div>`;
        html += `</div>`;
    });
    
    return html;
}

// Restart game
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    initGame();
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);

