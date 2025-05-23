// Chamber of Commerce Main JavaScript - Updated with Free Weather API

// Configuration
const config = {
    // No API key needed anymore - using Open-Meteo free weather API!
    // Rexburg, ID coordinates
    lat: 43.8260,
    lon: -111.7897,
    membersDataUrl: 'data/members2.json'
};

// Weather condition codes mapping for Open-Meteo
const weatherConditions = {
    0: { description: 'Clear sky', icon: '01d' },
    1: { description: 'Mainly clear', icon: '01d' },
    2: { description: 'Partly cloudy', icon: '02d' },
    3: { description: 'Overcast', icon: '04d' },
    45: { description: 'Fog', icon: '50d' },
    48: { description: 'Depositing rime fog', icon: '50d' },
    51: { description: 'Light drizzle', icon: '09d' },
    53: { description: 'Moderate drizzle', icon: '09d' },
    55: { description: 'Dense drizzle', icon: '09d' },
    56: { description: 'Light freezing drizzle', icon: '09d' },
    57: { description: 'Dense freezing drizzle', icon: '09d' },
    61: { description: 'Slight rain', icon: '10d' },
    63: { description: 'Moderate rain', icon: '10d' },
    65: { description: 'Heavy rain', icon: '10d' },
    66: { description: 'Light freezing rain', icon: '13d' },
    67: { description: 'Heavy freezing rain', icon: '13d' },
    71: { description: 'Slight snow fall', icon: '13d' },
    73: { description: 'Moderate snow fall', icon: '13d' },
    75: { description: 'Heavy snow fall', icon: '13d' },
    77: { description: 'Snow grains', icon: '13d' },
    80: { description: 'Slight rain showers', icon: '09d' },
    81: { description: 'Moderate rain showers', icon: '09d' },
    82: { description: 'Violent rain showers', icon: '09d' },
    85: { description: 'Slight snow showers', icon: '13d' },
    86: { description: 'Heavy snow showers', icon: '13d' },
    95: { description: 'Thunderstorm', icon: '11d' },
    96: { description: 'Thunderstorm with slight hail', icon: '11d' },
    99: { description: 'Thunderstorm with heavy hail', icon: '11d' }
};

// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const spotlightsContainer = document.getElementById('spotlights-container');
const lastModifiedEl = document.getElementById('last-modified');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadWeatherData();
    loadMemberSpotlights();
    updateLastModified();
});

// Navigation functionality
function initializeNavigation() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        });
    }
}

// Weather functionality - Updated to use Open-Meteo (Free!)
async function loadWeatherData() {
    if (!currentWeatherEl) return;

    try {
        // Current weather URL (Open-Meteo - No API key needed!)
        const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&current_weather=true&hourly=relative_humidity_2m&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
        
        const currentResponse = await fetch(currentWeatherUrl);
        
        if (!currentResponse.ok) {
            throw new Error(`Weather API error: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();

        // Forecast URL (3 days)
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=3`;
        
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status}`);
        }
        
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        console.error('Error loading weather data:', error);
        displayWeatherError('Unable to load weather data. Please try again later.');
    }
}

function displayCurrentWeather(data) {
    const current = data.current_weather;
    const temp = Math.round(current.temperature);
    const windSpeed = Math.round(current.windspeed);
    const weatherCode = current.weathercode;
    
    // Get current hour humidity (approximate)
    const currentHour = new Date().getHours();
    const humidity = data.hourly && data.hourly.relative_humidity_2m ? 
        Math.round(data.hourly.relative_humidity_2m[currentHour] || 50) : 50;
    
    // Get weather condition info
    const condition = weatherConditions[weatherCode] || { description: 'Unknown', icon: '01d' };
    
    // Create a weather icon URL
    const iconUrl = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;

    currentWeatherEl.innerHTML = `
        <img src="${iconUrl}" alt="${condition.description}" style="width: 60px; height: 60px;" onerror="this.style.display='none'">
        <div class="current-temp">${temp}°F</div>
        <div class="weather-description">${condition.description}</div>
        <div class="weather-details">
            <div>Humidity: ${humidity}%</div>
            <div>Wind: ${windSpeed} mph</div>
        </div>
    `;
}

function displayForecast(data) {
    if (!forecastEl) return;

    const daily = data.daily;
    const forecastHtml = daily.time.slice(0, 3).map((date, index) => {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(daily.temperature_2m_max[index]);
        
        return `
            <div class="forecast-day">
                <h4>${dayName}</h4>
                <div class="forecast-temp">${maxTemp}°F</div>
            </div>
        `;
    }).join('');

    forecastEl.innerHTML = forecastHtml;
}

function displayWeatherError(message) {
    if (currentWeatherEl) {
        currentWeatherEl.innerHTML = `
            <div class="weather-error" style="color: #ef4444; padding: 1rem;">
                <p>${message}</p>
            </div>
        `;
    }
    if (forecastEl) {
        forecastEl.innerHTML = '<div style="color: #6b7280;">Forecast unavailable</div>';
    }
}

// Member spotlights functionality
async function loadMemberSpotlights() {
    if (!spotlightsContainer) return;

    try {
        const response = await fetch(config.membersDataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const members = data.members || data;

        // Filter for gold and silver members only
        const qualifiedMembers = members.filter(member => 
            member.membershipLevel === 'Gold' || member.membershipLevel === 'Silver'
        );

        if (qualifiedMembers.length === 0) {
            throw new Error('No qualified members found');
        }

        // Randomly select 2-3 members
        const numberOfSpotlights = Math.min(3, qualifiedMembers.length);
        const selectedMembers = getRandomMembers(qualifiedMembers, numberOfSpotlights);

        displaySpotlights(selectedMembers);

    } catch (error) {
        console.error('Error loading member spotlights:', error);
        displaySpotlightsError('Unable to load member spotlights.');
    }
}

function getRandomMembers(members, count) {
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displaySpotlights(members) {
    const spotlightsHtml = members.map(member => {
        const membershipClass = member.membershipLevel.toLowerCase();
        
        return `
            <div class="spotlight-card">
                <img src="${member.image || 'images/placeholder-logo.png'}" 
                     alt="${member.name} logo" 
                     class="spotlight-logo"
                     onerror="this.src='images/placeholder-logo.png'">
                <h3>${member.name}</h3>
                <span class="membership-level ${membershipClass}">${member.membershipLevel} Member</span>
                <div class="contact-info">
                    <p><strong>Phone:</strong> ${member.phone}</p>
                    <p><strong>Address:</strong> ${member.address}</p>
                    <p><strong>Website:</strong> 
                        <a href="${member.website}" target="_blank" class="website-link">
                            Visit Website
                        </a>
                    </p>
                </div>
            </div>
        `;
    }).join('');

    spotlightsContainer.innerHTML = spotlightsHtml;
}

function displaySpotlightsError(message) {
    if (spotlightsContainer) {
        spotlightsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6b7280;">
                <p>${message}</p>
            </div>
        `;
    }
}

// Utility functions
function updateLastModified() {
    if (lastModifiedEl) {
        lastModifiedEl.textContent = document.lastModified;
    }
}

// Add some loading states and animations
function addLoadingAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .loading {
            animation: pulse 2s infinite;
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize loading animations
addLoadingAnimation();

// Add smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.event-card, .spotlight-card, .weather');
    animateElements.forEach(el => observer.observe(el));
});