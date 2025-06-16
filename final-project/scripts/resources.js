// resources.js - Resources page functionality
// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const servicesContainer = document.getElementById('servicesContainer');
const serviceModal = document.getElementById('serviceModal');
const serviceModalBody = document.getElementById('serviceModalBody');
const serviceModalTitle = document.getElementById('serviceModalTitle');
const faqItems = document.querySelectorAll('.faq-item');

// State management
let services = [];
let calculatorPreferences = JSON.parse(localStorage.getItem('calculatorPreferences') || '{}');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initializeNavigation();
    initializeModal();
    initializeCalculators();
    initializeFAQ();
    await loadServices();
});

// Navigation functionality (shared pattern)
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

// Load services from JSON file
async function loadServices() {
    try {
        const response = await fetch('data/services.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        services = data.services || [];
        
        if (services.length === 0) {
            throw new Error('No services found in data source');
        }
        
        renderServices();
        
    } catch (error) {
        console.error('Error loading services:', error);
        showServicesError('Failed to load services data. Please try again later.');
    }
}

// Render services to the DOM
function renderServices() {
    if (!servicesContainer || services.length === 0) return;

    // Group services by category using array methods
    const servicesByCategory = services.reduce((acc, service) => {
        const category = service.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {});

    // Generate HTML using template literals
    const servicesHTML = Object.entries(servicesByCategory).map(([category, categoryServices]) => `
        <div class="service-category-section">
            <h4 style="margin-bottom: 1rem; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                ${category}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                ${categoryServices.map(service => `
                    <div class="service-card" onclick="openServiceModal('${service.id}')">
                        <div class="service-category">${service.category}</div>
                        <h5 style="margin-bottom: 0.5rem;">${service.name}</h5>
                        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">${service.description}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
                            <span style="color: #2563eb; font-weight: 600;">
                                ${service.phone || 'Contact for info'}
                            </span>
                            <span style="color: #059669;">
                                ${service.rating ? `⭐ ${service.rating}/5` : ''}
                            </span>
                        </div>
                        ${service.specialties ? `
                            <div style="margin-top: 0.75rem;">
                                <div style="font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Specialties:</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                                    ${service.specialties.slice(0, 3).map(specialty => 
                                        `<span style="background-color: #f3f4f6; color: #374151; padding: 0.125rem 0.5rem; border-radius: 0.75rem; font-size: 0.75rem;">${specialty}</span>`
                                    ).join('')}
                                    ${service.specialties.length > 3 ? `<span style="color: #6b7280; font-size: 0.75rem;">+${service.specialties.length - 3} more</span>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    servicesContainer.innerHTML = servicesHTML;
}

// Calculator functionality
function initializeCalculators() {
    // Load saved calculator preferences
    loadCalculatorPreferences();
    
    // Add event listeners for real-time calculation
    const calculatorInputs = document.querySelectorAll('.calculator-form input, .calculator-form select');
    calculatorInputs.forEach(input => {
        input.addEventListener('input', saveCalculatorPreferences);
    });
}

// Load calculator preferences from localStorage
function loadCalculatorPreferences() {
    Object.entries(calculatorPreferences).forEach(([inputId, value]) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = value;
        }
    });
}

// Save calculator preferences to localStorage
function saveCalculatorPreferences() {
    const inputs = document.querySelectorAll('.calculator-form input, .calculator-form select');
    const preferences = {};
    
    inputs.forEach(input => {
        if (input.value) {
            preferences[input.id] = input.value;
        }
    });
    
    calculatorPreferences = preferences;
    localStorage.setItem('calculatorPreferences', JSON.stringify(preferences));
}

// Mortgage calculator function
window.calculateMortgage = function() {
    const loanAmount = parseFloat(document.getElementById('loanAmount')?.value || 0);
    const interestRate = parseFloat(document.getElementById('interestRate')?.value || 0);
    const loanTerm = parseInt(document.getElementById('loanTerm')?.value || 30);
    const resultElement = document.getElementById('mortgageResult');
    
    if (!resultElement) return;
    
    if (loanAmount <= 0 || interestRate <= 0) {
        resultElement.innerHTML = '<p style="color: #dc2626;">Please enter valid loan amount and interest rate.</p>';
        resultElement.style.display = 'block';
        return;
    }
    
    try {
        // Calculate monthly payment
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;
        
        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = loanAmount / numberOfPayments;
        } else {
            monthlyPayment = loanAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }
        
        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;
        
        // Format results using template literals
        resultElement.innerHTML = `
            <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 0.5rem; padding: 1rem;">
                <h5 style="color: #2563eb; margin-bottom: 1rem;">Calculation Results</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">
                            $${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Monthly Payment</div>
                    </div>
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">
                            $${totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Total Payment</div>
                    </div>
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #dc2626;">
                            $${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Total Interest</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
                    Based on ${loanTerm} year loan at ${interestRate}% APR
                </div>
            </div>
        `;
        
        resultElement.style.display = 'block';
        
    } catch (error) {
        console.error('Mortgage calculation error:', error);
        resultElement.innerHTML = '<p style="color: #dc2626;">Error calculating mortgage. Please check your inputs.</p>';
        resultElement.style.display = 'block';
    }
};

// Rent affordability calculator function
window.calculateRentAffordability = function() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome')?.value || 0);
    const otherExpenses = parseFloat(document.getElementById('otherExpenses')?.value || 0);
    const rentPercent = parseInt(document.getElementById('rentPercent')?.value || 30);
    const resultElement = document.getElementById('rentResult');
    
    if (!resultElement) return;
    
    if (monthlyIncome <= 0) {
        resultElement.innerHTML = '<p style="color: #dc2626;">Please enter a valid monthly income.</p>';
        resultElement.style.display = 'block';
        return;
    }
    
    try {
        // Calculate affordability
        const maxRentByPercent = (monthlyIncome * rentPercent) / 100;
        const maxRentAfterExpenses = monthlyIncome - otherExpenses;
        const recommendedMaxRent = Math.min(maxRentByPercent, maxRentAfterExpenses);
        const remainingAfterRent = monthlyIncome - recommendedMaxRent - otherExpenses;
        
        // Determine affordability status
        let status, statusColor;
        if (remainingAfterRent >= monthlyIncome * 0.2) {
            status = 'Comfortable';
            statusColor = '#059669';
        } else if (remainingAfterRent >= monthlyIncome * 0.1) {
            status = 'Manageable';
            statusColor = '#d97706';
        } else {
            status = 'Tight Budget';
            statusColor = '#dc2626';
        }
        
        resultElement.innerHTML = `
            <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 0.5rem; padding: 1rem;">
                <h5 style="color: #2563eb; margin-bottom: 1rem;">Affordability Results</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb;">
                            $${Math.max(0, recommendedMaxRent).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Max Recommended Rent</div>
                    </div>
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: ${statusColor};">
                            ${status}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Budget Status</div>
                    </div>
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">
                            $${Math.max(0, remainingAfterRent).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280;">Remaining Income</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Budget Breakdown:</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.875rem;">
                        <div>Income: $${monthlyIncome.toLocaleString()}</div>
                        <div>Rent: $${Math.max(0, recommendedMaxRent).toLocaleString()}</div>
                        <div>Other: $${otherExpenses.toLocaleString()}</div>
                        <div>Left: $${Math.max(0, remainingAfterRent).toLocaleString()}</div>
                    </div>
                </div>
                ${recommendedMaxRent < 0 ? '<div style="margin-top: 1rem; padding: 0.75rem; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; color: #dc2626; font-size: 0.875rem;"><strong>Warning:</strong> Your expenses exceed your income. Consider reducing other expenses or increasing income.</div>' : ''}
            </div>
        `;
        
        resultElement.style.display = 'block';
        
    } catch (error) {
        console.error('Rent calculation error:', error);
        resultElement.innerHTML = '<p style="color: #dc2626;">Error calculating affordability. Please check your inputs.</p>';
        resultElement.style.display = 'block';
    }
};

