// Storage manager for handling local storage operations
export class StorageManager {
    constructor() {
        this.prefix = 'rexburgHomeFinder_';
        this.isSupported = this.checkStorageSupport();
    }

    checkStorageSupport() {
        try {
            const test = 'storageTest';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('Local storage not supported');
            return false;
        }
    }

    // Get item from storage
    getItem(key) {
        if (!this.isSupported) return null;
        
        try {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            
            if (item === null) return null;
            
            // Try to parse JSON, return as string if parsing fails
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    }

    // Set item in storage
    setItem(key, value) {
        if (!this.isSupported) return false;
        
        try {
            const fullKey = this.prefix + key;
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(fullKey, stringValue);
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            return false;
        }
    }

    // Remove item from storage
    removeItem(key) {
        if (!this.isSupported) return false;
        
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    }

    // Clear all app data from storage
    clear() {
        if (!this.isSupported) return false;
        
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Get all keys with our prefix
    getAllKeys() {
        if (!this.isSupported) return [];
        
        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    // Array operations for storing lists
    addToArray(key, value) {
        const existingArray = this.getItem(key) || [];
        
        if (!Array.isArray(existingArray)) {
            console.warn(`Item with key '${key}' is not an array`);
            return false;
        }
        
        // Avoid duplicates for primitive values
        if (typeof value !== 'object' && existingArray.includes(value)) {
            return true; // Already exists, no need to add
        }
        
        existingArray.push(value);
        return this.setItem(key, existingArray);
    }

    removeFromArray(key, value) {
        const existingArray = this.getItem(key);
        
        if (!Array.isArray(existingArray)) {
            console.warn(`Item with key '${key}' is not an array`);
            return false;
        }
        
        const filteredArray = existingArray.filter(item => {
            if (typeof item === 'object' && typeof value === 'object') {
                return JSON.stringify(item) !== JSON.stringify(value);
            }
            return item !== value;
        });
        
        return this.setItem(key, filteredArray);
    }

    // User preferences management
    setUserPreference(key, value) {
        const preferences = this.getItem('userPreferences') || {};
        preferences[key] = value;
        return this.setItem('userPreferences', preferences);
    }

    getUserPreference(key, defaultValue = null) {
        const preferences = this.getItem('userPreferences') || {};
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }

    // Search history management
    addSearchHistory(searchTerms) {
        const history = this.getItem('searchHistory') || [];
        
        // Create search entry with timestamp
        const searchEntry = {
            terms: searchTerms,
            timestamp: Date.now(),
            id: this.generateId()
        };
        
        // Add to beginning of array
        history.unshift(searchEntry);
        
        // Keep only last 20 searches
        const trimmedHistory = history.slice(0, 20);
        
        return this.setItem('searchHistory', trimmedHistory);
    }

    getSearchHistory(limit = 10) {
        const history = this.getItem('searchHistory') || [];
        return history.slice(0, limit);
    }

    clearSearchHistory() {
        return this.setItem('searchHistory', []);
    }

    // Favorites management
    addFavorite(propertyId, propertyData = null) {
        const favorites = this.getItem('favorites') || [];
        
        const favoriteEntry = {
            propertyId: propertyId,
            timestamp: Date.now(),
            data: propertyData
        };
        
        // Check if already favorited
        const exists = favorites.some(fav => fav.propertyId === propertyId);
        if (exists) {
            return true;
        }
        
        favorites.push(favoriteEntry);
        return this.setItem('favorites', favorites);
    }

    removeFavorite(propertyId) {
        const favorites = this.getItem('favorites') || [];
        const filteredFavorites = favorites.filter(fav => fav.propertyId !== propertyId);
        return this.setItem('favorites', filteredFavorites);
    }

    getFavorites() {
        return this.getItem('favorites') || [];
    }

    isFavorite(propertyId) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.propertyId === propertyId);
    }

    // Recently viewed properties
    addRecentlyViewed(propertyId, propertyData = null) {
        const recentlyViewed = this.getItem('recentlyViewed') || [];
        
        // Remove if already exists to avoid duplicates
        const filtered = recentlyViewed.filter(item => item.propertyId !== propertyId);
        
        const viewEntry = {
            propertyId: propertyId,
            timestamp: Date.now(),
            data: propertyData
        };
        
        // Add to beginning
        filtered.unshift(viewEntry);
        
        // Keep only last 15 viewed items
        const trimmed = filtered.slice(0, 15);
        
        return this.setItem('recentlyViewed', trimmed);
    }

    getRecentlyViewed(limit = 10) {
        const recentlyViewed = this.getItem('recentlyViewed') || [];
        return recentlyViewed.slice(0, limit);
    }

    // Contact form data backup (for recovery)
    saveFormData(formId, formData) {
        const formBackups = this.getItem('formBackups') || {};
        formBackups[formId] = {
            data: formData,
            timestamp: Date.now()
        };
        return this.setItem('formBackups', formBackups);
    }

    getFormData(formId) {
        const formBackups = this.getItem('formBackups') || {};
        return formBackups[formId] ? formBackups[formId].data : null;
    }

    clearFormData(formId) {
        const formBackups = this.getItem('formBackups') || {};
        if (formBackups[formId]) {
            delete formBackups[formId];
            return this.setItem('formBackups', formBackups);
        }
        return true;
    }

    // Analytics/usage tracking
    incrementCounter(key) {
        const currentValue = this.getItem(key) || 0;
        return this.setItem(key, currentValue + 1);
    }

    getCounter(key) {
        return this.getItem(key) || 0;
    }

    // Session management
    setSessionData(key, value) {
        const sessionData = this.getItem('sessionData') || {};
        sessionData[key] = value;
        return this.setItem('sessionData', sessionData);
    }

    getSessionData(key) {
        const sessionData = this.getItem('sessionData') || {};
        return sessionData[key];
    }

    clearSessionData() {
        return this.setItem('sessionData', {});
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getStorageSize() {
        if (!this.isSupported) return 0;
        
        let total = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                total += localStorage.getItem(key).length;
            }
        });
        
        return total;
    }

    exportData() {
        if (!this.isSupported) return null;
        
        const data = {};
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            data[key] = this.getItem(key);
        });
        
        return {
            version: '1.0',
            timestamp: Date.now(),
            data: data
        };
    }

    importData(exportedData) {
        if (!exportedData || !exportedData.data) {
            console.error('Invalid import data format');
            return false;
        }
        
        try {
            Object.keys(exportedData.data).forEach(key => {
                this.setItem(key, exportedData.data[key]);
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clean up old data
    cleanupOldData(daysOld = 30) {
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        // Clean old search history
        const searchHistory = this.getItem('searchHistory') || [];
        const filteredHistory = searchHistory.filter(entry => entry.timestamp > cutoffTime);
        this.setItem('searchHistory', filteredHistory);
        
        // Clean old recently viewed
        const recentlyViewed = this.getItem('recentlyViewed') || [];
        const filteredViewed = recentlyViewed.filter(entry => entry.timestamp > cutoffTime);
        this.setItem('recentlyViewed', filteredViewed);
        
        // Clean old form backups
        const formBackups = this.getItem('formBackups') || {};
        const filteredBackups = {};
        Object.keys(formBackups).forEach(formId => {
            if (formBackups[formId].timestamp > cutoffTime) {
                filteredBackups[formId] = formBackups[formId];
            }
        });
        this.setItem('formBackups', filteredBackups);
        
        return true;
    }
}