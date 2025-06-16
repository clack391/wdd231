// Property Manager - handles data fetching and property management
// ES Module for managing property data with fetch API and error handling

export class PropertyManager {
    constructor() {
        this.properties = [];
        this.dataUrl = 'data/properties.json';
    }

    async loadProperties() {
        try {
            // Use fetch API with error handling
            const response = await fetch(this.dataUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!data || !Array.isArray(data.properties)) {
                throw new Error('Invalid data format: properties array not found');
            }
            
            this.properties = data.properties;
            
            return this.properties;
            
        } catch (error) {
            // Fallback to sample data if fetch fails
            this.properties = this.getFallbackProperties();
            
            return this.properties;
        }
    }

    getProperties() {
        return this.properties;
    }

    getPropertyById(id) {
        return this.properties.find(property => property.id === id);
    }

    // Filter properties by various criteria using array methods
    filterProperties(filters) {
        return this.properties.filter(property => {
            // Type filter
            if (filters.type && property.type !== filters.type) {
                return false;
            }
            
            // Bedroom filter
            if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) {
                return false;
            }
            
            // Price filter
            if (filters.maxPrice) {
                const price = parseInt(property.price);
                const maxPrice = parseInt(filters.maxPrice);
                if (price > maxPrice) {
                    return false;
                }
            }
            
            // Neighborhood filter
            if (filters.neighborhood && property.neighborhood !== filters.neighborhood) {
                return false;
            }
            
            return true;
        });
    }

    // Sort properties using array methods
    sortProperties(properties, sortBy) {
        return [...properties].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseInt(a.price) - parseInt(b.price);
                case 'price-high':
                    return parseInt(b.price) - parseInt(a.price);
                case 'bedrooms':
                    return parseInt(b.bedrooms) - parseInt(a.bedrooms);
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'distance':
                    return parseFloat(a.distanceToCampus) - parseFloat(b.distanceToCampus);
                default:
                    return 0;
            }
        });
    }

    // Get property statistics using array methods
    getPropertyStats() {
        if (this.properties.length === 0) {
            return null;
        }

        const rentProperties = this.properties.filter(p => p.type === 'rent');
        const saleProperties = this.properties.filter(p => p.type === 'buy');
        
        const rentPrices = rentProperties.map(p => parseInt(p.price));
        const salePrices = saleProperties.map(p => parseInt(p.price));

        return {
            total: this.properties.length,
            forRent: rentProperties.length,
            forSale: saleProperties.length,
            averageRent: rentPrices.length > 0 ? Math.round(rentPrices.reduce((a, b) => a + b, 0) / rentPrices.length) : 0,
            averageSalePrice: salePrices.length > 0 ? Math.round(salePrices.reduce((a, b) => a + b, 0) / salePrices.length) : 0,
            minRent: rentPrices.length > 0 ? Math.min(...rentPrices) : 0,
            maxRent: rentPrices.length > 0 ? Math.max(...rentPrices) : 0,
            minSalePrice: salePrices.length > 0 ? Math.min(...salePrices) : 0,
            maxSalePrice: salePrices.length > 0 ? Math.max(...salePrices) : 0
        };
    }

    // Get properties by neighborhood using array methods
    getPropertiesByNeighborhood() {
        const neighborhoods = {};
        
        this.properties.forEach(property => {
            const neighborhood = property.neighborhood;
            if (!neighborhoods[neighborhood]) {
                neighborhoods[neighborhood] = [];
            }
            neighborhoods[neighborhood].push(property);
        });
        
        return neighborhoods;
    }

    // Search properties by text using array methods
    searchProperties(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return this.properties;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        return this.properties.filter(property => {
            return (
                property.address.toLowerCase().includes(term) ||
                property.description.toLowerCase().includes(term) ||
                property.neighborhood.toLowerCase().includes(term) ||
                property.amenities.some(amenity => amenity.toLowerCase().includes(term))
            );
        });
    }

    // Fallback data in case external fetch fails
    getFallbackProperties() {
        return [
            {
                id: "1",
                address: "123 University Blvd, Rexburg, ID",
                price: "650",
                type: "rent",
                bedrooms: 2,
                bathrooms: 1,
                sqft: "800",
                neighborhood: "University Area",
                distanceToCampus: "0.3 miles",
                available: "Available Now",
                description: "Cozy 2-bedroom apartment perfect for students. Walking distance to BYU-I campus with modern amenities and utilities included.",
                amenities: ["Parking", "Laundry", "Internet", "Furnished"],
                contact: {
                    phone: "(208) 555-0101",
                    email: "rentals@example.com"
                },
                image: "property1.jpg"
            },
            {
                id: "2",
                address: "456 Student Lane, Rexburg, ID",
                price: "450",
                type: "rent",
                bedrooms: 1,
                bathrooms: 1,
                sqft: "600",
                neighborhood: "Campus Area",
                distanceToCampus: "0.5 miles",
                available: "June 1st",
                description: "Affordable studio apartment with all utilities included. Perfect for single students looking for convenience and value.",
                amenities: ["Utilities Included", "Furnished", "Parking", "Study Room"],
                contact: {
                    phone: "(208) 555-0102",
                    email: "housing@example.com"
                },
                image: "property2.jpg"
            },
            {
                id: "3",
                address: "789 Family Circle, Rexburg, ID",
                price: "285000",
                type: "buy",
                bedrooms: 3,
                bathrooms: 2,
                sqft: "1200",
                neighborhood: "Family District",
                distanceToCampus: "1.2 miles",
                available: "Available Now",
                description: "Beautiful 3-bedroom home perfect for families. Updated kitchen, large backyard, and quiet neighborhood setting.",
                amenities: ["Garage", "Backyard", "Updated Kitchen", "Storage"],
                contact: {
                    phone: "(208) 555-0103",
                    email: "realestate@example.com"
                },
                image: "property3.jpg"
            },
            {
                id: "4",
                address: "321 College Way, Rexburg, ID",
                price: "550",
                type: "rent",
                bedrooms: 2,
                bathrooms: 1.5,
                sqft: "750",
                neighborhood: "University Area",
                distanceToCampus: "0.4 miles",
                available: "July 15th",
                description: "Spacious 2-bedroom townhome with modern appliances. Great for roommates with separate bedrooms and study areas.",
                amenities: ["Dishwasher", "Air Conditioning", "Parking", "Patio"],
                contact: {
                    phone: "(208) 555-0104",
                    email: "properties@example.com"
                },
                image: "property4.jpg"
            },
            {
                id: "5",
                address: "654 Downtown Ave, Rexburg, ID",
                price: "195000",
                type: "buy",
                bedrooms: 2,
                bathrooms: 1,
                sqft: "900",
                neighborhood: "Downtown",
                distanceToCampus: "1.8 miles",
                available: "Available Now",
                description: "Charming downtown condo with historic character. Walking distance to shops and restaurants with modern updates throughout.",
                amenities: ["Historic Building", "Downtown Location", "Updated Flooring", "Storage"],
                contact: {
                    phone: "(208) 555-0105",
                    email: "downtown@example.com"
                },
                image: "property5.jpg"
            },
            {
                id: "6",
                address: "987 Countryside Dr, Rexburg, ID",
                price: "1100",
                type: "rent",
                bedrooms: 4,
                bathrooms: 3,
                sqft: "1600",
                neighborhood: "Countryside",
                distanceToCampus: "2.1 miles",
                available: "August 1st",
                description: "Large 4-bedroom house perfect for group living. Spacious kitchen, multiple bathrooms, and large common areas.",
                amenities: ["Large Kitchen", "Multiple Bathrooms", "Parking", "Yard", "Storage"],
                contact: {
                    phone: "(208) 555-0106",
                    email: "countryside@example.com"
                },
                image: "property6.jpg"
            },
            {
                id: "7",
                address: "147 Madison Ave, Rexburg, ID",
                price: "325000",
                type: "buy",
                bedrooms: 4,
                bathrooms: 2.5,
                sqft: "1800",
                neighborhood: "Madison District",
                distanceToCampus: "1.5 miles",
                available: "Available Now",
                description: "Stunning 4-bedroom family home with open floor plan. Master suite, finished basement, and beautiful landscaping.",
                amenities: ["Master Suite", "Finished Basement", "Landscaping", "2-Car Garage"],
                contact: {
                    phone: "(208) 555-0107",
                    email: "madison@example.com"
                },
                image: "property7.jpg"
            },
            {
                id: "8",
                address: "258 Pine Street, Rexburg, ID",
                price: "475",
                type: "rent",
                bedrooms: 1,
                bathrooms: 1,
                sqft: "550",
                neighborhood: "Pine District",
                distanceToCampus: "0.8 miles",
                available: "Available Now",
                description: "Cozy 1-bedroom apartment in quiet neighborhood. Perfect for single students who value peace and proximity to campus.",
                amenities: ["Quiet Location", "Parking", "Laundry Access", "Storage"],
                contact: {
                    phone: "(208) 555-0108",
                    email: "pine@example.com"
                },
                image: "property8.jpg"
            },
            {
                id: "9",
                address: "369 Oak Lane, Rexburg, ID",
                price: "750",
                type: "rent",
                bedrooms: 3,
                bathrooms: 2,
                sqft: "1100",
                neighborhood: "Oak District",
                distanceToCampus: "1.0 miles",
                available: "September 1st",
                description: "Spacious 3-bedroom duplex with private entrance. Great for small families or students who want extra space.",
                amenities: ["Private Entrance", "Yard", "Parking", "Washer/Dryer Hookups"],
                contact: {
                    phone: "(208) 555-0109",
                    email: "oak@example.com"
                },
                image: "property9.jpg"
            },
            {
                id: "10",
                address: "741 Elm Court, Rexburg, ID",
                price: "425000",
                type: "buy",
                bedrooms: 5,
                bathrooms: 3,
                sqft: "2200",
                neighborhood: "Elm District",
                distanceToCampus: "2.3 miles",
                available: "Available Now",
                description: "Luxurious 5-bedroom home with modern finishes throughout. Perfect for large families with multiple living areas and premium amenities.",
                amenities: ["Luxury Finishes", "Multiple Living Areas", "3-Car Garage", "Premium Kitchen"],
                contact: {
                    phone: "(208) 555-0110",
                    email: "elm@example.com"
                },
                image: "property10.jpg"
            },
            {
                id: "11",
                address: "852 Birch Way, Rexburg, ID",
                price: "380",
                type: "rent",
                bedrooms: 1,
                bathrooms: 1,
                sqft: "450",
                neighborhood: "Birch Area",
                distanceToCampus: "0.6 miles",
                available: "Available Now",
                description: "Affordable studio with efficient layout. Great for budget-conscious students who want to be close to campus.",
                amenities: ["Efficient Layout", "Close to Campus", "Parking", "Utilities Included"],
                contact: {
                    phone: "(208) 555-0111",
                    email: "birch@example.com"
                },
                image: "property11.jpg"
            },
            {
                id: "12",
                address: "963 Cedar Drive, Rexburg, ID",
                price: "850",
                type: "rent",
                bedrooms: 3,
                bathrooms: 2,
                sqft: "1250",
                neighborhood: "Cedar Heights",
                distanceToCampus: "1.4 miles",
                available: "October 1st",
                description: "Modern 3-bedroom apartment with upgraded appliances and fixtures. Excellent for students who want contemporary living.",
                amenities: ["Modern Appliances", "Air Conditioning", "Balcony", "Fitness Center Access"],
                contact: {
                    phone: "(208) 555-0112",
                    email: "cedar@example.com"
                },
                image: "property12.jpg"
            },
            {
                id: "13",
                address: "159 Maple Street, Rexburg, ID",
                price: "275000",
                type: "buy",
                bedrooms: 3,
                bathrooms: 2,
                sqft: "1350",
                neighborhood: "Maple District",
                distanceToCampus: "1.7 miles",
                available: "Available Now",
                description: "Well-maintained 3-bedroom home with recent updates. Perfect starter home with room to grow.",
                amenities: ["Recent Updates", "Fenced Yard", "Single-Car Garage", "Storage Shed"],
                contact: {
                    phone: "(208) 555-0113",
                    email: "maple@example.com"
                },
                image: "property13.jpg"
            },
            {
                id: "14",
                address: "267 Spruce Avenue, Rexburg, ID",
                price: "600",
                type: "rent",
                bedrooms: 2,
                bathrooms: 1,
                sqft: "850",
                neighborhood: "Spruce Valley",
                distanceToCampus: "0.9 miles",
                available: "Available Now",
                description: "Comfortable 2-bedroom with mountain views. Quiet neighborhood perfect for studying with easy campus access.",
                amenities: ["Mountain Views", "Quiet Neighborhood", "Parking", "Storage"],
                contact: {
                    phone: "(208) 555-0114",
                    email: "spruce@example.com"
                },
                image: "property14.jpg"
            },
            {
                id: "15",
                address: "483 Willow Road, Rexburg, ID",
                price: "365000",
                type: "buy",
                bedrooms: 4,
                bathrooms: 3,
                sqft: "1950",
                neighborhood: "Willow Creek",
                distanceToCampus: "2.0 miles",
                available: "Available Now",
                description: "Elegant 4-bedroom home with open concept design. Beautiful neighborhood with mature trees and friendly neighbors.",
                amenities: ["Open Concept", "Mature Trees", "2-Car Garage", "Deck"],
                contact: {
                    phone: "(208) 555-0115",
                    email: "willow@example.com"
                },
                image: "property15.jpg"
            }
        ];
    }
}