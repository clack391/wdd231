// Form response page functionality
import { StorageManager } from './modules/storage-manager.js';

class FormResponseApp {
    constructor() {
        this.storageManager = new StorageManager();
        this.submittedData = {};
        
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Extract and display form data from URL parameters
        this.extractFormData();
        this.displayFormData();
        
        // Track form submission
        this.trackSubmission();
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
    }

    extractFormData() {
        // Get URL search parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Convert URLSearchParams to object
        for (let [key, value] of urlParams.entries()) {
            this.submittedData[key] = value;
        }
        
        // If no data in URL, check if there's saved form data
        if (Object.keys(this.submittedData).length === 0) {
            const savedData = this.storageManager.getFormData('contactForm');
            if (savedData) {
                this.submittedData = savedData;
            }
        }
    }

    displayFormData() {
        const dataDisplay = document.getElementById('submittedData');
        if (!dataDisplay) return;

        if (Object.keys(this.submittedData).length === 0) {
            dataDisplay.innerHTML = `
                <div class="data-item">
                    <span class="data-label">No form data available</span>
                    <span class="data-value">Please ensure you submitted the form correctly</span>
                </div>
            `;
            return;
        }

        const dataItems = Object.entries(this.submittedData)
            .filter(([key, value]) => value && value.trim() !== '') // Filter out empty values
            .map(([key, value]) => this.createDataItem(key, value));

        dataDisplay.innerHTML = dataItems.join('');
        
        // Store this submission for potential follow-up
        this.storeSubmission();
    }

    createDataItem(key, value) {
        const label = this.formatLabel(key);
        const formattedValue = this.formatValue(key, value);
        
        return `
            <div class="data-item">
                <span class="data-label">${label}:</span>
                <span class="data-value">${formattedValue}</span>
            </div>
        `;
    }

    formatLabel(key) {
        // Convert camelCase or snake_case to proper labels
        const labelMap = {
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'email': 'Email Address',
            'phone': 'Phone Number',
            'helpType': 'Type of Help Needed',
            'message': 'Message',
            'propertyType': 'Property Type',
            'priceRange': 'Price Range',
            'bedrooms': 'Number of Bedrooms'
        };
        
        return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    }

    formatValue(key, value) {
        // Format specific values for better display
        switch (key) {
            case 'email':
                return `<a href="mailto:${value}">${value}</a>`;
            case 'phone':
                return `<a href="tel:${value}">${value}</a>`;
            case 'helpType':
                return this.formatHelpType(value);
            case 'priceRange':
                return this.formatPriceRange(value);
            case 'bedrooms':
                return this.formatBedrooms(value);
            case 'message':
                // Truncate long messages and add expand functionality
                if (value.length > 100) {
                    return `
                        <span class="message-preview">${value.substring(0, 100)}...</span>
                        <button class="btn-expand" onclick="this.previousElementSibling.textContent='${value.replace(/'/g, "\\'")}'; this.style.display='none';">Show Full Message</button>
                    `;
                }
                return value;
            default:
                return this.escapeHtml(value);
        }
    }

    formatHelpType(value) {
        const helpTypes = {
            'buying': 'I want to buy a home',
            'renting': "I'm looking for a rental",
            'selling': 'I want to sell/list my property',
            'general': 'General questions'
        };
        return helpTypes[value] || value;
    }

    formatPriceRange(value) {
        if (value === 'all') return 'Any Price';
        const priceRanges = {
            '500': 'Under $500',
            '800': 'Under $800',
            '1200': 'Under $1,200',
            '200000': 'Under $200,000',
            '300000': 'Under $300,000'
        };
        return priceRanges[value] || `Under $${parseInt(value).toLocaleString()}`;
    }

    formatBedrooms(value) {
        if (value === 'all') return 'Any number of bedrooms';
        return `${value}+ bedrooms`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    storeSubmission() {
        // Store submission with timestamp for potential follow-up
        const submission = {
            data: this.submittedData,
            timestamp: Date.now(),
            id: this.generateSubmissionId()
        };
        
        this.storageManager.addToArray('formSubmissions', submission);
        
        // Also update user preferences based on submission
        if (this.submittedData.helpType) {
            this.storageManager.setUserPreference('lastHelpType', this.submittedData.helpType);
        }
        
        if (this.submittedData.email) {
            this.storageManager.setUserPreference('userEmail', this.submittedData.email);
        }
    }

    trackSubmission() {
        // Track form submission analytics
        this.storageManager.incrementCounter('formSubmissions');
        this.storageManager.incrementCounter('totalPageViews');
        
        // Track submission by help type
        if (this.submittedData.helpType) {
            this.storageManager.incrementCounter(`helpType_${this.submittedData.helpType}`);
        }
        
        // Set user engagement flags
        this.storageManager.setUserPreference('hasSubmittedForm', true);
        this.storageManager.setUserPreference('lastFormSubmission', Date.now());
    }

    generateSubmissionId() {
        return 'sub_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Method to show contact suggestions based on help type
    showContactSuggestions() {
        const helpType = this.submittedData.helpType;
        if (!helpType) return;

        const suggestions = this.getContactSuggestions(helpType);
        if (suggestions.length === 0) return;

        const suggestionsHtml = `
            <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-light); border-radius: var(--radius);">
                <h3>Recommended Next Steps</h3>
                <p>Based on your interest in ${this.formatHelpType(helpType).toLowerCase()}, here are some helpful resources:</p>
                <ul style="margin-top: 1rem;">
                    ${suggestions.map(suggestion => `<li style="margin-bottom: 0.5rem;">${suggestion}</li>`).join('')}
                </ul>
            </div>
        `;

        const responseCard = document.querySelector('.response-card');
        if (responseCard) {
            responseCard.insertAdjacentHTML('beforeend', suggestionsHtml);
        }
    }

    getContactSuggestions(helpType) {
        const suggestions = {
            'buying': [
                'Get pre-approved for a mortgage to strengthen your offers',
                'Browse our <a href="index.html">property search</a> to find homes in your budget',
                'Read our first-time buyer guide in the resources section',
                'Contact a local real estate agent from our recommended services'
            ],
            'renting': [
                'Check our <a href="neighborhoods.html">neighborhood guide</a> to find the best area for you',
                'Use our rent affordability calculator to determine your budget',
                'Start searching for properties 2-3 months before you need to move',
                'Prepare your rental application documents early'
            ],
            'selling': [
                'Research recent comparable sales in your neighborhood',
                'Consider getting a pre-listing home inspection',
                'Contact our recommended real estate agents for a market analysis',
                'Prepare your home for showings with staging and repairs'
            ],
            'general': [
                'Explore our <a href="resources.html">resources section</a> for comprehensive guides',
                'Use our calculators to understand financing options',
                'Browse different neighborhoods to understand the local market',
                'Feel free to contact us again with more specific questions'
            ]
        };

        return suggestions[helpType] || [];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FormResponseApp();
    
    // Show contact suggestions after a delay
    setTimeout(() => {
        app.showContactSuggestions();
    }, 1000);
});