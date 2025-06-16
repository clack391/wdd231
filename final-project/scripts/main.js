// main.js - Main JavaScript module for Property Search page
import { PropertyService } from './properties.js';

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const searchForm = document.getElementById('propertySearchForm');
const clearFiltersBtn = document.getElementById('clearFilters');
const propertiesContainer = document.getElementById('propertiesContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const propertyModal = document.getElementById('propertyModal');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');
const viewButtons = document.querySelectorAll('.view-btn');

// State management
let properties = [];
let filteredProperties = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let searchPreferences = JSON.parse(localStorage.getItem('searchPreferences') || '{}');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initializeNavigation();
    initializeSearch();
    initializeModal();
    initializeViewControls();
    loadSearchPreferences();
    await loadProperties();
});

// Navigation functionality
function initializeNavigation() {
    hamburger?.addEventListener('click', () => {
        navLinks?.classList.toggle('show');
        
        // Animate hamburger
        const spans = hamburger.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (navLinks?.classList.contains('show')) {
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
    document.addEventListener('click', (e) => {
        if (!hamburger?.contains(e.target) && !navLinks?.contains(e.target)) {
            navLinks?.classList.remove('show');
            const spans = hamburger?.querySelectorAll('span') || [];
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        }
    });
}

// Search functionality
function initializeSearch() {
    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSearch();
    });

    clearFiltersBtn?.addEventListener('click', () => {
        searchForm?.reset();
        filteredProperties = [...properties];
        renderProperties();
        saveSearchPreferences();
    });

    // Real-time filtering
    const formInputs = searchForm?.querySelectorAll('select, input');
    formInputs?.forEach(input => {
        input.addEventListener('change', () => {
            handleSearch();
            saveSearchPreferences();
        });
    });
}

// Load search preferences from localStorage
function loadSearchPreferences() {
    if (Object.keys(searchPreferences).length > 0) {
        Object.entries(searchPreferences).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
            }
        });
        handleSearch(); // Apply saved preferences
    }
}

// Save search preferences to localStorage
function saveSearchPreferences() {
    const formData = new FormData(searchForm);
    const preferences = {};
    
    for (let [key, value] of formData.entries()) {
        if (value) {
            preferences[key] = value;
        }
    }
    
    searchPreferences = preferences;
    localStorage.setItem('searchPreferences', JSON.stringify(preferences));
}

// Handle search form submission
function handleSearch() {
    const formData = new FormData(searchForm);
    const filters = {
        propertyType: formData.get('propertyType'),
        bedrooms: formData.get('bedrooms'),
        maxPrice: formData.get('maxPrice')
    };

    filteredProperties = properties.filter(property => {
        // Filter by property type
        if (filters.propertyType && property.type !== filters.propertyType) {
            return false;
        }

        // Filter by bedrooms
        if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) {
            return false;
        }

        // Filter by max price
        if (filters.maxPrice) {
            const maxPrice = parseInt(filters.maxPrice);
            if (property.price > maxPrice) {
                return false;
            }
        }

        return true;
    });

    renderProperties();
}

// Load properties from JSON file
async function loadProperties() {
    try {
        showLoading(true);
        hideError();
        
        // Using fetch API with try...catch for error handling
        const response = await fetch('data/properties.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Simulate network delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        
        properties = data.properties || [];
        filteredProperties = [...properties];
        
        if (properties.length === 0) {
            throw new Error('No properties found in data source');
        }
        
        renderProperties();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading properties:', error);
        showError(`Failed to load properties: ${error.message}`);
        showLoading(false);
    }
}

// Show/hide loading spinner
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

// Show/hide error message
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

// Render properties to the DOM
function renderProperties() {
    if (!propertiesContainer) return;

    // Show "no results" message if needed
    if (noResults) {
        noResults.style.display = filteredProperties.length === 0 ? 'block' : 'none';
    }

    if (filteredProperties.length === 0) {
        propertiesContainer.innerHTML = '';
        return;
    }

    // Use template literals to generate HTML
    const propertiesHTML = filteredProperties.map(property => {
        const isFavorite = favorites.includes(property.id);
        const badgeClass = property.type === 'buy' ? 'for-sale' : '';
        const badgeText = property.type === 'buy' ? 'For Sale' : 'For Rent';
        const pricePrefix = property.type === 'buy' ? '$' : '$';
        const priceSuffix = property.type === 'buy' ? '' : '/month';
        
        return `
            <div class="property-card" data-property-id="${property.id}">
                <div class="property-image" style="background-image: url('${property.image}');">
                    <div class="property-badge ${badgeClass}">${badgeText}</div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite(${property.id})"
                            aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="property-content">
                    <div class="property-price">${pricePrefix}${property.price.toLocaleString()}${priceSuffix}</div>
                    <div class="property-address">${property.address}</div>
                    <div class="property-details">
                        <span>🛏️ ${property.bedrooms} bed</span>
                        <span>🚿 ${property.bathrooms} bath</span>
                        <span>📐 ${property.sqft} sq ft</span>
                        <span>🎓 ${property.distanceToCampus} to BYU-I</span>
                    </div>
                    <div class="property-description">${property.description}</div>
                </div>
            </div>
        `;
    }).join('');

    propertiesContainer.innerHTML = propertiesHTML;

    // Add click event listeners to property cards
    const propertyCards = propertiesContainer.querySelectorAll('.property-card');
    propertyCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking favorite button
            if (e.target.classList.contains('favorite-btn')) return;
            
            const propertyId = parseInt(card.dataset.propertyId);
            openPropertyModal(propertyId);
        });
    });
}

