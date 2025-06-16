// properties.js - Property service module with data fetching and processing
class PropertyService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Fetch properties with caching
    async fetchProperties() {
        const cacheKey = 'properties';
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch('data/properties.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch properties: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            this.cache.set(cacheKey, {
                data: data.properties,
                timestamp: Date.now()
            });
            
            return data.properties;
        } catch (error) {
            console.error('PropertyService: Error fetching properties:', error);
            throw error;
        }
    }

    // Filter properties by criteria
    filterProperties(properties, filters) {
        return properties.filter(property => {
            // Type filter
            if (filters.type && property.type !== filters.type) {
                return false;
            }

            // Bedrooms filter
            if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) {
                return false;
            }

            // Price range filter
            if (filters.minPrice && property.price < parseInt(filters.minPrice)) {
                return false;
            }
            if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) {
                return false;
            }

            // Square footage filter
            if (filters.minSqft && property.sqft < parseInt(filters.minSqft)) {
                return false;
            }

            // Neighborhood filter
            if (filters.neighborhood && property.neighborhood !== filters.neighborhood) {
                return false;
            }

            // Amenities filter
            if (filters.amenities && filters.amenities.length > 0) {
                const hasRequiredAmenities = filters.amenities.every(amenity => 
                    property.amenities?.includes(amenity)
                );
                if (!hasRequiredAmenities) {
                    return false;
                }
            }

            return true;
        });
    }

    // Sort properties by different criteria
    sortProperties(properties, sortBy, sortOrder = 'asc') {
        const sorted = [...properties].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'bedrooms':
                    aValue = a.bedrooms;
                    bValue = b.bedrooms;
                    break;
                case 'sqft':
                    aValue = a.sqft;
                    bValue = b.sqft;
                    break;
                case 'distance':
                    // Convert distance string to number for sorting
                    aValue = parseFloat(a.distanceToCampus);
                    bValue = parseFloat(b.distanceToCampus);
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'desc') {
                return bValue - aValue;
            }
            return aValue - bValue;
        });

        return sorted;
    }

    // Search properties by text
    searchProperties(properties, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return properties;
        }

        const term = searchTerm.toLowerCase().trim();
        
        return properties.filter(property => {
            return (
                property.address.toLowerCase().includes(term) ||
                property.description.toLowerCase().includes(term) ||
                property.neighborhood?.toLowerCase().includes(term) ||
                property.amenities?.some(amenity => 
                    amenity.toLowerCase().includes(term)
                )
            );
        });
    }

    // Get properties by neighborhood
    getPropertiesByNeighborhood(properties, neighborhood) {
        return properties.filter(property => 
            property.neighborhood === neighborhood
        );
    }

    // Get property statistics
    getPropertyStats(properties) {
        if (properties.length === 0) {
            return {
                totalProperties: 0,
                averagePrice: 0,
                priceRange: { min: 0, max: 0 },
                averageSqft: 0,
                typeDistribution: { rent: 0, buy: 0 },
                bedroomDistribution: {}
            };
        }

        const prices = properties.map(p => p.price);
        const sqfts = properties.map(p => p.sqft);
        
        // Calculate bedroom distribution
        const bedroomDistribution = properties.reduce((acc, property) => {
            const bedrooms = property.bedrooms.toString();
            acc[bedrooms] = (acc[bedrooms] || 0) + 1;
            return acc;
        }, {});

        // Calculate type distribution
        const typeDistribution = properties.reduce((acc, property) => {
            acc[property.type] = (acc[property.type] || 0) + 1;
            return acc;
        }, { rent: 0, buy: 0 });

        return {
            totalProperties: properties.length,
            averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            priceRange: {
                min: Math.min(...prices),
                max: Math.max(...prices)
            },
            averageSqft: Math.round(sqfts.reduce((a, b) => a + b, 0) / sqfts.length),
            typeDistribution,
            bedroomDistribution
        };
    }

    // Get featured properties (random selection)
    getFeaturedProperties(properties, count = 6) {
        const shuffled = [...properties].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Validate property data
    validateProperty(property) {
        const required = ['id', 'address', 'price', 'bedrooms', 'bathrooms', 'sqft', 'type'];
        const missing = required.filter(field => !property[field]);
        
        if (missing.length > 0) {
            throw new Error(`Property missing required fields: ${missing.join(', ')}`);
        }

        if (!['rent', 'buy'].includes(property.type)) {
            throw new Error('Property type must be "rent" or "buy"');
        }

        if (property.price <= 0) {
            throw new Error('Property price must be greater than 0');
        }

        return true;
    }

    // Format property price for display
    formatPrice(property) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        const price = formatter.format(property.price);
        return property.type === 'rent' ? `${price}/month` : price;
    }

    // Calculate property affordability
    calculateAffordability(property, monthlyIncome, maxPercentage = 30) {
        const maxAffordable = (monthlyIncome * maxPercentage) / 100;
        const monthlyPayment = property.type === 'rent' ? 
            property.price : 
            this.estimateMonthlyMortgage(property.price);

        return {
            isAffordable: monthlyPayment <= maxAffordable,
            monthlyPayment,
            maxAffordable,
            percentageOfIncome: (monthlyPayment / monthlyIncome) * 100
        };
    }

    // Estimate monthly mortgage payment
    estimateMonthlyMortgage(price, downPayment = 0.2, interestRate = 0.065, years = 30) {
        const principal = price * (1 - downPayment);
        const monthlyRate = interestRate / 12;
        const payments = years * 12;

        if (monthlyRate === 0) {
            return principal / payments;
        }

        const monthlyPayment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
            (Math.pow(1 + monthlyRate, payments) - 1);

        return Math.round(monthlyPayment);
    }

    // Get similar properties
    getSimilarProperties(targetProperty, allProperties, limit = 4) {
        return allProperties
            .filter(property => property.id !== targetProperty.id)
            .map(property => ({
                ...property,
                similarity: this.calculateSimilarity(targetProperty, property)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    // Calculate similarity score between properties
    calculateSimilarity(prop1, prop2) {
        let score = 0;

        // Same type (rent/buy)
        if (prop1.type === prop2.type) score += 30;

        // Similar price (within 20%)
        const priceDiff = Math.abs(prop1.price - prop2.price) / prop1.price;
        if (priceDiff < 0.2) score += 25;

        // Same bedrooms
        if (prop1.bedrooms === prop2.bedrooms) score += 20;

        // Similar square footage (within 20%)
        const sqftDiff = Math.abs(prop1.sqft - prop2.sqft) / prop1.sqft;
        if (sqftDiff < 0.2) score += 15;

        // Same neighborhood
        if (prop1.neighborhood === prop2.neighborhood) score += 10;

        return score;
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache info
    getCacheInfo() {
        const info = {};
        for (let [key, value] of this.cache.entries()) {
            info[key] = {
                timestamp: value.timestamp,
                age: Date.now() - value.timestamp,
                expired: (Date.now() - value.timestamp) > this.cacheTimeout
            };
        }
        return info;
    }
}

// Utility functions for property data processing
export const PropertyUtils = {
    // Generate property slug for URLs
    generateSlug(property) {
        return property.address
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Extract neighborhood from address
    extractNeighborhood(address) {
        // Simple extraction logic - in real app would use more sophisticated parsing
        const parts = address.split(',');
        return parts[parts.length - 2]?.trim() || 'Unknown';
    },

    // Calculate distance between two coordinates
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in miles
    },

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    // Format address for display
    formatAddress(address) {
        return address.replace(/,\s*/g, ', ').trim();
    },

    // Generate property summary
    generateSummary(property) {
        const type = property.type === 'rent' ? 'rental' : 'sale';
        return `${property.bedrooms} bedroom, ${property.bathrooms} bathroom ${type} property with ${property.sqft} sq ft in ${property.neighborhood || 'Rexburg'}.`;
    }
};

// Property constants
export const PropertyConstants = {
    TYPES: {
        RENT: 'rent',
        BUY: 'buy'
    },
    
    SORT_OPTIONS: {
        PRICE_LOW: 'price_asc',
        PRICE_HIGH: 'price_desc',
        BEDROOMS: 'bedrooms_asc',
        SQFT: 'sqft_desc',
        DISTANCE: 'distance_asc'
    },

    AMENITIES: [
        'Parking',
        'Laundry',
        'Internet',
        'Air Conditioning',
        'Dishwasher',
        'Microwave',
        'Furnished',
        'Pet Friendly',
        'Gym Access',
        'Pool',
        'Study Rooms',
        'Bike Storage'
    ],

    NEIGHBORHOODS: [
        'Campus Adjacent',
        'Downtown',
        'Westside',
        'Eastside',
        'South Rexburg'
    ]
};

export { PropertyService };