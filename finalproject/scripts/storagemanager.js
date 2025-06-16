// Storage Manager - handles local storage operations
// ES Module for managing client-side data persistence

export class StorageManager {
    constructor() {
        this.prefix = 'rexburg_home_finder_';
        this.isStorageAvailable = this.checkStorageAvailability();
        
        if (!this.isStorageAvailable) {
            this.memoryStorage = new Map();
        }
    }

    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Get full key with prefix
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    // Set item in storage
    setItem(key, value) {
        try {
            const fullKey = this.getKey(key);
            const serializedValue = JSON.stringify(value);
            
            if (this.isStorageAvailable) {
                localStorage.setItem(fullKey, serializedValue);
            } else {
                this.memoryStorage.set(fullKey, serializedValue);
            }
            
            return true;
            
        } catch (error) {
            return false;
        }
    }

    // Get item from storage
    getItem(key) {
        try {
            const fullKey = this.getKey(key);
            let serializedValue;
            
            if (this.isStorageAvailable) {
                serializedValue = localStorage.getItem(fullKey);
            } else {
                serializedValue = this.memoryStorage.get(fullKey);
            }
            
            if (serializedValue === null || serializedValue === undefined) {
                return null;
            }
            
            return JSON.parse(serializedValue);
            
        } catch (error) {
            return null;
        }
    }

    // Remove item from storage
    removeItem(key) {
        try {
            const fullKey = this.getKey(key);
            
            if (this.isStorageAvailable) {
                localStorage.removeItem(fullKey);
            } else {
                this.memoryStorage.delete(fullKey);
            }
            
            return true;
            
        } catch (error) {
            return false;
        }
    }

    // Clear all app-related storage
    clear() {
        try {
            if (this.isStorageAvailable) {
                // Remove only keys with our prefix
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                this.memoryStorage.clear();
            }
            
            return true;
            
        } catch (error) {
            return false;
        }
    }

    // Get all keys with our prefix
    getKeys() {
        try {
            let keys = [];
            
            if (this.isStorageAvailable) {
                keys = Object.keys(localStorage)
                    .filter(key => key.startsWith(this.prefix))
                    .map(key => key.replace(this.prefix, ''));
            } else {
                keys = Array.from(this.memoryStorage.keys())
                    .map(key => key.replace(this.prefix, ''));
            }
            
            return keys;
            
        } catch (error) {
            return [];
        }
    }

    // User preferences management
    saveUserPreferences(preferences) {
        return this.setItem('user_preferences', preferences);
    }

    getUserPreferences() {
        const defaultPreferences = {
            sortBy: 'price-low',
            viewMode: 'grid',
            resultsPerPage: 6,
            savedSearches: [],
            favoriteProperties: [],
            viewedProperties: []
        };
        
        const saved = this.getItem('user_preferences');
        return saved ? { ...defaultPreferences, ...saved } : defaultPreferences;
    }

    // Search history management
    addSearchToHistory(searchFilters) {
        try {
            const history = this.getSearchHistory();
            const timestamp = new Date().toISOString();
            const searchEntry = {
                id: `search_${Date.now()}`,
                filters: searchFilters,
                timestamp: timestamp
            };
            
            // Add to beginning of array and limit to 10 searches
            history.unshift(searchEntry);
            const limitedHistory = history.slice(0, 10);
            
            return this.setItem('search_history', limitedHistory);
            
        } catch (error) {
            console.error('Error adding search to history:', error);
            return false;
        }
    }

    getSearchHistory() {
        return this.getItem('search_history') || [];
    }

    clearSearchHistory() {
        return this.removeItem('search_history');
    }

    // Favorite properties management
    addFavoriteProperty(propertyId) {
        try {
            const favorites = this.getFavoriteProperties();
            
            if (!favorites.includes(propertyId)) {
                favorites.push(propertyId);
                this.setItem('favorite_properties', favorites);
                return true;
            }
            
            return false; // Already in favorites
            
        } catch (error) {
            return false;
        }
    }

    removeFavoriteProperty(propertyId) {
        try {
            const favorites = this.getFavoriteProperties();
            const index = favorites.indexOf(propertyId);
            
            if (index > -1) {
                favorites.splice(index, 1);
                this.setItem('favorite_properties', favorites);
                return true;
            }
            
            return false; // Not in favorites
            
        } catch (error) {
            return false;
        }
    }

