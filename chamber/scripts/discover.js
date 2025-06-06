// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeVisitMessage();
    loadDiscoverData();
    initializeMobileMenu();
    updateLastModified();
});

// Visit message functionality
function initializeVisitMessage() {
    const visitMessageElement = document.getElementById('visitMessage');
    const currentDate = Date.now();
    const lastVisit = localStorage.getItem('lastVisit');
    
    let message = '';
    
    if (!lastVisit) {
        // First visit
        message = 'Welcome! Let us know if you have any questions.';
    } else {
        const lastVisitDate = parseInt(lastVisit);
        const daysDifference = Math.floor((currentDate - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (daysDifference < 1) {
            message = 'Back so soon! Awesome!';
        } else if (daysDifference === 1) {
            message = 'You last visited 1 day ago.';
        } else {
            message = `You last visited ${daysDifference} days ago.`;
        }
    }
    
    visitMessageElement.textContent = message;
    
    // Store current visit date
    localStorage.setItem('lastVisit', currentDate.toString());
}

// Load and display discover data
async function loadDiscoverData() {
    try {
        const response = await fetch('data/discover-data.json');
        const data = await response.json();
        createDiscoverCards(data.attractions);
    } catch (error) {
        console.error('Error loading discover data:', error);
        displayErrorMessage();
    }
}

// Create discover cards from data
function createDiscoverCards(attractions) {
    const gridContainer = document.getElementById('discoverGrid');
    
    attractions.forEach((attraction, index) => {
        const card = createCard(attraction, index + 1);
        gridContainer.appendChild(card);
    });
}

// Create individual card element
function createCard(attraction, cardNumber) {
    const card = document.createElement('div');
    card.className = 'discover-card';
    
    card.innerHTML = `
        <figure>
            <img src="${attraction.image}" alt="${attraction.name}" loading="lazy">
        </figure>
        <div class="content">
            <h2>${attraction.name}</h2>
            <address>${attraction.address}</address>
            <p>${attraction.description}</p>
            <button onclick="learnMore('${attraction.name}')">Learn More</button>
        </div>
    `;
    
    return card;
}

// Learn More button functionality
function learnMore(attractionName) {
    alert(`Learn more about ${attractionName}! This would typically link to more detailed information.`);
}

// Mobile menu toggle
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Display error message if data fails to load
function displayErrorMessage() {
    const gridContainer = document.getElementById('discoverGrid');
    gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
            <h2>Unable to load attractions</h2>
            <p>Please try refreshing the page or contact us if the problem persists.</p>
        </div>
    `;
}

// Update last modified date in footer
function updateLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        const lastModified = new Date(document.lastModified);
        lastModifiedElement.textContent = lastModified.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}