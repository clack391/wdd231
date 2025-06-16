// neighborhoods.js - Neighborhoods page functionality
import { PropertyUtils } from './properties.js';

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const neighborhoodsContainer = document.getElementById('neighborhoodsContainer');
const areaSelect = document.getElementById('areaSelect');
const compareBtn = document.getElementById('compareBtn');
const comparisonResults = document.getElementById('comparisonResults');
const comparisonTableBody = document.getElementById('comparisonTableBody');
const area1Header = document.getElementById('area1Header');
const area2Header = document.getElementById('area2Header');
const neighborhoodModal = document.getElementById('neighborhoodModal');
const neighborhoodModalBody = document.getElementById('neighborhoodModalBody');
const neighborhoodModalTitle = document.getElementById('neighborhoodModalTitle');

// State management
let neighborhoods = [];
let neighborhoodPreferences = JSON.parse(localStorage.getItem('neighborhoodPreferences') || '{}');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initializeNavigation();
    initializeModal();
    initializeComparison();
    await loadNeighborhoods();
});

// Navigation functionality (shared with main.js)
function initializeNavigation() {
    hamburger?.addEventListener('click', () => {
        navLinks?.classList.toggle('show');
        
        const spans = hamburger.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (navLinks?.classList.contains('show')) {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                span.style.transform = 'none';
                span.style.opacity = '1';
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!hamburger?.contains(e.target) && !navLinks?.contains(e.target)) {
            navLinks?.classList.remove('show');
            const spans = hamburger?.querySelectorAll('span') || [];
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        }
    });
}

