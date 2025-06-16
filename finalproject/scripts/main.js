// Main JavaScript file for Rexburg Home Finder
// ES Module structure with all required functionality

import { PropertyManager } from './propertyManager.js';
import { ModalController } from './modalController.js';
import { StorageManager } from './storageManager.js';

class RexburgHomeFinder {
    constructor() {
        this.propertyManager = new PropertyManager();
        this.modalController = new ModalController();
        this.storageManager = new StorageManager();
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.currentFilters = {};
        this.currentSort = 'price-low';
        
        this.init();
    }

    async init() {
        try {
            // Load properties data
            await this.propertyManager.loadProperties();
            
            // Initialize navigation
            this.initNavigation();
            
            // Initialize search functionality
            this.initSearch();
            
            // Initialize property display
            this.displayProperties();
            
            // Initialize modals
            this.initModals();
            
            // Load user preferences from local storage
            this.loadUserPreferences();
            
            // Initialize lazy loading for images
            this.initLazyLoading();
            
        } catch (error) {
            this.showErrorMessage('Failed to load property data. Please refresh the page.');
        }
    }

    initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                
                // Update aria-expanded
                const isExpanded = navLinks.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
            });
            
            // Close navigation when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    initSearch() {
        const searchForm = document.getElementById('property-search');
        const sortSelect = document.getElementById('sort-by');
        
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.storageManager.setItem('sortPreference', this.currentSort);
                this.displayProperties();
            });
        }
        
        // Initialize load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProperties();
            });
        }
    }

    handleSearch() {
        const form = document.getElementById('property-search');
        const formData = new FormData(form);
        
        // Use destructuring and template literals
        this.currentFilters = {
            type: formData.get('type') || '',
            bedrooms: formData.get('bedrooms') || '',
            maxPrice: formData.get('maxPrice') || ''
        };
        
        // Save search preferences to local storage
        this.storageManager.setItem('searchFilters', this.currentFilters);
        
        // Reset pagination
        this.currentPage = 1;
        
        // Display filtered results
        this.displayProperties();
        
    }

    displayProperties() {
        try {
            const propertiesGrid = document.getElementById('properties-grid');
            const resultsCount = document.getElementById('results-count');
            const loadMoreBtn = document.getElementById('load-more-btn');
            
            if (!propertiesGrid) return;
            
            // Get filtered and sorted properties using array methods
            let filteredProperties = this.propertyManager.getProperties()
                .filter(property => this.filterProperty(property))
                .sort((a, b) => this.sortProperties(a, b));
            
            // Update results count
            if (resultsCount) {
                resultsCount.textContent = `Showing ${filteredProperties.length} properties`;
            }
            
            // Get properties for current page
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const currentProperties = filteredProperties.slice(0, endIndex);
            
            // Clear existing properties if on first page
            if (this.currentPage === 1) {
                propertiesGrid.innerHTML = '';
            }
            
            // Generate property cards using template literals
            const newProperties = filteredProperties.slice(startIndex, endIndex);
            newProperties.forEach(property => {
                const propertyCard = this.createPropertyCard(property);
                propertiesGrid.appendChild(propertyCard);
            });
            
            // Show/hide load more button
            if (loadMoreBtn) {
                const hasMore = filteredProperties.length > currentProperties.length;
                loadMoreBtn.style.display = hasMore ? 'block' : 'none';
            }
            
            // Initialize lazy loading for new images
            this.initLazyLoading();
            
        } catch (error) {
            this.showErrorMessage('Error displaying properties. Please try again.');
        }
    }

    filterProperty(property) {
        const { type, bedrooms, maxPrice } = this.currentFilters;
        
        // Type filter
        if (type && property.type !== type) return false;
        
        // Bedrooms filter
        if (bedrooms && property.bedrooms < parseInt(bedrooms)) return false;
        
        // Price filter
        if (maxPrice) {
            const price = parseInt(property.price);
            const max = parseInt(maxPrice);
            if (price > max) return false;
        }
        
        return true;
    }

    sortProperties(a, b) {
        switch (this.currentSort) {
            case 'price-low':
                return parseInt(a.price) - parseInt(b.price);
            case 'price-high':
                return parseInt(b.price) - parseInt(a.price);
            case 'bedrooms':
                return parseInt(b.bedrooms) - parseInt(a.bedrooms);
            case 'type':
                return a.type.localeCompare(b.type);
            default:
                return 0;
        }
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.setAttribute('data-property-id', property.id);
        
        // Using template literals for dynamic content generation
        card.innerHTML = `
            <div class="property-image" data-src="${property.image}" loading="lazy" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 0.875rem;">
                📷 Property Photo
            </div>
            <div class="property-details">
                <div class="property-price">$${parseInt(property.price).toLocaleString()}${property.type === 'rent' ? '/month' : ''}</div>
                <div class="property-address">${property.address}</div>
                <div class="property-features">
                    <span>🛏️ ${property.bedrooms} bed</span>
                    <span>🚿 ${property.bathrooms} bath</span>
                    <span>📐 ${property.sqft} sq ft</span>
                </div>
                <div class="property-type">${property.type === 'rent' ? 'For Rent' : 'For Sale'}</div>
                <p class="property-description">${property.description.substring(0, 100)}...</p>
            </div>
        `;
        
        // Add click event listener for modal
        card.addEventListener('click', () => {
            this.showPropertyModal(property);
        });
        
        // Add keyboard support
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${property.address}`);
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showPropertyModal(property);
            }
        });
        
        return card;
    }

    loadMoreProperties() {
        this.currentPage++;
        this.displayProperties();
    }

    showPropertyModal(property) {
        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');
        
        if (!modalBody || !modalTitle) return;
        
        modalTitle.textContent = property.address;
        
        // Generate detailed property information using template literals
        modalBody.innerHTML = `
            <div class="modal-property-details">
                <div class="property-image" style="height: 300px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; margin-bottom: 1.5rem; border-radius: 0.5rem;">
                    📷 Property Photo Gallery
                </div>
                <div class="property-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="info-item">
                        <strong>Price:</strong> $${parseInt(property.price).toLocaleString()}${property.type === 'rent' ? '/month' : ''}
                    </div>
                    <div class="info-item">
                        <strong>Type:</strong> ${property.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </div>
                    <div class="info-item">
                        <strong>Bedrooms:</strong> ${property.bedrooms}
                    </div>
                    <div class="info-item">
                        <strong>Bathrooms:</strong> ${property.bathrooms}
                    </div>
                    <div class="info-item">
                        <strong>Square Feet:</strong> ${property.sqft}
                    </div>
                    <div class="info-item">
                        <strong>Distance to BYU-I:</strong> ${property.distanceToCampus}
                    </div>
                </div>
                <div class="property-description-full">
                    <h4>Description</h4>
                    <p>${property.description}</p>
                </div>
                <div class="property-amenities" style="margin-top: 1.5rem;">
                    <h4>Amenities</h4>
                    <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; list-style: none; padding: 0;">
                        ${property.amenities.map(amenity => `<li style="padding: 0.25rem 0;">✓ ${amenity}</li>`).join('')}
                    </ul>
                </div>
                <div class="contact-info" style="margin-top: 1.5rem; padding: 1rem; background-color: #f9fafb; border-radius: 0.5rem;">
                    <h4>Contact Information</h4>
                    <p><strong>Phone:</strong> ${property.contact.phone}</p>
                    <p><strong>Email:</strong> ${property.contact.email}</p>
                    <p><strong>Available:</strong> ${property.available}</p>
                </div>
            </div>
        `;
        
        // Save viewed property to local storage
        this.storageManager.addViewedProperty(property.id);
        
        this.modalController.showModal('property-modal');
    }

    initModals() {
        // Initialize property modal
        this.modalController.initModal('property-modal');
        
        // Initialize neighborhood modal if on neighborhoods page
        if (document.getElementById('neighborhood-modal')) {
            this.modalController.initModal('neighborhood-modal');
        }
    }

    loadUserPreferences() {
        try {
            // Load sort preference
            const sortPreference = this.storageManager.getItem('sortPreference');
            if (sortPreference) {
                this.currentSort = sortPreference;
                const sortSelect = document.getElementById('sort-by');
                if (sortSelect) {
                    sortSelect.value = sortPreference;
                }
            }
            
            // Load search filters
            const savedFilters = this.storageManager.getItem('searchFilters');
            if (savedFilters) {
                this.currentFilters = savedFilters;
                this.populateSearchForm(savedFilters);
            }
            
        } catch (error) {
            // Error loading user preferences
        }
    }

    populateSearchForm(filters) {
        const form = document.getElementById('property-search');
        if (!form) return;
        
        Object.keys(filters).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && filters[key]) {
                input.value = filters[key];
            }
        });
    }

    initLazyLoading() {
        const images = document.querySelectorAll('.property-image[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            // Simulate loading actual images (in real implementation, you'd load actual images)
                            img.style.backgroundImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23e5e7eb"/><text x="150" y="100" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="16">Property Image</text></svg>')`;
                            img.style.backgroundSize = 'cover';
                            img.style.backgroundPosition = 'center';
                            img.innerHTML = '';
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #dc2626;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize FAQ functionality if on resources page
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    if (otherAnswer) {
                        otherAnswer.classList.remove('active');
                    }
                }
            });
            
            // Toggle current FAQ item
            question.setAttribute('aria-expanded', !isExpanded);
            if (answer) {
                answer.classList.toggle('active');
            }
        });
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    new RexburgHomeFinder();
    
    // Initialize FAQ functionality
    initFAQ();
});

// Export for use in other modules
export { RexburgHomeFinder };