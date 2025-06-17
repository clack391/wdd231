// Services - handles local services data and display
// ES Module for local services functionality

import { StorageManager } from './storageManager.js';

class ServicesManager {
    constructor() {
        this.storageManager = new StorageManager();
        this.services = [];
        this.init();
    }

    async init() {
        try {
            await this.loadServices();
            this.displayServices();
        } catch (error) {
            // Error initializing services manager
        }
    }

    async loadServices() {
        try {
            // In a real application, this would fetch from an API
            // For this demo, we'll use static data
            this.services = this.getServicesData();
        } catch (error) {
            this.services = [];
        }
    }

    displayServices() {
        const servicesGrid = document.getElementById('services-grid');
        if (!servicesGrid) return;

        // Clear existing content
        servicesGrid.innerHTML = '';

        // Group services by category using array methods
        const servicesByCategory = this.groupServicesByCategory();

        // Display services by category
        Object.keys(servicesByCategory).forEach(category => {
            const categoryServices = servicesByCategory[category];
            const categorySection = this.createCategorySection(category, categoryServices);
            servicesGrid.appendChild(categorySection);
        });
    }

    groupServicesByCategory() {
        // Use reduce to group services by category
        return this.services.reduce((groups, service) => {
            const category = service.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(service);
            return groups;
        }, {});
    }

    createCategorySection(category, services) {
        const section = document.createElement('div');
        section.className = 'service-category-section';
        section.style.cssText = 'margin-bottom: 2rem; grid-column: 1 / -1;';

        // Create category header
        const header = document.createElement('h4');
        header.textContent = this.formatCategoryName(category);
        header.style.cssText = 'margin-bottom: 1rem; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;';

        // Create services grid for this category
        const servicesGrid = document.createElement('div');
        servicesGrid.className = 'category-services-grid';
        servicesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;';

        // Add service cards using array methods and template literals
        services.forEach(service => {
            const serviceCard = this.createServiceCard(service);
            servicesGrid.appendChild(serviceCard);
        });

        section.appendChild(header);
        section.appendChild(servicesGrid);

        return section;
    }

    createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.setAttribute('data-service-id', service.id);

        // Using template literals for dynamic content generation
        card.innerHTML = `
            <div class="service-category">${this.formatCategoryName(service.category)}</div>
            <h4>${service.name}</h4>
            <p>${service.description}</p>
            <div class="service-details" style="margin: 1rem 0;">
                ${service.address ? `<p><strong>📍 Address:</strong> ${service.address}</p>` : ''}
                ${service.hours ? `<p><strong>🕒 Hours:</strong> ${service.hours}</p>` : ''}
                ${service.specialties && service.specialties.length > 0 ? 
                    `<p><strong>🔧 Specialties:</strong> ${service.specialties.join(', ')}</p>` : ''
                }
            </div>
            <div class="service-contact">
                ${service.phone ? `<p><strong>📞 Phone:</strong> <a href="tel:${service.phone}">${service.phone}</a></p>` : ''}
                ${service.email ? `<p><strong>📧 Email:</strong> <a href="mailto:${service.email}">${service.email}</a></p>` : ''}
                ${service.website ? `<p><strong>🌐 Website:</strong> <a href="${service.website}" target="_blank" rel="noopener">Visit Website</a></p>` : ''}
            </div>
            ${service.rating ? 
                `<div class="service-rating" style="margin-top: 1rem; padding: 0.5rem; background-color: #f3f4f6; border-radius: 0.25rem;">
                    <span style="color: #059669; font-weight: 500;">⭐ ${service.rating}/5</span>
                    ${service.reviewCount ? ` (${service.reviewCount} reviews)` : ''}
                </div>` : ''
            }
        `;

        // Add click tracking for analytics
        card.addEventListener('click', () => {
            this.trackServiceInteraction(service.id, 'view');
        });

