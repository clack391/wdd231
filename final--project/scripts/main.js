// Main JavaScript module for property search functionality
import { PropertyService } from './modules/property-service.js';
import { ModalManager } from './modules/modal-manager.js';
import { StorageManager } from './modules/storage-manager.js';

class PropertySearchApp {
    constructor() {
        this.propertyService = new PropertyService();
        this.modalManager = new ModalManager();
        this.storageManager = new StorageManager();
        this.properties = [];
        this.filteredProperties = [];
        this.displayedCount = 0;
        this.itemsPerPage = 12;
        this.currentFilters = {
            type: 'all',
            maxPrice: 'all',
            bedrooms: 'all',
            sortBy: 'price-low'
        };
        
        this.init();
    }

    async init() {
        try {
            // Load properties data
            await this.loadProperties();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load user preferences from storage
            this.loadUserPreferences();
            
            // Initial display
            this.filterAndDisplayProperties();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load properties. Please refresh the page.');
        }
    }

    async loadProperties() {
        try {
            this.properties = await this.propertyService.getProperties();
        } catch (error) {
            throw new Error('Failed to load property data');
        }
    }

    setupEventListeners() {
        // Hamburger menu
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Search form
        const searchForm = document.getElementById('propertySearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearchSubmit(e);
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProperties();
            });
        }

        // Property cards (delegated event handling)
        const propertiesGrid = document.getElementById('propertiesGrid');
        if (propertiesGrid) {
            propertiesGrid.addEventListener('click', (e) => {
                const propertyCard = e.target.closest('.property-card');
                if (propertyCard) {
                    const propertyId = propertyCard.dataset.propertyId;
                    this.showPropertyModal(propertyId);
                }
            });
        }
    }

    handleSearchSubmit(e) {
        const formData = new FormData(e.target);
        this.currentFilters = {
            type: formData.get('propertyType') || 'all',
            maxPrice: formData.get('priceRange') || 'all',
            bedrooms: formData.get('bedrooms') || 'all',
            sortBy: this.currentFilters.sortBy
        };
        
        // Save search preferences
        this.storageManager.setItem('searchFilters', this.currentFilters);
        
        this.filterAndDisplayProperties();
    }

    handleFilterClick(e) {
        const filterType = e.target.dataset.type;
        if (!filterType) return;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilters.type = filterType;
        this.storageManager.setItem('searchFilters', this.currentFilters);
        this.filterAndDisplayProperties();
    }

    handleSortChange(e) {
        this.currentFilters.sortBy = e.target.value;
        this.storageManager.setItem('searchFilters', this.currentFilters);
        this.filterAndDisplayProperties();
    }

    filterAndDisplayProperties() {
        // Apply filters
        this.filteredProperties = this.properties.filter(property => {
            const typeMatch = this.currentFilters.type === 'all' || 
                             property.type === this.currentFilters.type;
            
            const priceMatch = this.currentFilters.maxPrice === 'all' || 
                              property.price <= parseInt(this.currentFilters.maxPrice);
            
            const bedroomMatch = this.currentFilters.bedrooms === 'all' || 
                                property.bedrooms >= parseInt(this.currentFilters.bedrooms);
            
            return typeMatch && priceMatch && bedroomMatch;
        });

        // Apply sorting
        this.sortProperties();

        // Reset display count
        this.displayedCount = 0;

        // Display properties
        this.displayProperties(true);
        this.updateResultsCount();
    }

    sortProperties() {
        this.filteredProperties.sort((a, b) => {
            switch (this.currentFilters.sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'bedrooms':
                    return b.bedrooms - a.bedrooms;
                default:
                    return 0;
            }
        });
    }

    displayProperties(clearGrid = false) {
        const grid = document.getElementById('propertiesGrid');
        if (!grid) return;

        if (clearGrid) {
            grid.innerHTML = '';
            this.displayedCount = 0;
        }

        const startIndex = this.displayedCount;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredProperties.length);
        const propertiesToShow = this.filteredProperties.slice(startIndex, endIndex);

        const propertyCards = propertiesToShow.map(property => this.createPropertyCard(property));
        grid.insertAdjacentHTML('beforeend', propertyCards.join(''));

        this.displayedCount = endIndex;

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            if (this.displayedCount < this.filteredProperties.length) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        }

        // Lazy load images for new cards
        this.lazyLoadImages();
    }

    createPropertyCard(property) {
        return `
            <div class="property-card" data-property-id="${property.id}">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3C/svg%3E" 
                     data-src="${property.image}" 
                     alt="${property.title}" 
                     class="property-image lazy" 
                     loading="lazy">
                <div class="property-details">
                    <div class="property-type">${property.type === 'rent' ? 'For Rent' : 'For Sale'}</div>
                    <div class="property-price">$${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}</div>
                    <div class="property-address">${property.address}</div>
                    <div class="property-features">
                        <span>${property.bedrooms} bed</span>
                        <span>${property.bathrooms} bath</span>
                        <span>${property.sqft} sq ft</span>
                        <span>${property.distanceToCampus} to BYU-I</span>
                    </div>
                </div>
            </div>
        `;
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img.lazy[data-src]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    loadMoreProperties() {
        this.displayProperties(false);
    }

    showPropertyModal(propertyId) {
        const property = this.properties.find(p => p.id === parseInt(propertyId));
        if (!property) return;

        const modalContent = this.createModalContent(property);
        this.modalManager.showModal('propertyModal', property.title, modalContent);

        // Track viewed properties
        this.storageManager.addToArray('viewedProperties', property.id);
    }

    createModalContent(property) {
        return `
            <div class="property-modal-content">
                <img src="${property.image}" alt="${property.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                
                <div class="property-type">${property.type === 'rent' ? 'For Rent' : 'For Sale'}</div>
                <div class="property-price" style="font-size: 2rem; font-weight: bold; color: var(--primary-color); margin: 1rem 0;">
                    $${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}
                </div>
                
                <div class="property-address" style="font-size: 1.2rem; color: var(--text-light); margin-bottom: 2rem;">
                    ${property.address}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${property.bedrooms}</div>
                        <div style="color: var(--text-light);">Bedrooms</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${property.bathrooms}</div>
                        <div style="color: var(--text-light);">Bathrooms</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${property.sqft}</div>
                        <div style="color: var(--text-light);">Sq Ft</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${property.distanceToCampus}</div>
                        <div style="color: var(--text-light);">to BYU-I</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Description</h4>
                    <p style="line-height: 1.6;">${property.description}</p>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Features</h4>
                    <ul style="list-style-type: disc; padding-left: 1.5rem;">
                        ${property.features.map(feature => `<li style="margin-bottom: 0.5rem;">${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <a href="tel:${property.contact.phone}" class="btn-primary">Call ${property.contact.phone}</a>
                    <a href="mailto:${property.contact.email}" class="btn-secondary">Email Agent</a>
                </div>
            </div>
        `;
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const total = this.filteredProperties.length;
            const displayed = Math.min(this.displayedCount, total);
            resultsCount.textContent = `Showing ${displayed} of ${total} properties`;
        }
    }

    loadUserPreferences() {
        const savedFilters = this.storageManager.getItem('searchFilters');
        if (savedFilters) {
            this.currentFilters = { ...this.currentFilters, ...savedFilters };
            
            // Apply saved filters to form
            const typeSelect = document.getElementById('propertyType');
            const priceSelect = document.getElementById('priceRange');
            const bedroomSelect = document.getElementById('bedrooms');
            const sortSelect = document.getElementById('sortBy');
            
            if (typeSelect) typeSelect.value = this.currentFilters.type;
            if (priceSelect) priceSelect.value = this.currentFilters.maxPrice;
            if (bedroomSelect) bedroomSelect.value = this.currentFilters.bedrooms;
            if (sortSelect) sortSelect.value = this.currentFilters.sortBy;
            
            // Update active filter button
            const activeFilterBtn = document.querySelector(`[data-type="${this.currentFilters.type}"]`);
            if (activeFilterBtn) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                activeFilterBtn.classList.add('active');
            }
        }
    }

    showError(message) {
        const grid = document.getElementById('propertiesGrid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--accent-color);">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PropertySearchApp();
});