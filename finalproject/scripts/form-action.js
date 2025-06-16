// Form Action - handles form submission display and data processing
// ES Module for form response functionality

import { StorageManager } from './storagemanager.js';

class FormActionHandler {
    constructor() {
        this.storageManager = new StorageManager();
        this.init();
    }

    init() {
        try {
            this.displaySubmissionData();
            this.initActionButtons();
            console.log('Form action handler initialized');
        } catch (error) {
            console.error('Error initializing form action handler:', error);
            this.showErrorState();
        }
    }

    displaySubmissionData() {
        const submittedData = this.getSubmissionData();
        const dataDisplay = document.querySelector('.data-display');
        
        if (!dataDisplay) {
            console.warn('Data display element not found');
            return;
        }

        if (!submittedData || Object.keys(submittedData).length === 0) {
            this.showNoDataMessage(dataDisplay);
            return;
        }

        // Generate data display using template literals and array methods
        const dataItems = Object.entries(submittedData)
            .filter(([key, value]) => value && value.toString().trim() !== '')
            .map(([key, value]) => this.createDataItem(key, value));

        dataDisplay.innerHTML = dataItems.join('');

        // Save submission to local storage for tracking
        this.saveSubmissionRecord(submittedData);

        console.log('Submission data displayed:', submittedData);
    }

    getSubmissionData() {
        try {
            // Get data from URL parameters (simulating form submission)
            const urlParams = new URLSearchParams(window.location.search);
            const formData = {};

            // Convert URLSearchParams to object
            for (const [key, value] of urlParams.entries()) {
                formData[key] = value;
            }

            // If no URL params, try to get from localStorage (fallback)
            if (Object.keys(formData).length === 0) {
                const storedData = this.storageManager.getItem('latest_submission');
                return storedData || this.getMockSubmissionData();
            }

            return formData;

        } catch (error) {
            console.error('Error getting submission data:', error);
            return this.getMockSubmissionData();
        }
    }

    createDataItem(key, value) {
        const label = this.formatFieldLabel(key);
        const formattedValue = this.formatFieldValue(key, value);

        return `
            <div class="data-item">
                <span class="data-label">${label}:</span>
                <span class="data-value">${formattedValue}</span>
            </div>
        `;
    }