// FAQ functionality
function initializeFAQ() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question?.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                const otherQuestion = otherItem.querySelector('.faq-question');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                
                if (otherItem !== item) {
                    otherQuestion?.setAttribute('aria-expanded', 'false');
                    otherAnswer?.classList.remove('show');
                }
            });
            
            // Toggle current item
            question.setAttribute('aria-expanded', (!isExpanded).toString());
            answer?.classList.toggle('show', !isExpanded);
        });
    });
}

// Modal functionality
function initializeModal() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeServiceModal);
    });

    serviceModal?.addEventListener('click', (e) => {
        if (e.target === serviceModal) {
            closeServiceModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && serviceModal?.classList.contains('show')) {
            closeServiceModal();
        }
    });
}

// Open service detail modal
window.openServiceModal = function(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service || !serviceModal) return;

    const modalContent = `
        <div class="modal-service-header" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0;">${service.name}</h3>
                    <div style="margin: 0.5rem 0;">
                        <span style="background-color: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">
                            ${service.category}
                        </span>
                        ${service.rating ? `
                            <span style="margin-left: 0.5rem; color: #059669; font-weight: 600;">
                                ⭐ ${service.rating}/5
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            <p style="color: #6b7280; margin: 0;">${service.description}</p>
        </div>
        
        <div class="modal-contact-info" style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <h5 style="margin-bottom: 1rem;">Contact Information</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${service.phone ? `
                    <div>
                        <strong>Phone:</strong><br>
                        <a href="tel:${service.phone}" style="color: #2563eb;">${service.phone}</a>
                    </div>
                ` : ''}
                ${service.email ? `
                    <div>
                        <strong>Email:</strong><br>
                        <a href="mailto:${service.email}" style="color: #2563eb;">${service.email}</a>
                    </div>
                ` : ''}
                ${service.website ? `
                    <div>
                        <strong>Website:</strong><br>
                        <a href="${service.website}" target="_blank" style="color: #2563eb;">${service.website}</a>
                    </div>
                ` : ''}
                ${service.address ? `
                    <div>
                        <strong>Address:</strong><br>
                        ${service.address}
                    </div>
                ` : ''}
            </div>
        </div>
        
        ${service.specialties && service.specialties.length > 0 ? `
            <div class="modal-specialties" style="margin-bottom: 1.5rem;">
                <h5 style="margin-bottom: 1rem;">Specialties & Services</h5>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${service.specialties.map(specialty => 
                        `<span style="background-color: #dbeafe; color: #1e40af; padding: 0.375rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">${specialty}</span>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
        
        ${service.hours ? `
            <div class="modal-hours" style="margin-bottom: 1.5rem;">
                <h5 style="margin-bottom: 1rem;">Business Hours</h5>
                <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; font-family: monospace;">
                    ${Object.entries(service.hours).map(([day, hours]) => 
                        `<div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span style="font-weight: 600;">${day}:</span>
                            <span>${hours}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
        
        ${service.reviews && service.reviews.length > 0 ? `
            <div class="modal-reviews" style="margin-bottom: 1.5rem;">
                <h5 style="margin-bottom: 1rem;">Recent Reviews</h5>
                ${service.reviews.slice(0, 3).map(review => `
                    <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 4px solid #2563eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600;">${review.author}</span>
                            <span style="color: #059669;">⭐ ${review.rating}/5</span>
                        </div>
                        <p style="margin: 0; font-style: italic; color: #374151;">"${review.comment}"</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div class="modal-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            ${service.phone ? `
                <button onclick="window.open('tel:${service.phone}')" class="btn btn-primary" style="flex: 1; padding: 0.75rem; background-color: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Call Now
                </button>
            ` : ''}
            ${service.email ? `
                <button onclick="window.open('mailto:${service.email}')" class="btn btn-secondary" style="flex: 1; padding: 0.75rem; background-color: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Send Email
                </button>
            ` : ''}
            ${service.website ? `
                <button onclick="window.open('${service.website}', '_blank')" class="btn btn-secondary" style="flex: 1; padding: 0.75rem; background-color: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Visit Website
                </button>
            ` : ''}
        </div>
    `;

    serviceModalTitle.textContent = `${service.name} - Service Details`;
    serviceModalBody.innerHTML = modalContent;
    
    serviceModal.classList.add('show');
    serviceModal.setAttribute('aria-hidden', 'false');
    
    // Focus management for accessibility
    const firstFocusable = serviceModalBody.querySelector('button, a');
    firstFocusable?.focus();
};

// Close service modal
function closeServiceModal() {
    serviceModal?.classList.remove('show');
    serviceModal?.setAttribute('aria-hidden', 'true');
}

// Show services error
function showServicesError(message) {
    if (servicesContainer) {
        servicesContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #dc2626; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem;">
                <h4>Error Loading Services</h4>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Export for potential use in other modules
export { 
    services, 
    openServiceModal, 
    calculateMortgage, 
    calculateRentAffordability,
    loadServices 
};