        return card;
    }

    formatCategoryName(category) {
        const categoryNames = {
            'real-estate': 'Real Estate Agents',
            'mortgage': 'Mortgage Lenders',
            'moving': 'Moving Services',
            'utilities': 'Utilities',
            'insurance': 'Insurance',
            'legal': 'Legal Services',
            'home-services': 'Home Services',
            'storage': 'Storage Facilities'
        };
        
        return categoryNames[category] || category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    trackServiceInteraction(serviceId, action) {
        // Track service interactions for analytics
        const interaction = {
            serviceId: serviceId,
            action: action,
            timestamp: new Date().toISOString()
        };

        // Save to local storage
        const interactions = this.storageManager.getItem('service_interactions') || [];
        interactions.push(interaction);
        
        // Keep only last 100 interactions
        const limitedInteractions = interactions.slice(-100);
        this.storageManager.setItem('service_interactions', limitedInteractions);
    }

    // Method to get popular services based on interactions
    getPopularServices(limit = 5) {
        const interactions = this.storageManager.getItem('service_interactions') || [];
        const serviceCounts = {};

        interactions.forEach(interaction => {
            serviceCounts[interaction.serviceId] = (serviceCounts[interaction.serviceId] || 0) + 1;
        });

        // Sort services by interaction count and return top services
        const sortedServices = Object.entries(serviceCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([serviceId]) => this.services.find(s => s.id === serviceId))
            .filter(service => service !== undefined);

        return sortedServices;
    }

    getServicesData() {
        return [
            {
                id: "coldwell-banker",
                category: "real-estate",
                name: "Coldwell Banker Tobler & Associates",
                description: "Full-service real estate agency specializing in Rexburg and eastern Idaho properties. Experienced agents helping with buying and selling homes.",
                address: "123 W Main St, Rexburg, ID 83440",
                phone: "(208) 356-4444",
                email: "info@cbttobler.com",
                website: "https://www.cbttobler.com",
                hours: "Monday-Friday 9AM-6PM, Saturday 9AM-4PM",
                specialties: ["Residential Sales", "First-time Buyers", "Student Housing", "Investment Properties"],
                rating: 4.5,
                reviewCount: 127
            },
            {
                id: "rexburg-realty",
                category: "real-estate",
                name: "Rexburg Realty",
                description: "Local real estate professionals with deep knowledge of the Rexburg market. Specializing in homes near BYU-I campus.",
                address: "456 University Blvd, Rexburg, ID 83440",
                phone: "(208) 356-7890",
                email: "homes@rexburgrealty.com",
                website: "https://www.rexburgrealty.com",
                hours: "Monday-Saturday 8AM-7PM",
                specialties: ["Campus Housing", "New Construction", "Rental Properties", "Property Management"],
                rating: 4.8,
                reviewCount: 89
            },
            {
                id: "idaho-central-credit-union",
                category: "mortgage",
                name: "Idaho Central Credit Union",
                description: "Local credit union offering competitive mortgage rates and personalized service for home buyers in the Rexburg area.",
                address: "789 S 2nd E, Rexburg, ID 83440",
                phone: "(208) 356-1000",
                email: "mortgage@iccu.com",
                website: "https://www.iccu.com",
                hours: "Monday-Friday 9AM-6PM, Saturday 9AM-1PM",
                specialties: ["First-time Buyer Programs", "FHA Loans", "Conventional Mortgages", "Refinancing"],
                rating: 4.6,
                reviewCount: 203
            },
            {
                id: "first-federal-savings",
                category: "mortgage",
                name: "First Federal Savings Bank",
                description: "Community bank providing home loans with local decision-making and competitive rates for Rexburg residents.",
                address: "321 W 4th S, Rexburg, ID 83440",
                phone: "(208) 356-5555",
                email: "lending@ffsbidaho.com",
                website: "https://www.ffsbidaho.com",
                hours: "Monday-Friday 9AM-5PM",
                specialties: ["Construction Loans", "Rural Housing", "VA Loans", "USDA Loans"],
                rating: 4.3,
                reviewCount: 156
            },
            {
                id: "rexburg-moving",
                category: "moving",
                name: "Rexburg Moving Company",
                description: "Local moving service specializing in residential moves within Rexburg and eastern Idaho. Student-friendly rates available.",
                address: "654 Industrial Way, Rexburg, ID 83440",
                phone: "(208) 356-MOVE",
                email: "info@rexburgmoving.com",
                hours: "Monday-Saturday 7AM-7PM",
                specialties: ["Local Moves", "Student Moves", "Apartment Moves", "Loading/Unloading"],
                rating: 4.4,
                reviewCount: 78
            },
            {
                id: "all-my-sons",
                category: "moving",
                name: "All My Sons Moving & Storage",
                description: "Professional moving company serving Rexburg with full-service moving, packing, and storage solutions.",
                address: "987 Commerce Dr, Rexburg, ID 83440",
                phone: "(208) 356-2222",
                email: "rexburg@allmysons.com",
                website: "https://www.allmysons.com",
                hours: "Monday-Friday 8AM-6PM, Saturday 8AM-4PM",
                specialties: ["Long Distance Moves", "Packing Services", "Storage Solutions", "Commercial Moves"],
                rating: 4.2,
                reviewCount: 134
            },
            {
                id: "rocky-mountain-power",
                category: "utilities",
                name: "Rocky Mountain Power",
                description: "Primary electricity provider for Rexburg. Online account management and 24/7 customer service available.",
                address: "147 W 1st S, Rexburg, ID 83440",
                phone: "(888) 221-7070",
                website: "https://www.rockymountainpower.net",
                hours: "Monday-Friday 8AM-5PM",
                specialties: ["Electricity Service", "New Connections", "Energy Efficiency Programs", "Budget Billing"],
                rating: 3.8,
                reviewCount: 312
            },
            {
                id: "intermountain-gas",
                category: "utilities",
                name: "Intermountain Gas",
                description: "Natural gas utility serving Rexburg area. Providing reliable gas service for heating and appliances.",
                address: "258 S 1st E, Rexburg, ID 83440",
                phone: "(800) 548-3667",
                website: "https://www.intgas.com",
                hours: "Monday-Friday 8AM-5PM",
                specialties: ["Natural Gas Service", "Appliance Installation", "Service Connections", "Safety Inspections"],
                rating: 4.1,
                reviewCount: 187
            },
            {
                id: "state-farm-rexburg",
                category: "insurance",
                name: "State Farm - Mike Johnson Agency",
                description: "Full-service State Farm agency providing home, auto, and renters insurance for Rexburg residents.",
                address: "369 University Blvd, Rexburg, ID 83440",
                phone: "(208) 356-3333",
                email: "mike.johnson@statefarm.com",
                hours: "Monday-Friday 9AM-6PM, Saturday 9AM-1PM",
                specialties: ["Homeowners Insurance", "Renters Insurance", "Auto Insurance", "Life Insurance"],
                rating: 4.7,
                reviewCount: 95
            },
            {
                id: "allstate-rexburg",
                category: "insurance",
                name: "Allstate - Sarah Miller Agency",
                description: "Allstate insurance agency offering comprehensive coverage options for homes, autos, and personal property.",
                address: "741 W Main St, Rexburg, ID 83440",
                phone: "(208) 356-7777",
                email: "sarah.miller@allstate.com",
                hours: "Monday-Friday 8:30AM-5:30PM",
                specialties: ["Home Insurance", "Condo Insurance", "Motorcycle Insurance", "Business Insurance"],
                rating: 4.5,
                reviewCount: 72
            },
            {
                id: "rexburg-law",
                category: "legal",
                name: "Rexburg Law Offices",
                description: "General practice law firm handling real estate transactions, landlord-tenant issues, and property law matters.",
                address: "852 Center St, Rexburg, ID 83440",
                phone: "(208) 356-LAW1",
                email: "info@rexburglaw.com",
                website: "https://www.rexburglaw.com",
                hours: "Monday-Friday 9AM-5PM",
                specialties: ["Real Estate Law", "Contract Review", "Landlord-Tenant Law", "Property Disputes"],
                rating: 4.6,
                reviewCount: 64
            },
            {
                id: "affordable-plumbing",
                category: "home-services",
                name: "Affordable Plumbing & Heating",
                description: "Licensed plumbing and heating contractor serving Rexburg. Emergency services available 24/7.",
                address: "159 Industrial Rd, Rexburg, ID 83440",
                phone: "(208) 356-PIPE",
                email: "service@affordableplumbing.com",
                hours: "Monday-Friday 7AM-5PM, Emergency 24/7",
                specialties: ["Plumbing Repair", "Heating Systems", "Water Heaters", "Emergency Services"],
                rating: 4.4,
                reviewCount: 156
            },
            {
                id: "bright-electric",
                category: "home-services",
                name: "Bright Electric",
                description: "Licensed electrical contractor for residential and commercial electrical work in Rexburg area.",
                address: "753 Technology Dr, Rexburg, ID 83440",
                phone: "(208) 356-VOLT",
                email: "info@brightelectric.com",
                hours: "Monday-Friday 7AM-6PM",
                specialties: ["Electrical Repair", "Wiring", "Panel Upgrades", "Ceiling Fans"],
                rating: 4.8,
                reviewCount: 92
            },
            {
                id: "rexburg-storage",
                category: "storage",
                name: "Rexburg Self Storage",
                description: "Clean, secure storage units in various sizes. Climate-controlled units available. Student discounts offered.",
                address: "951 W 7th N, Rexburg, ID 83440",
                phone: "(208) 356-STOR",
                email: "rent@rexburgstorage.com",
                website: "https://www.rexburgstorage.com",
                hours: "Office: Monday-Saturday 9AM-6PM, Access: 6AM-10PM Daily",
                specialties: ["Climate Controlled", "Vehicle Storage", "Student Storage", "Moving Supplies"],
                rating: 4.3,
                reviewCount: 118
            },
            {
                id: "secure-storage",
                category: "storage",
                name: "Secure Storage Solutions",
                description: "Modern storage facility with advanced security features. Online rental and payment options available.",
                address: "357 Commerce Way, Rexburg, ID 83440",
                phone: "(208) 356-9999",
                email: "info@securestorageid.com",
                website: "https://www.securestorageid.com",
                hours: "Office: Monday-Friday 9AM-6PM, Saturday 9AM-4PM, Access: 24/7",
                specialties: ["24/7 Access", "Security Cameras", "Online Management", "Business Storage"],
                rating: 4.6,
                reviewCount: 84
            }
        ];
    }
}

// Initialize services manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the resources page
    if (document.getElementById('services-grid')) {
        new ServicesManager();
    }
});

export { ServicesManager };