    getFavoriteProperties() {
        return this.getItem('favorite_properties') || [];
    }

    isFavoriteProperty(propertyId) {
        const favorites = this.getFavoriteProperties();
        return favorites.includes(propertyId);
    }

    // Viewed properties tracking
    addViewedProperty(propertyId) {
        try {
            const viewed = this.getViewedProperties();
            const timestamp = new Date().toISOString();
            
            // Remove if already exists to update timestamp
            const existingIndex = viewed.findIndex(item => item.propertyId === propertyId);
            if (existingIndex > -1) {
                viewed.splice(existingIndex, 1);
            }
            
            // Add to beginning of array
            viewed.unshift({
                propertyId: propertyId,
                timestamp: timestamp
            });
            
            // Limit to 20 viewed properties
            const limitedViewed = viewed.slice(0, 20);
            
            return this.setItem('viewed_properties', limitedViewed);
            
        } catch (error) {
            return false;
        }
    }

    getViewedProperties() {
        return this.getItem('viewed_properties') || [];
    }

    getRecentlyViewedPropertyIds(limit = 10) {
        const viewed = this.getViewedProperties();
        return viewed.slice(0, limit).map(item => item.propertyId);
    }

    // Saved searches management
    saveSearch(name, filters) {
        try {
            const savedSearches = this.getSavedSearches();
            const searchId = `search_${Date.now()}`;
            
            const newSearch = {
                id: searchId,
                name: name,
                filters: filters,
                createdAt: new Date().toISOString()
            };
            
            savedSearches.push(newSearch);
            
            return this.setItem('saved_searches', savedSearches);
            
        } catch (error) {
            return false;
        }
    }

    getSavedSearches() {
        return this.getItem('saved_searches') || [];
    }

    removeSavedSearch(searchId) {
        try {
            const savedSearches = this.getSavedSearches();
            const filteredSearches = savedSearches.filter(search => search.id !== searchId);
            
            return this.setItem('saved_searches', filteredSearches);
            
        } catch (error) {
            return false;
        }
    }

    // Calculator history management
    addCalculatorResult(type, inputs, result) {
        try {
            const history = this.getCalculatorHistory();
            const entry = {
                id: `calc_${Date.now()}`,
                type: type, // 'mortgage' or 'rent'
                inputs: inputs,
                result: result,
                timestamp: new Date().toISOString()
            };
            
            history.unshift(entry);
            const limitedHistory = history.slice(0, 15); // Keep last 15 calculations
            
            return this.setItem('calculator_history', limitedHistory);
            
        } catch (error) {
            return false;
        }
    }

    getCalculatorHistory() {
        return this.getItem('calculator_history') || [];
    }

    clearCalculatorHistory() {
        return this.removeItem('calculator_history');
    }

    // Storage usage statistics
    getStorageStats() {
        try {
            const keys = this.getKeys();
            let totalSize = 0;
            const itemSizes = {};
            
            keys.forEach(key => {
                const value = this.getItem(key);
                const size = JSON.stringify(value).length;
                totalSize += size;
                itemSizes[key] = size;
            });
            
            return {
                totalItems: keys.length,
                totalSize: totalSize,
                itemSizes: itemSizes,
                storageType: this.isStorageAvailable ? 'localStorage' : 'memory'
            };
            
        } catch (error) {
            return null;
        }
    }

    // Export all data
    exportData() {
        try {
            const keys = this.getKeys();
            const data = {};
            
            keys.forEach(key => {
                data[key] = this.getItem(key);
            });
            
            return {
                exportDate: new Date().toISOString(),
                version: '1.0',
                data: data
            };
            
        } catch (error) {
            return null;
        }
    }

    // Import data
    importData(exportedData) {
        try {
            if (!exportedData || !exportedData.data) {
                throw new Error('Invalid export data format');
            }
            
            const { data } = exportedData;
            
            Object.keys(data).forEach(key => {
                this.setItem(key, data[key]);
            });
            
            return true;
            
        } catch (error) {
            return false;
        }
    }
}