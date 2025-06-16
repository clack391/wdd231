// Neighborhoods - handles neighborhood data and interactions
// ES Module for neighborhood functionality

import { ModalController } from './modalcontroller.js';
import { StorageManager } from './storagemanager.js';

class NeighborhoodManager {
    constructor() {
        this.modalController = new ModalController();
        this.storageManager = new StorageManager();
        this.neighborhoods = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        try {
            await this.loadNeighborhoods();
            this.initFilterButtons();
            this.displayNeighborhoods();
            this.modalController.initModal('neighborhood-modal');
            
            console.log('Neighborhood manager initialized');
            
        } catch (error) {
            console.error('Error initializing neighborhood manager:', error);
        }
    }

    async loadNeighborhoods() {
        try {
            // In a real application, this would fetch from an API
            // For this demo, we'll use static data
            this.neighborhoods = this.getNeighborhoodData();
            
            console.log(`Loaded ${this.neighborhoods.length} neighborhoods`);
            
        } catch (error) {
            console.error('Error loading neighborhoods:', error);
            this.neighborhoods = [];
        }
    }

    initFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update current filter
                this.currentFilter = e.target.getAttribute('data-filter');
                
                // Display filtered neighborhoods
                this.displayNeighborhoods();
                
                // Save filter preference
                this.storageManager.setItem('neighborhoodFilter', this.currentFilter);
            });
        });
        
        // Load saved filter preference
        const savedFilter = this.storageManager.getItem('neighborhoodFilter');
        if (savedFilter) {
            this.currentFilter = savedFilter;
            const activeButton = document.querySelector(`[data-filter="${savedFilter}"]`);
            if (activeButton) {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                activeButton.classList.add('active');
            }
        }
    }

    displayNeighborhoods() {
        const neighborhoodsGrid = document.getElementById('neighborhoods-grid');
        if (!neighborhoodsGrid) return;

        // Filter neighborhoods based on current filter
        const filteredNeighborhoods = this.filterNeighborhoods();

        // Clear existing content
        neighborhoodsGrid.innerHTML = '';

        // Generate neighborhood cards using array methods and template literals
        filteredNeighborhoods.forEach(neighborhood => {
            const neighborhoodCard = this.createNeighborhoodCard(neighborhood);
            neighborhoodsGrid.appendChild(neighborhoodCard);
        });

        console.log(`Displayed ${filteredNeighborhoods.length} neighborhoods`);
    }

    filterNeighborhoods() {
        return this.neighborhoods.filter(neighborhood => {
            switch (this.currentFilter) {
                case 'all':
                    return true;
                case 'campus':
                    return neighborhood.categories.includes('campus');
                case 'family':
                    return neighborhood.categories.includes('family');
                case 'downtown':
                    return neighborhood.categories.includes('downtown');
                default:
                    return true;
            }
        });
    }

    createNeighborhoodCard(neighborhood) {
        const card = document.createElement('div');
        card.className = 'neighborhood-card';
        card.setAttribute('data-neighborhood-id', neighborhood.id);

        // Using template literals for dynamic content generation
        card.innerHTML = `
            <h4>${neighborhood.name}</h4>
            <p><strong>Distance to BYU-I:</strong> ${neighborhood.distanceToCampus}</p>
            <p>${neighborhood.description}</p>
            <div class="neighborhood-stats" style="margin: 1rem 0;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.875rem;">
                    <span><strong>Avg Rent:</strong> $${neighborhood.averageRent}</span>
                    <span><strong>Safety Score:</strong> ${neighborhood.safetyScore}/10</span>
                    <span><strong>Walk Score:</strong> ${neighborhood.walkScore}/100</span>
                    <span><strong>Parking:</strong> ${neighborhood.parking}</span>
                </div>
            </div>
            <div class="neighborhood-tags">
                ${neighborhood.categories.map(category => 
                    `<span class="neighborhood-tag">${this.formatCategoryName(category)}</span>`
                ).join('')}
            </div>
        `;

        // Add click event listener for modal
        card.addEventListener('click', () => {
            this.showNeighborhoodModal(neighborhood);
        });

        // Add keyboard support
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${neighborhood.name} neighborhood`);

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showNeighborhoodModal(neighborhood);
            }
        });

        return card;
    }

    showNeighborhoodModal(neighborhood) {
        const modalBody = document.getElementById('neighborhood-modal-body');
        const modalTitle = document.getElementById('neighborhood-modal-title');

        if (!modalBody || !modalTitle) return;

        modalTitle.textContent = neighborhood.name;

        // Generate detailed neighborhood information using template literals
        modalBody.innerHTML = `
            <div class="neighborhood-details">
                <div class="neighborhood-overview" style="margin-bottom: 1.5rem;">
                    <h4>Overview</h4>
                    <p>${neighborhood.fullDescription}</p>
                </div>
                
                <div class="neighborhood-stats-detailed" style="margin-bottom: 1.5rem;">
                    <h4>Statistics</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="stat-item">
                            <strong>Distance to BYU-I:</strong> ${neighborhood.distanceToCampus}
                        </div>
                        <div class="stat-item">
                            <strong>Average Rent:</strong> $${neighborhood.averageRent}/month
                        </div>
                        <div class="stat-item">
                            <strong>Safety Score:</strong> ${neighborhood.safetyScore}/10
                        </div>
                        <div class="stat-item">
                            <strong>Walk Score:</strong> ${neighborhood.walkScore}/100
                        </div>
                        <div class="stat-item">
                            <strong>Parking:</strong> ${neighborhood.parking}
                        </div>
                        <div class="stat-item">
                            <strong>Public Transit:</strong> ${neighborhood.publicTransit}
                        </div>
                    </div>
                </div>

                <div class="neighborhood-amenities" style="margin-bottom: 1.5rem;">
                    <h4>Nearby Amenities</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        <div>
                            <h5 style="color: #2563eb; margin-bottom: 0.5rem;">🛒 Shopping</h5>
                            <ul style="list-style: none; padding: 0;">
                                ${neighborhood.amenities.shopping.map(item => `<li style="padding: 0.25rem 0;">• ${item}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h5 style="color: #2563eb; margin-bottom: 0.5rem;">🍕 Dining</h5>
                            <ul style="list-style: none; padding: 0;">
                                ${neighborhood.amenities.dining.map(item => `<li style="padding: 0.25rem 0;">• ${item}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h5 style="color: #2563eb; margin-bottom: 0.5rem;">🏃 Recreation</h5>
                            <ul style="list-style: none; padding: 0;">
                                ${neighborhood.amenities.recreation.map(item => `<li style="padding: 0.25rem 0;">• ${item}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h5 style="color: #2563eb; margin-bottom: 0.5rem;">🏥 Services</h5>
                            <ul style="list-style: none; padding: 0;">
                                ${neighborhood.amenities.services.map(item => `<li style="padding: 0.25rem 0;">• ${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="transportation-info" style="margin-bottom: 1.5rem;">
                    <h4>Transportation</h4>
                    <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
                        <p><strong>Bus Routes:</strong> ${neighborhood.transportation.busRoutes.join(', ')}</p>
                        <p><strong>Bike Paths:</strong> ${neighborhood.transportation.bikePaths}</p>
                        <p><strong>Walking to Campus:</strong> ${neighborhood.transportation.walkingToCampus}</p>
                    </div>
                </div>

                <div class="neighborhood-pros-cons" style="margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        <div>
                            <h5 style="color: #16a34a; margin-bottom: 0.5rem;">✅ Pros</h5>
                            <ul style="list-style: none; padding: 0;">
                                ${neighborhood.pros.map(pro => `<li style="padding: 0.25rem 0; color: #374151;">• ${pro}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h5 style="color: #dc2626; margin-bottom: 0.5rem;">⚠️ Considerations</h5>
                            <ul style="list-style: none; padding: 0;">
                                ${neighborhood.cons.map(con => `<li style="padding: 0.25rem 0; color: #374151;">• ${con}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="best-for-section">
                    <h4>Best For</h4>
                    <div class="best-for-tags" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${neighborhood.bestFor.map(category => 
                            `<span style="background-color: #e0f2fe; color: #0277bd; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">${category}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        // Save viewed neighborhood to local storage
        this.storageManager.addViewedProperty(`neighborhood_${neighborhood.id}`);

        this.modalController.showModal('neighborhood-modal');
    }

    formatCategoryName(category) {
        const categoryNames = {
            'campus': 'Near Campus',
            'family': 'Family-Friendly',
            'downtown': 'Downtown',
            'quiet': 'Quiet',
            'affordable': 'Affordable',
            'luxury': 'Luxury'
        };
        
        return categoryNames[category] || category;
    }

    getNeighborhoodData() {
        return [
            {
                id: "university-area",
                name: "University Area",
                distanceToCampus: "0.2 - 0.8 miles",
                averageRent: 525,
                safetyScore: 9,
                walkScore: 85,
                parking: "Limited street parking",
                publicTransit: "Campus shuttle available",
                categories: ["campus", "affordable"],
                description: "The closest neighborhood to BYU-I campus, popular with students who want to walk to classes.",
                fullDescription: "The University Area is the heart of student life in Rexburg, offering the closest proximity to BYU-Idaho campus. This neighborhood is characterized by numerous apartment complexes, shared housing options, and student-oriented businesses. The area buzzes with academic energy and provides easy access to campus facilities, making it ideal for students who prioritize convenience and campus involvement.",
                amenities: {
                    shopping: ["Campus Store", "Walmart (1.5 miles)", "Local convenience stores"],
                    dining: ["Subway", "Campus cafeterias", "Various pizza places", "Costa Vida"],
                    recreation: ["Campus recreation center", "Intramural fields", "Study lounges"],
                    services: ["Campus health center", "Study rooms", "Library access"]
                },
                transportation: {
                    busRoutes: ["Campus Shuttle", "City Route 1"],
                    bikePaths: "Excellent bike access to campus",
                    walkingToCampus: "5-15 minute walk"
                },
                pros: [
                    "Walking distance to campus",
                    "High concentration of students",
                    "Access to campus amenities",
                    "Active social environment"
                ],
                cons: [
                    "Can be noisy during school year",
                    "Limited parking",
                    "Higher rent during semester",
                    "Less family-oriented"
                ],
                bestFor: ["Students", "Campus employees", "Those without cars"]
            },
            {
                id: "downtown",
                name: "Downtown Rexburg",
                distanceToCampus: "1.5 - 2.0 miles",
                averageRent: 475,
                safetyScore: 8,
                walkScore: 70,
                parking: "Adequate street and lot parking",
                publicTransit: "City bus service",
                categories: ["downtown", "affordable"],
                description: "Historic downtown area with local shops, restaurants, and a mix of housing options.",
                fullDescription: "Downtown Rexburg offers a charming blend of historic architecture and modern conveniences. This area features a walkable main street with local businesses, cafes, and services. The neighborhood attracts both students and young professionals who appreciate the urban atmosphere while still being close to campus. Recent revitalization efforts have brought new life to the area.",
                amenities: {
                    shopping: ["Main Street shops", "Antique stores", "Local boutiques", "Farmers market"],
                    dining: ["Local cafes", "Family restaurants", "Coffee shops", "Ethnic cuisine"],
                    recreation: ["City park", "Walking paths", "Community events", "Art galleries"],
                    services: ["Post office", "Banks", "Professional services", "Medical offices"]
                },
                transportation: {
                    busRoutes: ["City Route 1", "City Route 2"],
                    bikePaths: "Good bike lanes on main streets",
                    walkingToCampus: "15-20 minute bike ride"
                },
                pros: [
                    "Historic charm and character",
                    "Walking to shops and restaurants",
                    "More affordable housing options",
                    "Good public transportation"
                ],
                cons: [
                    "Further from campus",
                    "Less student-focused environment",
                    "Some older buildings",
                    "Limited nightlife"
                ],
                bestFor: ["Graduate students", "Young professionals", "Those who prefer urban living"]
            },
            {
                id: "madison-district",
                name: "Madison District",
                distanceToCampus: "1.0 - 2.5 miles",
                averageRent: 750,
                safetyScore: 9,
                walkScore: 60,
                parking: "Ample parking available",
                publicTransit: "Limited bus service",
                categories: ["family", "quiet"],
                description: "Family-friendly neighborhood with newer homes, parks, and excellent schools.",
                fullDescription: "The Madison District represents Rexburg's premier family neighborhood, featuring well-maintained homes, tree-lined streets, and excellent schools. This area attracts families, faculty, and graduate students who value quality housing and a peaceful environment. The neighborhood includes both established homes and new developments, offering variety in housing options.",
                amenities: {
                    shopping: ["Neighborhood markets", "Walmart nearby", "Shopping centers"],
                    dining: ["Family restaurants", "Fast casual options", "Chain restaurants"],
                    recreation: ["Multiple parks", "Playgrounds", "Sports fields", "Walking trails"],
                    services: ["Elementary schools", "Medical clinics", "Veterinary services"]
                },
                transportation: {
                    busRoutes: ["Limited city bus service"],
                    bikePaths: "Residential bike-friendly streets",
                    walkingToCampus: "Need car or bike for campus"
                },
                pros: [
                    "Excellent for families",
                    "High-quality housing",
                    "Safe and quiet environment",
                    "Good schools nearby"
                ],
                cons: [
                    "Higher housing costs",
                    "Need transportation to campus",
                    "Less social for students",
                    "Limited walkability"
                ],
                bestFor: ["Families", "Faculty", "Graduate students", "Professionals"]
            },
            {
                id: "countryside",
                name: "Countryside",
                distanceToCampus: "2.0 - 3.5 miles",
                averageRent: 650,
                safetyScore: 9,
                walkScore: 30,
                parking: "Abundant parking",
                publicTransit: "No public transit",
                categories: ["family", "quiet"],
                description: "Rural setting with larger homes, acreage properties, and beautiful mountain views.",
                fullDescription: "The Countryside area offers a rural living experience while maintaining reasonable access to Rexburg and BYU-Idaho. This neighborhood features larger properties, some with acreage, and stunning views of the surrounding mountains. It's perfect for those who value privacy, space, and a connection to nature while still being part of the Rexburg community.",
                amenities: {
                    shopping: ["Need to drive to town for shopping", "Rural supply stores"],
                    dining: ["Limited local options", "Drive to town for restaurants"],
                    recreation: ["Outdoor activities", "Hiking access", "Private space"],
                    services: ["Rural postal service", "Some agricultural services"]
                },
                transportation: {
                    busRoutes: ["No public transportation"],
                    bikePaths: "Rural roads, some bike-friendly",
                    walkingToCampus: "Requires personal vehicle"
                },
                pros: [
                    "Privacy and space",
                    "Beautiful scenery",
                    "Quiet environment",
                    "Potential for outdoor activities"
                ],
                cons: [
                    "Requires vehicle for everything",
                    "Distance from campus",
                    "Limited amenities nearby",
                    "Potential for winter travel issues"
                ],
                bestFor: ["Families seeking space", "Faculty", "Those who prefer rural living"]
            },
            {
                id: "campus-area",
                name: "Campus Area",
                distanceToCampus: "0.5 - 1.2 miles",
                averageRent: 575,
                safetyScore: 8,
                walkScore: 75,
                parking: "Moderate parking availability",
                publicTransit: "Campus shuttle and city bus",
                categories: ["campus", "affordable"],
                description: "Mixed residential area popular with upperclassmen and graduate students.",
                fullDescription: "The Campus Area strikes a balance between proximity to BYU-Idaho and a more mature living environment. This neighborhood features a mix of apartments, condos, and small homes, attracting upperclassmen, graduate students, and young professionals. The area offers good access to campus while providing more diverse housing options than the immediate university area.",
                amenities: {
                    shopping: ["Grocery stores", "Pharmacy", "Local shops"],
                    dining: ["Restaurant variety", "Fast food options", "Coffee shops"],
                    recreation: ["Parks", "Recreation center access", "Walking paths"],
                    services: ["Medical services", "Professional offices", "Study spaces"]
                },
                transportation: {
                    busRoutes: ["Campus shuttle", "City Route 1", "City Route 3"],
                    bikePaths: "Good bike infrastructure",
                    walkingToCampus: "10-20 minute walk or short bike ride"
                },
                pros: [
                    "Good balance of convenience and quiet",
                    "Variety of housing options",
                    "Good transportation access",
                    "Mix of students and professionals"
                ],
                cons: [
                    "Still primarily student-oriented",
                    "Moderate housing costs",
                    "Some noise during school year",
                    "Parking can be competitive"
                ],
                bestFor: ["Upperclassmen", "Graduate students", "Young professionals", "Those wanting campus access"]
            },
            {
                id: "pine-district",
                name: "Pine District",
                distanceToCampus: "0.8 - 1.5 miles",
                averageRent: 450,
                safetyScore: 8,
                walkScore: 65,
                parking: "Good parking availability",
                publicTransit: "City bus service",
                categories: ["affordable", "quiet"],
                description: "Affordable neighborhood with older homes and apartments, popular with budget-conscious students.",
                fullDescription: "The Pine District offers some of the most affordable housing options in Rexburg while maintaining reasonable access to campus and local amenities. This established neighborhood features older but well-maintained properties, making it attractive to budget-conscious students and those seeking value. The area has a quiet, residential feel with tree-lined streets.",
                amenities: {
                    shopping: ["Local convenience stores", "Small markets", "Thrift shops"],
                    dining: ["Local eateries", "Budget-friendly options", "Food trucks"],
                    recreation: ["Neighborhood park", "Community garden", "Walking areas"],
                    services: ["Basic services", "Laundromat", "Small businesses"]
                },
                transportation: {
                    busRoutes: ["City Route 2"],
                    bikePaths: "Residential streets, bike-friendly",
                    walkingToCampus: "15-25 minute walk or 8-minute bike ride"
                },
                pros: [
                    "Very affordable housing",
                    "Quiet residential atmosphere",
                    "Good value for money",
                    "Established neighborhood character"
                ],
                cons: [
                    "Older housing stock",
                    "Limited amenities nearby",
                    "Less social environment",
                    "May need updates"
                ],
                bestFor: ["Budget-conscious students", "Those seeking quiet living", "Value seekers"]
            }
        ];
    }
}

// Initialize neighborhood manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the neighborhoods page
    if (document.getElementById('neighborhoods-grid')) {
        new NeighborhoodManager();
    }
});

export { NeighborhoodManager };