// Load neighborhoods from JSON file
async function loadNeighborhoods() {
    try {
        const response = await fetch('data/neighborhoods.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        neighborhoods = data.neighborhoods || [];
        
        if (neighborhoods.length === 0) {
            throw new Error('No neighborhoods found in data source');
        }
        
        renderNeighborhoods();
        
    } catch (error) {
        console.error('Error loading neighborhoods:', error);
        showError('Failed to load neighborhood data. Please try again later.');
    }
}

// Render neighborhoods to the DOM
function renderNeighborhoods() {
    if (!neighborhoodsContainer || neighborhoods.length === 0) return;

    // Use template literals and array methods to generate HTML
    const neighborhoodsHTML = neighborhoods.map(neighborhood => {
        const rentRange = `$${neighborhood.rentRange.min} - $${neighborhood.rentRange.max}`;
        const avgCommute = neighborhood.avgCommuteTime || 'N/A';
        
        return `
            <div class="neighborhood-card" data-neighborhood-id="${neighborhood.id}">
                <div class="neighborhood-header">
                    <h4>${neighborhood.name}</h4>
                    <p>${neighborhood.description}</p>
                </div>
                <div class="neighborhood-content">
                    <div class="neighborhood-stats">
                        <div class="stat-item">
                            <div class="stat-value">${rentRange}</div>
                            <div class="stat-label">Monthly Rent</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${avgCommute}</div>
                            <div class="stat-label">Avg Commute</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${neighborhood.safetyRating}/5</div>
                            <div class="stat-label">Safety Rating</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${neighborhood.propertyCount}</div>
                            <div class="stat-label">Properties</div>
                        </div>
                    </div>
                    
                    <div class="neighborhood-highlights">
                        <h5>Key Features:</h5>
                        <ul>
                            ${neighborhood.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="neighborhood-amenities">
                        <h5>Nearby Amenities:</h5>
                        <div class="amenity-tags">
                            ${neighborhood.amenities.slice(0, 4).map(amenity => 
                                `<span class="amenity-tag">${amenity}</span>`
                            ).join('')}
                            ${neighborhood.amenities.length > 4 ? 
                                `<span class="amenity-tag more">+${neighborhood.amenities.length - 4} more</span>` : 
                                ''
                            }
                        </div>
                    </div>
                    
                    <button class="neighborhood-details-btn" onclick="openNeighborhoodModal('${neighborhood.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');

    neighborhoodsContainer.innerHTML = neighborhoodsHTML;
}

// Initialize comparison functionality
function initializeComparison() {
    compareBtn?.addEventListener('click', handleComparison);
    
    // Load saved preferences
    if (neighborhoodPreferences.selectedAreas) {
        Array.from(areaSelect?.options || []).forEach(option => {
            if (neighborhoodPreferences.selectedAreas.includes(option.value)) {
                option.selected = true;
            }
        });
    }
}

// Handle area comparison
function handleComparison() {
    if (!areaSelect || !comparisonResults) return;
    
    const selectedAreas = Array.from(areaSelect.selectedOptions).map(option => option.value);
    
    if (selectedAreas.length !== 2) {
        alert('Please select exactly 2 areas to compare.');
        return;
    }
    
    // Save preferences
    neighborhoodPreferences.selectedAreas = selectedAreas;
    localStorage.setItem('neighborhoodPreferences', JSON.stringify(neighborhoodPreferences));
    
    const area1 = neighborhoods.find(n => n.id === selectedAreas[0]);
    const area2 = neighborhoods.find(n => n.id === selectedAreas[1]);
    
    if (!area1 || !area2) {
        alert('Selected areas not found.');
        return;
    }
    
    renderComparison(area1, area2);
}

// Render comparison table
function renderComparison(area1, area2) {
    if (!area1Header || !area2Header || !comparisonTableBody || !comparisonResults) return;
    
    area1Header.textContent = area1.name;
    area2Header.textContent = area2.name;
    
    const comparisonData = [
        {
            feature: 'Average Rent',
            area1: `$${area1.rentRange.min} - $${area1.rentRange.max}`,
            area2: `$${area2.rentRange.min} - $${area2.rentRange.max}`
        },
        {
            feature: 'Commute to Campus',
            area1: area1.avgCommuteTime || 'N/A',
            area2: area2.avgCommuteTime || 'N/A'
        },
        {
            feature: 'Safety Rating',
            area1: `${area1.safetyRating}/5`,
            area2: `${area2.safetyRating}/5`
        },
        {
            feature: 'Property Count',
            area1: area1.propertyCount.toString(),
            area2: area2.propertyCount.toString()
        },
        {
            feature: 'Student Population',
            area1: area1.studentPercentage ? `${area1.studentPercentage}%` : 'N/A',
            area2: area2.studentPercentage ? `${area2.studentPercentage}%` : 'N/A'
        },
        {
            feature: 'Parking Availability',
            area1: area1.parkingAvailability || 'N/A',
            area2: area2.parkingAvailability || 'N/A'
        }
    ];
    
    const comparisonHTML = comparisonData.map(row => `
        <tr>
            <td><strong>${row.feature}</strong></td>
            <td>${row.area1}</td>
            <td>${row.area2}</td>
        </tr>
    `).join('');
    
    comparisonTableBody.innerHTML = comparisonHTML;
    comparisonResults.style.display = 'block';
    
    // Scroll to results
    comparisonResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Modal functionality
function initializeModal() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeNeighborhoodModal);
    });

    neighborhoodModal?.addEventListener('click', (e) => {
        if (e.target === neighborhoodModal) {
            closeNeighborhoodModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && neighborhoodModal?.classList.contains('show')) {
            closeNeighborhoodModal();
        }
    });
}

// Open neighborhood detail modal
window.openNeighborhoodModal = function(neighborhoodId) {
    const neighborhood = neighborhoods.find(n => n.id === neighborhoodId);
    if (!neighborhood || !neighborhoodModal) return;

    const modalContent = `
        <div class="modal-neighborhood-header" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0;">${neighborhood.name}</h3>
                    <p style="color: #6b7280; margin: 0.5rem 0;">${neighborhood.description}</p>
                </div>
                <div style="text-align: right;">
                    <div style="background-color: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">
                        ${neighborhood.safetyRating}/5 Safety
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="modal-stat">
                <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">$${neighborhood.rentRange.min}-${neighborhood.rentRange.max}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Monthly Rent</div>
            </div>
            <div class="modal-stat">
                <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">${neighborhood.avgCommuteTime || 'N/A'}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Avg Commute</div>
            </div>
            <div class="modal-stat">
                <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">${neighborhood.propertyCount}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Properties</div>
            </div>
            <div class="modal-stat">
                <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">${neighborhood.studentPercentage || 'N/A'}%</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Students</div>
            </div>
        </div>
        
        <div class="modal-section" style="margin-bottom: 2rem;">
            <h5 style="margin-bottom: 1rem;">Key Features</h5>
            <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; list-style: none; padding: 0;">
                ${neighborhood.highlights.map(highlight => `<li style="padding: 0.5rem; background-color: #f3f4f6; border-radius: 0.375rem;">✓ ${highlight}</li>`).join('')}
            </ul>
        </div>
        
        <div class="modal-section" style="margin-bottom: 2rem;">
            <h5 style="margin-bottom: 1rem;">Nearby Amenities</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${neighborhood.amenities.map(amenity => `<span style="background-color: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">${amenity}</span>`).join('')}
            </div>
        </div>
        
        <div class="modal-section" style="margin-bottom: 2rem;">
            <h5 style="margin-bottom: 1rem;">Transportation & Parking</h5>
            <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
                <p><strong>Parking:</strong> ${neighborhood.parkingAvailability || 'Information not available'}</p>
                <p><strong>Public Transit:</strong> ${neighborhood.publicTransit || 'Limited public transportation'}</p>
                <p><strong>Bike Friendly:</strong> ${neighborhood.bikeFriendly ? 'Yes' : 'No'}</p>
            </div>
        </div>
        
        <div class="modal-section" style="margin-bottom: 2rem;">
            <h5 style="margin-bottom: 1rem;">Living Costs</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div>
                    <strong>Utilities (avg/month):</strong>
                    <ul style="margin: 0.5rem 0; padding-left: 1rem;">
                        <li>Electricity: $${neighborhood.utilities?.electricity || '80-120'}</li>
                        <li>Internet: $${neighborhood.utilities?.internet || '30-60'}</li>
                        <li>Water: $${neighborhood.utilities?.water || '25-40'}</li>
                    </ul>
                </div>
                <div>
                    <strong>Grocery Access:</strong>
                    <p style="margin: 0.5rem 0;">${neighborhood.groceryAccess || 'Multiple options within 2 miles'}</p>
                    <strong>Dining Options:</strong>
                    <p style="margin: 0.5rem 0;">${neighborhood.diningOptions || 'Various restaurants nearby'}</p>
                </div>
            </div>
        </div>
        
        ${neighborhood.pros && neighborhood.cons ? `
        <div class="modal-section">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h5 style="color: #059669; margin-bottom: 1rem;">Pros</h5>
                    <ul style="list-style: none; padding: 0;">
                        ${neighborhood.pros.map(pro => `<li style="padding: 0.25rem 0; color: #059669;">✓ ${pro}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h5 style="color: #dc2626; margin-bottom: 1rem;">Cons</h5>
                    <ul style="list-style: none; padding: 0;">
                        ${neighborhood.cons.map(con => `<li style="padding: 0.25rem 0; color: #dc2626;">✗ ${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}
    `;

    neighborhoodModalTitle.textContent = `${neighborhood.name} - Detailed Information`;
    neighborhoodModalBody.innerHTML = modalContent;
    
    neighborhoodModal.classList.add('show');
    neighborhoodModal.setAttribute('aria-hidden', 'false');
    
    // Focus management for accessibility
    const firstFocusable = neighborhoodModalBody.querySelector('button, a, [tabindex]');
    firstFocusable?.focus();
};

// Close neighborhood modal
function closeNeighborhoodModal() {
    neighborhoodModal?.classList.remove('show');
    neighborhoodModal?.setAttribute('aria-hidden', 'true');
}

// Show error message
function showError(message) {
    if (neighborhoodsContainer) {
        neighborhoodsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #dc2626; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem;">
                <h4>Error Loading Neighborhoods</h4>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Utility function to filter neighborhoods by criteria
function filterNeighborhoods(criteria) {
    return neighborhoods.filter(neighborhood => {
        if (criteria.maxRent && neighborhood.rentRange.min > criteria.maxRent) {
            return false;
        }
        
        if (criteria.minSafety && neighborhood.safetyRating < criteria.minSafety) {
            return false;
        }
        
        if (criteria.maxCommute && neighborhood.avgCommuteTime) {
            const commuteMinutes = parseInt(neighborhood.avgCommuteTime);
            if (commuteMinutes > criteria.maxCommute) {
                return false;
            }
        }
        
        if (criteria.studentFriendly && neighborhood.studentPercentage < 50) {
            return false;
        }
        
        return true;
    });
}

// Export for potential use in other modules
export { 
    neighborhoods, 
    openNeighborhoodModal, 
    filterNeighborhoods,
    loadNeighborhoods 
};