    formatFieldLabel(key) {
        const labelMap = {
            'ownerName': 'Your Name',
            'ownerEmail': 'Email Address',
            'ownerPhone': 'Phone Number',
            'listingType': 'Listing Type',
            'propertyAddress': 'Property Address',
            'propertyPrice': 'Price',
            'propertyBedrooms': 'Bedrooms',
            'propertyDescription': 'Description'
        };

        return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    formatFieldValue(key, value) {
        switch (key) {
            case 'propertyPrice':
                const price = parseFloat(value);
                return isNaN(price) ? value : `$${price.toLocaleString()}`;
            
            case 'listingType':
                return value === 'rent' ? 'For Rent' : value === 'sale' ? 'For Sale' : value;
            
            case 'propertyBedrooms':
                return `${value} Bedroom${value !== '1' ? 's' : ''}`;
            
            case 'ownerEmail':
                return `<a href="mailto:${value}">${value}</a>`;
            
            case 'ownerPhone':
                return `<a href="tel:${value}">${value}</a>`;
            
            case 'propertyDescription':
                return value.length > 100 ? `${value.substring(0, 100)}...` : value;
            
            default:
                return value;
        }
    }

    showNoDataMessage(container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
                <p>No submission data available.</p>
                <p>This page displays information from form submissions.</p>
            </div>
        `;
    }

    saveSubmissionRecord(submissionData) {
        try {
            const record = {
                id: `submission_${Date.now()}`,
                data: submissionData,
                timestamp: new Date().toISOString(),
                status: 'received'
            };

            // Get existing submissions
            const submissions = this.storageManager.getItem('property_submissions') || [];
            
            // Add new submission to beginning of array
            submissions.unshift(record);
            
            // Keep only last 50 submissions
            const limitedSubmissions = submissions.slice(0, 50);
            
            // Save back to storage
            this.storageManager.setItem('property_submissions', limitedSubmissions);
            this.storageManager.setItem('latest_submission', submissionData);

            console.log('Submission record saved:', record);

        } catch (error) {
            console.error('Error saving submission record:', error);
        }
    }

    initActionButtons() {
        // Add click tracking to action buttons
        const actionButtons = document.querySelectorAll('.action-buttons a');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                console.log(`User clicked: ${action}`);
                
                // Track user actions
                this.trackUserAction(action);
            });
        });
    }

    trackUserAction(action) {
        try {
            const actionRecord = {
                action: action,
                timestamp: new Date().toISOString(),
                page: 'form-action'
            };

            const actions = this.storageManager.getItem('user_actions') || [];
            actions.push(actionRecord);
            
            // Keep only last 100 actions
            const limitedActions = actions.slice(-100);
            this.storageManager.setItem('user_actions', limitedActions);

        } catch (error) {
            console.error('Error tracking user action:', error);
        }
    }

    showErrorState() {
        const responseCard = document.querySelector('.response-card');
        if (!responseCard) return;

        responseCard.innerHTML = `
            <div class="error-icon" style="font-size: 4rem; margin-bottom: 1.5rem; color: #dc2626;">❌</div>
            <h2>Oops! Something went wrong</h2>
            <p>We encountered an error processing your submission. Please try again or contact us directly.</p>
            
            <div class="error-actions" style="margin-top: 2rem;">
                <a href="resources.html" class="btn-primary">Try Again</a>
                <a href="index.html" class="btn-secondary">Go Home</a>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem;">
                <h4>Need Help?</h4>
                <p>Contact us directly:</p>
                <p><strong>Email:</strong> <a href="mailto:info@rexburghomefinder.com">info@rexburghomefinder.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:2085550123">(208) 555-0123</a></p>
            </div>
        `;
    }

    getMockSubmissionData() {
        // Return mock data for demonstration purposes
        return {
            ownerName: 'John Smith',
            ownerEmail: 'john.smith@email.com',
            ownerPhone: '(208) 555-0123',
            listingType: 'rent',
            propertyAddress: '123 Student Lane, Rexburg, ID 83440',
            propertyPrice: '650',
            propertyBedrooms: '2',
            propertyDescription: 'Beautiful 2-bedroom apartment perfect for students. Close to campus with modern amenities and parking included.'
        };
    }

    // Method to get all submissions (for admin purposes)
    getAllSubmissions() {
        return this.storageManager.getItem('property_submissions') || [];
    }

    // Method to get submission statistics
    getSubmissionStats() {
        const submissions = this.getAllSubmissions();
        
        if (submissions.length === 0) {
            return {
                total: 0,
                byType: {},
                recent: []
            };
        }

        // Use array methods to calculate statistics
        const byType = submissions.reduce((acc, submission) => {
            const type = submission.data.listingType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const recent = submissions
            .slice(0, 5)
            .map(submission => ({
                timestamp: submission.timestamp,
                address: submission.data.propertyAddress,
                type: submission.data.listingType
            }));

        return {
            total: submissions.length,
            byType: byType,
            recent: recent
        };
    }

    // Method to export submissions data
    exportSubmissions() {
        try {
            const submissions = this.getAllSubmissions();
            const dataStr = JSON.stringify(submissions, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `rexburg_submissions_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('Submissions exported successfully');
            
        } catch (error) {
            console.error('Error exporting submissions:', error);
        }
    }

    // Method to clear old submissions
    clearOldSubmissions(daysOld = 30) {
        try {
            const submissions = this.getAllSubmissions();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const recentSubmissions = submissions.filter(submission => {
                const submissionDate = new Date(submission.timestamp);
                return submissionDate > cutoffDate;
            });

            this.storageManager.setItem('property_submissions', recentSubmissions);
            
            const removed = submissions.length - recentSubmissions.length;
            console.log(`Cleared ${removed} old submissions`);
            
            return removed;

        } catch (error) {
            console.error('Error clearing old submissions:', error);
            return 0;
        }
    }
}

// Initialize form action handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the form action page
    if (document.querySelector('.form-response-section')) {
        new FormActionHandler();
    }
});

export { FormActionHandler };