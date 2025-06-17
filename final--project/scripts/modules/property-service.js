// Property service for fetching and managing property data
export class PropertyService {
    constructor() {
        this.dataUrl = 'data/properties.json';
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    async getProperties() {
        try {
            // Check cache first
            if (this.isDataCached()) {
                return this.cache;
            }

            // Fetch from external source or local JSON
            const properties = await this.fetchProperties();
            
            // Cache the data
            this.cache = properties;
            this.cacheTimestamp = Date.now();
            
            return properties;
        } catch (error) {
            console.error('Error fetching properties:', error);
            // Return fallback data if fetch fails
            return this.getFallbackData();
        }
    }

    async fetchProperties() {
        try {
            const response = await fetch(this.dataUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data.properties)) {
                throw new Error('Invalid data format: properties array not found');
            }
            
            return data.properties;
        } catch (error) {
            // If local JSON fails, try to fetch from a public API
            return await this.fetchFromAlternativeSource();
        }
    }

    async fetchFromAlternativeSource() {
        // This would typically be a real estate API
        // For demonstration, we'll use a placeholder API and transform the data
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=20');
            
            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }
            
            const photos = await response.json();
            
            // Transform API data into property format
            return this.transformApiDataToProperties(photos);
        } catch (error) {
            console.error('Alternative API fetch failed:', error);
            throw error;
        }
    }

    transformApiDataToProperties(apiData) {
        return apiData.map((item, index) => {
            const isRental = index % 3 === 0; // Mix of rentals and sales
            const basePrice = isRental ? 
                Math.floor(Math.random() * 1200) + 400 : // Rent: $400-1600
                Math.floor(Math.random() * 200000) + 150000; // Sale: $150k-350k
            
            return {
                id: item.id,
                title: `Property ${item.id}`,
                type: isRental ? 'rent' : 'buy',
                price: basePrice,
                address: this.generateAddress(index),
                bedrooms: Math.floor(Math.random() * 4) + 1,
                bathrooms: Math.floor(Math.random() * 3) + 1,
                sqft: Math.floor(Math.random() * 1000) + 800,
                image: item.thumbnailUrl,
                distanceToCampus: this.generateDistance(),
                description: this.generateDescription(isRental),
                features: this.generateFeatures(),
                contact: {
                    phone: '(208) 555-' + String(Math.floor(Math.random() * 9000) + 1000),
                    email: `agent${index + 1}@rexburghomes.com`
                },
                yearBuilt: Math.floor(Math.random() * 30) + 1995,
                parking: Math.floor(Math.random() * 3) + 1,
                petFriendly: Math.random() > 0.5,
                furnished: isRental && Math.random() > 0.7
            };
        });
    }

    generateAddress(index) {
        const streets = [
            'University Blvd', 'Campus Drive', 'Viking Drive', 'Stadium Way',
            'Porter Park Rd', 'Main Street', 'Center Street', 'First East',
            'Second West', 'Third North', 'College Avenue', 'Yellowstone Hwy'
        ];
        
        const streetIndex = index % streets.length;
        const number = Math.floor(Math.random() * 999) + 100;
        
        return `${number} ${streets[streetIndex]}, Rexburg, ID 83440`;
    }

    generateDistance() {
        const distances = ['0.2 mi', '0.5 mi', '0.8 mi', '1.2 mi', '1.5 mi', '2.0 mi'];
        return distances[Math.floor(Math.random() * distances.length)];
    }

    generateDescription(isRental) {
        const rentalDescriptions = [
            'Comfortable student housing close to BYU-I campus. Perfect for students looking for affordable living.',
            'Modern apartment with updated appliances and great location near campus amenities.',
            'Cozy rental home in quiet neighborhood, ideal for small families or graduate students.',
            'Spacious student apartment with study areas and easy campus access.'
        ];
        
        const saleDescriptions = [
            'Beautiful family home in established Rexburg neighborhood with mature landscaping.',
            'Well-maintained property perfect for first-time homebuyers or investors.',
            'Charming home with modern updates and great potential for customization.',
            'Solid construction home in desirable area close to schools and shopping.'
        ];
        
        const descriptions = isRental ? rentalDescriptions : saleDescriptions;
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    generateFeatures() {
        const allFeatures = [
            'Air conditioning', 'Washer/dryer hookups', 'Dishwasher', 'Garage',
            'Hardwood floors', 'Updated kitchen', 'Fenced yard', 'Fireplace',
            'Walk-in closets', 'Ceiling fans', 'Storage space', 'Patio/deck',
            'Garden space', 'Close to bus stop', 'Bike storage', 'Internet ready'
        ];
        
        // Return 4-6 random features
        const numFeatures = Math.floor(Math.random() * 3) + 4;
        const shuffled = allFeatures.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numFeatures);
    }

    isDataCached() {
        return this.cache && 
               this.cacheTimestamp && 
               (Date.now() - this.cacheTimestamp) < this.cacheExpiry;
    }

    getFallbackData() {
        // Fallback data in case all fetching methods fail
        return [
            {
                id: 1,
                title: 'Campus View Apartment',
                type: 'rent',
                price: 650,
                address: '123 University Blvd, Rexburg, ID 83440',
                bedrooms: 2,
                bathrooms: 1,
                sqft: 900,
                image: 'images/property-placeholder.jpg',
                distanceToCampus: '0.3 mi',
                description: 'Modern apartment close to BYU-I campus with all amenities.',
                features: ['Air conditioning', 'Dishwasher', 'Laundry hookups'],
                contact: {
                    phone: '(208) 555-0123',
                    email: 'agent@rexburghomes.com'
                }
            },
            {
                id: 2,
                title: 'Family Home Near Campus',
                type: 'buy',
                price: 225000,
                address: '456 Campus Drive, Rexburg, ID 83440',
                bedrooms: 3,
                bathrooms: 2,
                sqft: 1200,
                image: 'images/property-placeholder.jpg',
                distanceToCampus: '0.8 mi',
                description: 'Beautiful family home in quiet neighborhood.',
                features: ['Garage', 'Fenced yard', 'Updated kitchen'],
                contact: {
                    phone: '(208) 555-0124',
                    email: 'sales@rexburghomes.com'
                }
            }
        ];
    }

    // Additional utility methods for property management
    async getPropertyById(id) {
        try {
            const properties = await this.getProperties();
            return properties.find(property => property.id === parseInt(id));
        } catch (error) {
            console.error('Error fetching property by ID:', error);
            return null;
        }
    }

    async getPropertiesByType(type) {
        try {
            const properties = await this.getProperties();
            return properties.filter(property => property.type === type);
        } catch (error) {
            console.error('Error fetching properties by type:', error);
            return [];
        }
    }

    async getPropertiesInPriceRange(minPrice, maxPrice) {
        try {
            const properties = await this.getProperties();
            return properties.filter(property => 
                property.price >= minPrice && property.price <= maxPrice
            );
        } catch (error) {
            console.error('Error fetching properties in price range:', error);
            return [];
        }
    }

    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }
}