// Toggle favorite status
window.toggleFavorite = function(propertyId) {
    const index = favorites.indexOf(propertyId);
    
    if (index > -1) {
        favorites.splice(index, 1); // Remove from favorites
    } else {
        favorites.push(propertyId); // Add to favorites
    }
    
    // Update localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Re-render properties to update favorite buttons
    renderProperties();
};

// Modal functionality
function initializeModal() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    propertyModal?.addEventListener('click', (e) => {
        if (e.target === propertyModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && propertyModal?.classList.contains('show')) {
            closeModal();
        }
    });
}

// Open property detail modal
function openPropertyModal(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property || !propertyModal) return;

    const isFavorite = favorites.includes(property.id);
    const badgeText = property.type === 'buy' ? 'For Sale' : 'For Rent';
    const pricePrefix = property.type === 'buy' ? '$' : '$';
    const priceSuffix = property.type === 'buy' ? '' : '/month';

    // Generate modal content using template literals
    const modalContent = `
        <div class="modal-property-image" style="background-image: url('${property.image}'); height: 300px; background-size: cover; background-position: center; border-radius: 0.5rem; margin-bottom: 1.5rem;"></div>
        
        <div class="modal-property-header">
            <div class="modal-property-price">${pricePrefix}${property.price.toLocaleString()}${priceSuffix}</div>
            <div class="modal-property-badge">${badgeText}</div>
        </div>
        
        <div class="modal-property-address" style="font-size: 1.125rem; color: #6b7280; margin-bottom: 1rem;">${property.address}</div>
        
        <div class="modal-property-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div><strong>Bedrooms:</strong> ${property.bedrooms}</div>
            <div><strong>Bathrooms:</strong> ${property.bathrooms}</div>
            <div><strong>Square Feet:</strong> ${property.sqft}</div>
            <div><strong>Distance to Campus:</strong> ${property.distanceToCampus}</div>
        </div>
        
        <div class="modal-property-description" style="margin-bottom: 1.5rem;">
            <h5>Description</h5>
            <p>${property.description}</p>
        </div>
        
        <div class="modal-property-amenities" style="margin-bottom: 1.5rem;">
            <h5>Amenities</h5>
            <ul style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; list-style: none; padding: 0;">
                ${property.amenities?.map(amenity => `<li>✓ ${amenity}</li>`).join('') || '<li>No amenities listed</li>'}
            </ul>
        </div>
        
        <div class="modal-property-contact" style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
            <h5>Contact Information</h5>
            <p><strong>Contact:</strong> ${property.contact?.name || 'Property Manager'}</p>
            <p><strong>Phone:</strong> ${property.contact?.phone || '(208) 555-0123'}</p>
            <p><strong>Email:</strong> ${property.contact?.email || 'info@rexburghomefinder.com'}</p>
        </div>
        
        <div class="modal-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button onclick="toggleFavorite(${property.id}); closeModal(); renderProperties();" 
                    class="btn ${isFavorite ? 'btn-secondary' : 'btn-primary'}" 
                    style="flex: 1;">
                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button onclick="contactProperty(${property.id})" 
                    class="btn btn-primary" 
                    style="flex: 1;">
                Contact Owner
            </button>
        </div>
    `;

    modalTitle.textContent = `${property.address} - Property Details`;
    modalBody.innerHTML = modalContent;
    
    propertyModal.classList.add('show');
    propertyModal.setAttribute('aria-hidden', 'false');
    
    // Focus management for accessibility
    const firstFocusable = modalBody.querySelector('button');
    firstFocusable?.focus();
}

// Close modal
function closeModal() {
    propertyModal?.classList.remove('show');
    propertyModal?.setAttribute('aria-hidden', 'true');
}

// Contact property function
window.contactProperty = function(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    // Create mailto link with pre-filled information
    const subject = encodeURIComponent(`Inquiry about ${property.address}`);
    const body = encodeURIComponent(`Hi,

I'm interested in the property at ${property.address} listed for ${property.type === 'buy' ? '$' + property.price.toLocaleString() : '$' + property.price.toLocaleString() + '/month'}.

Could you please provide more information about:
- Availability
- Viewing schedule
- Application process

Thank you!`);

    const email = property.contact?.email || 'info@rexburghomefinder.com';
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink);
};

// View controls functionality
function initializeViewControls() {
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Toggle view
            const view = button.dataset.view;
            if (view === 'list') {
                propertiesContainer?.classList.add('list-view');
            } else {
                propertiesContainer?.classList.remove('list-view');
            }
        });
    });
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('.property-image[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.backgroundImage = `url('${img.dataset.src}')`;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Export functions for use in other modules
export { 
    properties, 
    filteredProperties, 
    favorites, 
    toggleFavorite, 
    contactProperty,
    loadProperties,
    renderProperties 
};