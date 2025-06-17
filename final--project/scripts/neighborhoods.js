// Neighborhoods page functionality
import { StorageManager } from './modules/storage-manager.js';

class NeighborhoodsApp {
    constructor() {
        this.storageManager = new StorageManager();
        this.neighborhoods = [];
        this.filteredNeighborhoods = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        try {
            // Load neighborhoods data
            await this.loadNeighborhoods();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Display neighborhoods
            this.displayNeighborhoods();
            
        } catch (error) {
            console.error('Failed to initialize neighborhoods app:', error);
            this.showError('Failed to load neighborhood data. Please refresh the page.');
        }
    }

    async loadNeighborhoods() {
        try {
            // Try to fetch from local JSON file first
            const response = await fetch('data/neighborhoods.json');
            
            if (response.ok) {
                const data = await response.json();
                if (data.neighborhoods && Array.isArray(data.neighborhoods)) {
                    this.neighborhoods = data.neighborhoods;
                } else {
                    throw new Error('Invalid neighborhoods data format');
                }
            } else {
                throw new Error('Failed to fetch neighborhoods data');
            }
        } catch (error) {
            // Use fallback data if fetch fails
            this.neighborhoods = this.getFallbackNeighborhoodData();
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

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });
    }

    handleFilterClick(e) {
        const filter = e.target.dataset.filter;
        if (!filter) return;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.currentFilter = filter;
        
        // Save filter preference
        this.storageManager.setUserPreference('neighborhoodFilter', filter);
        
        this.filterAndDisplayNeighborhoods();
    }

    filterAndDisplayNeighborhoods() {
        // Ensure neighborhoods are loaded
        if (!this.neighborhoods || this.neighborhoods.length === 0) {
            this.showError('No neighborhood data available.');
            return;
        }

        // Apply filter
        if (this.currentFilter === 'all') {
            this.filteredNeighborhoods = [...this.neighborhoods];
        } else {
            this.filteredNeighborhoods = this.neighborhoods.filter(neighborhood => 
                neighborhood.category === this.currentFilter
            );
        }

        this.displayNeighborhoods();
    }

    displayNeighborhoods() {
        const grid = document.getElementById('neighborhoodsGrid');
        if (!grid) return;

        if (this.filteredNeighborhoods.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <h3>No neighborhoods found</h3>
                    <p>Try adjusting your filter selection.</p>
                </div>
            `;
            return;
        }

        const neighborhoodCards = this.filteredNeighborhoods.map(neighborhood => 
            this.createNeighborhoodCard(neighborhood)
        );

        grid.innerHTML = neighborhoodCards.join('');

        // Track neighborhood views
        this.storageManager.incrementCounter('neighborhoodsPageViews');
    }

    createNeighborhoodCard(neighborhood) {
        const tags = neighborhood.tags.map(tag => 
            `<span class="neighborhood-tag">${tag}</span>`
        ).join('');

        const highlights = neighborhood.highlights.map(highlight => 
            `<li>${highlight}</li>`
        ).join('');

        return `
            <div class="neighborhood-card" data-category="${neighborhood.category}">
                <h3>${neighborhood.name}</h3>
                <div class="neighborhood-tags">
                    ${tags}
                </div>
                <p style="color: var(--text-light); margin-bottom: 1rem;">
                    ${neighborhood.description}
                </p>
                
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">Key Features:</h4>
                    <ul style="list-style-position: inside; color: var(--text-light);">
                        ${highlights}
                    </ul>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem;">
                    <div>
                        <strong>Distance to Campus:</strong><br>
                        <span style="color: var(--primary-color);">${neighborhood.distanceToCampus}</span>
                    </div>
                    <div>
                        <strong>Average Rent:</strong><br>
                        <span style="color: var(--primary-color);">${neighborhood.averageRent}</span>
                    </div>
                    <div>
                        <strong>Safety Rating:</strong><br>
                        <span style="color: var(--primary-color);">${neighborhood.safetyRating}/5</span>
                    </div>
                    <div>
                        <strong>Walkability:</strong><br>
                        <span style="color: var(--primary-color);">${neighborhood.walkability}/10</span>
                    </div>
                </div>
                
                <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">Nearby Amenities:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.8rem;">
                        ${neighborhood.amenities.map(amenity => 
                            `<span style="background: var(--bg-light); padding: 0.25rem 0.5rem; border-radius: 1rem;">${amenity}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getFallbackNeighborhoodData() {
        return [
            {
                id: 1,
                name: "Campus View District",
                category: "campus",
                description: "Prime location for students with easy walking access to BYU-I campus and academic buildings.",
                distanceToCampus: "0.2 miles",
                averageRent: "$500-800/month",
                safetyRating: 5,
                walkability: 9,
                tags: ["Student Housing", "Walking Distance", "Safe"],
                highlights: [
                    "5-minute walk to campus",
                    "24/7 security patrols",
                    "Study-friendly environment",
                    "Bike storage available"
                ],
                amenities: ["Campus Shuttle", "Study Rooms", "Laundry", "Parking"]
            },
            {
                id: 2,
                name: "University Heights",
                category: "campus",
                description: "Popular student neighborhood with modern apartments and excellent campus connectivity.",
                distanceToCampus: "0.5 miles",
                averageRent: "$600-950/month",
                safetyRating: 4,
                walkability: 8,
                tags: ["Modern Apartments", "Student Life", "Transit Access"],
                highlights: [
                    "Modern apartment complexes",
                    "Active student community",
                    "Regular bus service to campus",
                    "Recreation facilities nearby"
                ],
                amenities: ["Fitness Center", "Pool", "Bus Stop", "Shopping"]
            },
            {
                id: 3,
                name: "Historic Downtown",
                category: "downtown",
                description: "Charming downtown area with local businesses, restaurants, and cultural attractions.",
                distanceToCampus: "1.2 miles",
                averageRent: "$700-1200/month",
                safetyRating: 4,
                walkability: 7,
                tags: ["Historic", "Entertainment", "Dining"],
                highlights: [
                    "Historic buildings and architecture",
                    "Local restaurants and cafes",
                    "Cultural events and festivals",
                    "Art galleries and shops"
                ],
                amenities: ["Restaurants", "Shopping", "Banks", "Post Office"]
            },
            {
                id: 4,
                name: "Porter Park Area",
                category: "residential",
                description: "Family-friendly residential neighborhood with parks, schools, and quiet streets.",
                distanceToCampus: "1.8 miles",
                averageRent: "$800-1400/month",
                safetyRating: 5,
                walkability: 6,
                tags: ["Family Friendly", "Parks", "Quiet"],
                highlights: [
                    "Large family homes available",
                    "Excellent schools nearby",
                    "Porter Park recreation facilities",
                    "Safe, quiet streets"
                ],
                amenities: ["Parks", "Schools", "Playground", "Sports Fields"]
            },
            {
                id: 5,
                name: "Yellowstone Highway Corridor",
                category: "residential",
                description: "Convenient location with easy access to shopping, dining, and highway transportation.",
                distanceToCampus: "2.0 miles",
                averageRent: "$650-1100/month",
                safetyRating: 4,
                walkability: 5,
                tags: ["Convenient", "Shopping", "Transit"],
                highlights: [
                    "Close to major shopping centers",
                    "Easy highway access",
                    "Variety of dining options",
                    "Good for commuters"
                ],
                amenities: ["Walmart", "Gas Stations", "Fast Food", "Auto Services"]
            },
            {
                id: 6,
                name: "Nature Park Vicinity",
                category: "residential",
                description: "Peaceful area near Rexburg's Nature Park with walking trails and outdoor recreation.",
                distanceToCampus: "1.5 miles",
                averageRent: "$750-1300/month",
                safetyRating: 5,
                walkability: 7,
                tags: ["Nature", "Peaceful", "Recreation"],
                highlights: [
                    "Adjacent to Nature Park",
                    "Walking and biking trails",
                    "Wildlife viewing opportunities",
                    "Peaceful, natural setting"
                ],
                amenities: ["Nature Park", "Trails", "Picnic Areas", "Wildlife"]
            },
            {
                id: 7,
                name: "West Campus District",
                category: "campus",
                description: "Growing area west of campus with new developments and student housing options.",
                distanceToCampus: "0.8 miles",
                averageRent: "$550-900/month",
                safetyRating: 4,
                walkability: 7,
                tags: ["New Development", "Affordable", "Growing"],
                highlights: [
                    "Newer housing developments",
                    "Competitive rental prices",
                    "Growing student population",
                    "Good bike routes to campus"
                ],
                amenities: ["New Construction", "Bike Paths", "Grocery", "Pharmacy"]
            },
            {
                id: 8,
                name: "South Rexburg",
                category: "residential",
                description: "Established residential area with a mix of homes and apartments, good for families.",
                distanceToCampus: "2.5 miles",
                averageRent: "$700-1250/month",
                safetyRating: 4,
                walkability: 6,
                tags: ["Established", "Mixed Housing", "Family Area"],
                highlights: [
                    "Mix of houses and apartments",
                    "Established neighborhood",
                    "Good for families",
                    "Reasonable commute to campus"
                ],
                amenities: ["Elementary School", "Library Branch", "Community Center", "Parks"]
            }
        ];
    }

    loadUserPreferences() {
        const savedFilter = this.storageManager.getUserPreference('neighborhoodFilter');
        if (savedFilter) {
            this.currentFilter = savedFilter;
            
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeBtn = document.querySelector(`[data-filter="${savedFilter}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        } else {
            // Ensure 'all' is selected by default
            this.currentFilter = 'all';
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const allBtn = document.querySelector('[data-filter="all"]');
            if (allBtn) {
                allBtn.classList.add('active');
            }
        }
    }

    showError(message) {
        const grid = document.getElementById('neighborhoodsGrid');
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
    new NeighborhoodsApp();
});