// Resources page functionality

import { StorageManager } from './modules/storage-manager.js';

class ResourcesApp {
    constructor() {
        this.storageManager = new StorageManager();
        this.services = [];
        this.faqs = [];
        
        this.init();
    }

    async init() {
        try {
            // Load data
            await this.loadServices();
            await this.loadFAQs();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Display content
            this.displayServices();
            this.displayFAQs();
            
            // Set up calculators
            this.setupCalculators();
            
        } catch (error) {
            console.error('Failed to initialize resources app:', error);
        }
    }

    async loadServices() {
        try {
            // Try to fetch from local JSON file first
            const response = await fetch('data/services.json');
            
            if (response.ok) {
                const data = await response.json();
                this.services = data.services;
            } else {
                throw new Error('Failed to fetch services data');
            }
        } catch (error) {
            // Use fallback data if fetch fails
            this.services = this.getFallbackServicesData();
        }
    }

    async loadFAQs() {
        try {
            // Try to fetch from local JSON file first
            const response = await fetch('data/faqs.json');
            
            if (response.ok) {
                const data = await response.json();
                this.faqs = data.faqs;
            } else {
                throw new Error('Failed to fetch FAQ data');
            }
        } catch (error) {
            // Use fallback data if fetch fails
            this.faqs = this.getFallbackFAQData();
        }
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

        // FAQ toggle functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('faq-question')) {
                this.toggleFAQ(e.target);
            }
        });

        // Form validation and storage
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            this.setupFormHandling(contactForm);
        }

        // Calculator button event listeners
        this.setupCalculatorEventListeners();

        // Service card interactions
        this.setupServiceCardListeners();

        // General button interactions
        this.setupGeneralButtonListeners();
    }

    setupCalculatorEventListeners() {
        // Mortgage calculator button
        const mortgageBtn = document.getElementById('calculateMortgageBtn') || 
                           document.querySelector('[data-action="calculate-mortgage"]') ||
                           document.querySelector('.mortgage-calculate-btn');
        
        if (mortgageBtn) {
            mortgageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculateMortgage();
            });
        }

        // Rent affordability calculator button
        const rentBtn = document.getElementById('calculateRentBtn') || 
                       document.querySelector('[data-action="calculate-rent"]') ||
                       document.querySelector('.rent-calculate-btn');
        
        if (rentBtn) {
            rentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculateRentAffordability();
            });
        }

        // Calculator reset buttons
        const resetButtons = document.querySelectorAll('[data-action="reset-calculator"]');
        resetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetCalculator(btn.dataset.calculator);
            });
        });

        // Calculator input auto-save
        const calculatorInputs = document.querySelectorAll('.calculator input');
        calculatorInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveCalculatorValues();
            });
        });
    }

    setupServiceCardListeners() {
        // Use event delegation for dynamically created service cards
        document.addEventListener('click', (e) => {
            // Phone number clicks
            if (e.target.matches('a[href^="tel:"]')) {
                this.trackServiceInteraction('phone', e.target.href);
            }
            
            // Email clicks
            if (e.target.matches('a[href^="mailto:"]')) {
                this.trackServiceInteraction('email', e.target.href);
            }
            
            // Website clicks
            if (e.target.matches('.service-card a[target="_blank"]')) {
                this.trackServiceInteraction('website', e.target.href);
            }
        });
    }

    setupGeneralButtonListeners() {
        // Copy-to-clipboard functionality
        const copyButtons = document.querySelectorAll('[data-action="copy"]');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.copyToClipboard(btn.dataset.text || btn.textContent);
            });
        });

        // Smooth scroll links
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    this.smoothScrollTo(targetElement);
                }
            });
        });

        // Modal triggers
        const modalTriggers = document.querySelectorAll('[data-modal]');
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(trigger.dataset.modal);
            });
        });

        // Close modal buttons
        const closeModalButtons = document.querySelectorAll('[data-action="close-modal"]');
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        });

        // Print functionality
        const printButtons = document.querySelectorAll('[data-action="print"]');
        printButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.print();
            });
        });
    }

    setupFormHandling(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Auto-save form data as user types
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveFormData(form);
            });
        });

        // Load saved form data
        this.loadFormData(form);
        
        // Form submission
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                return false;
            }
            
            // Clear saved form data on successful submission
            this.storageManager.clearFormData('contactForm');
        });
    }

    // Calculator methods (moved from global functions)
    calculateMortgage() {
        const loanAmount = parseFloat(document.getElementById('loanAmount')?.value || 0);
        const interestRate = parseFloat(document.getElementById('interestRate')?.value || 0);
        const loanTerm = parseInt(document.getElementById('loanTerm')?.value || 0);
        
        if (!loanAmount || !interestRate || !loanTerm) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Save values for future use
        this.storageManager.setUserPreference('lastLoanAmount', loanAmount);
        this.storageManager.setUserPreference('lastInterestRate', interestRate);
        
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;
        
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                              (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        const totalPaid = monthlyPayment * numPayments;
        const totalInterest = totalPaid - loanAmount;
        
        const result = document.getElementById('mortgageResult');
        if (result) {
            result.innerHTML = `
                <h4>Monthly Payment: $${monthlyPayment.toFixed(2)}</h4>
                <p>Total Amount Paid: $${totalPaid.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                <p>Total Interest: $${totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            `;
            result.classList.add('show');
        }

        // Track calculator usage
        this.storageManager.incrementCounter('mortgageCalculatorUsage');
    }

    calculateRentAffordability() {
        const monthlyIncome = parseFloat(document.getElementById('monthlyIncome')?.value || 0);
        const debtPayments = parseFloat(document.getElementById('debtPayments')?.value || 0);
        const affordabilityRule = parseInt(document.getElementById('affordabilityRule')?.value || 30);
        
        if (!monthlyIncome) {
            this.showNotification('Please enter your monthly income', 'error');
            return;
        }
        
        // Save values for future use
        this.storageManager.setUserPreference('lastIncome', monthlyIncome);
        
        const maxRent = (monthlyIncome * affordabilityRule / 100) - debtPayments;
        const remainingIncome = monthlyIncome - maxRent - debtPayments;
        
        const result = document.getElementById('rentResult');
        if (result) {
            result.innerHTML = `
                <h4>Maximum Affordable Rent: $${Math.max(0, maxRent).toFixed(2)}</h4>
                <p>Monthly Income: $${monthlyIncome.toFixed(2)}</p>
                <p>Debt Payments: $${debtPayments.toFixed(2)}</p>
                <p>Remaining Income: $${remainingIncome.toFixed(2)}</p>
                ${maxRent <= 0 ? '<p style="color: var(--accent-color);"><strong>Warning:</strong> Current debt payments exceed recommended rent budget.</p>' : ''}
            `;
            result.classList.add('show');
        }

        // Track calculator usage
        this.storageManager.incrementCounter('rentCalculatorUsage');
    }

    resetCalculator(calculatorType) {
        if (calculatorType === 'mortgage') {
            const inputs = ['loanAmount', 'interestRate', 'loanTerm'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) input.value = '';
            });
            
            const result = document.getElementById('mortgageResult');
            if (result) {
                result.innerHTML = '';
                result.classList.remove('show');
            }
        } else if (calculatorType === 'rent') {
            const inputs = ['monthlyIncome', 'debtPayments', 'affordabilityRule'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input && id !== 'affordabilityRule') input.value = '';
            });
            
            const result = document.getElementById('rentResult');
            if (result) {
                result.innerHTML = '';
                result.classList.remove('show');
            }
        }
    }

    saveCalculatorValues() {
        const loanAmount = document.getElementById('loanAmount')?.value;
        const interestRate = document.getElementById('interestRate')?.value;
        const monthlyIncome = document.getElementById('monthlyIncome')?.value;
        
        if (loanAmount) this.storageManager.setUserPreference('lastLoanAmount', loanAmount);
        if (interestRate) this.storageManager.setUserPreference('lastInterestRate', interestRate);
        if (monthlyIncome) this.storageManager.setUserPreference('lastIncome', monthlyIncome);
    }

    // Utility methods
    trackServiceInteraction(type, target) {
        this.storageManager.incrementCounter(`serviceInteractions_${type}`);
        console.log(`Service interaction tracked: ${type} - ${target}`);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }

    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        // Set notification style based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';

        // Auto-hide notification
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }

    // Existing methods remain the same...
    saveFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        this.storageManager.saveFormData('contactForm', data);
    }

    loadFormData(form) {
        const savedData = this.storageManager.getFormData('contactForm');
        if (!savedData) return;
        
        Object.keys(savedData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && savedData[key]) {
                input.value = savedData[key];
            }
        });
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Email validation
        const emailField = form.querySelector('[type="email"]');
        if (emailField && emailField.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        return isValid;
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error styling
        field.style.borderColor = 'var(--accent-color)';
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = 'var(--accent-color)';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    toggleFAQ(questionElement) {
        const faqItem = questionElement.closest('.faq-item');
        const answer = faqItem.querySelector('.faq-answer');
        
        const isExpanded = questionElement.getAttribute('aria-expanded') === 'true';
        
        // Close other open FAQs
        document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(openQuestion => {
            if (openQuestion !== questionElement) {
                openQuestion.setAttribute('aria-expanded', 'false');
                const openAnswer = openQuestion.closest('.faq-item').querySelector('.faq-answer');
                openAnswer.classList.remove('active');
            }
        });
        
        // Toggle current FAQ
        questionElement.setAttribute('aria-expanded', !isExpanded);
        answer.classList.toggle('active');
        
        // Track FAQ interactions
        this.storageManager.incrementCounter('faqInteractions');
    }

    setupCalculators() {
        // Load calculator preferences
        const savedLoanAmount = this.storageManager.getUserPreference('lastLoanAmount');
        const savedInterestRate = this.storageManager.getUserPreference('lastInterestRate');
        const savedIncome = this.storageManager.getUserPreference('lastIncome');
        
        if (savedLoanAmount) {
            const loanInput = document.getElementById('loanAmount');
            if (loanInput) loanInput.value = savedLoanAmount;
        }
        
        if (savedInterestRate) {
            const rateInput = document.getElementById('interestRate');
            if (rateInput) rateInput.value = savedInterestRate;
        }
        
        if (savedIncome) {
            const incomeInput = document.getElementById('monthlyIncome');
            if (incomeInput) incomeInput.value = savedIncome;
        }
    }

    displayServices() {
        const grid = document.getElementById('servicesGrid');
        if (!grid) return;

        const serviceCards = this.services.map(service => this.createServiceCard(service));
        grid.innerHTML = serviceCards.join('');
    }

    createServiceCard(service) {
        return `
            <div class="service-card">
                <div class="service-category">${service.category}</div>
                <h4>${service.name}</h4>
                <p style="color: var(--text-light); margin-bottom: 1rem;">
                    ${service.description}
                </p>
                <div class="service-contact">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>📞 Phone:</strong> 
                        <a href="tel:${service.phone}">${service.phone}</a>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>📧 Email:</strong> 
                        <a href="mailto:${service.email}">${service.email}</a>
                    </div>
                    ${service.website ? `
                        <div>
                            <strong>🌐 Website:</strong> 
                            <a href="${service.website}" target="_blank" rel="noopener">Visit Site</a>
                        </div>
                    ` : ''}
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.9rem;">
                    <strong>Specialties:</strong><br>
                    ${service.specialties.join(', ')}
                </div>
            </div>
        `;
    }

    displayFAQs() {
        const faqList = document.getElementById('faqList');
        if (!faqList) return;

        const faqItems = this.faqs.map(faq => this.createFAQItem(faq));
        faqList.innerHTML = faqItems.join('');
    }

    createFAQItem(faq) {
        return `
            <div class="faq-item">
                <button class="faq-question" aria-expanded="false" type="button">
                    <span>${faq.question}</span>
                    <span class="faq-icon">▼</span>
                </button>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `;
    }

    getFallbackServicesData() {
        return [
            {
                id: 1,
                name: "Mountain View Realty",
                category: "Real Estate Agent",
                description: "Experienced real estate professionals specializing in Rexburg area properties and student housing.",
                phone: "(208) 555-0100",
                email: "info@mountainviewrealty.com",
                website: "https://mountainviewrealty.com",
                specialties: ["Student Housing", "First-time Buyers", "Investment Properties"]
            },
            {
                id: 2,
                name: "Idaho Central Credit Union",
                category: "Mortgage Lender",
                description: "Local credit union offering competitive mortgage rates and personalized service for home buyers.",
                phone: "(208) 555-0200",
                email: "mortgage@idcu.com",
                website: "https://idcu.com",
                specialties: ["First-time Buyer Programs", "Competitive Rates", "Local Service"]
            },
            {
                id: 3,
                name: "Rexburg Moving Solutions",
                category: "Moving Company",
                description: "Professional moving services for local and long-distance moves, including student relocations.",
                phone: "(208) 555-0300",
                email: "bookings@rexburgmoving.com",
                website: null,
                specialties: ["Local Moves", "Student Moves", "Packing Services"]
            },
            {
                id: 4,
                name: "Heritage Title Company",
                category: "Title Company",
                description: "Comprehensive title and escrow services for residential and commercial real estate transactions.",
                phone: "(208) 555-0400",
                email: "orders@heritagetitle.com",
                website: "https://heritagetitle.com",
                specialties: ["Title Insurance", "Escrow Services", "Commercial Transactions"]
            },
            {
                id: 5,
                name: "Precision Home Inspections",
                category: "Home Inspector",
                description: "Thorough home inspections to help buyers make informed decisions about their property purchase.",
                phone: "(208) 555-0500",
                email: "schedule@precisioninspections.com",
                website: "https://precisioninspections.com",
                specialties: ["Residential Inspections", "Same-day Reports", "Buyer Education"]
            },
            {
                id: 6,
                name: "Rexburg Insurance Agency",
                category: "Insurance Agent",
                description: "Complete insurance solutions including homeowners, renters, and property insurance coverage.",
                phone: "(208) 555-0600",
                email: "quotes@rexburginsurance.com",
                website: "https://rexburginsurance.com",
                specialties: ["Homeowners Insurance", "Renters Insurance", "Property Coverage"]
            }
        ];
    }

    getFallbackFAQData() {
        return [
            {
                id: 1,
                question: "What's the average rent for student housing near BYU-I?",
                answer: "Student housing near BYU-I typically ranges from $400-800 per month for shared apartments. Private rooms in shared housing average $500-650, while studio apartments range from $650-900. Prices vary based on distance from campus, amenities, and housing quality."
            },
            {
                id: 2,
                question: "How far in advance should I start looking for housing?",
                answer: "For fall semester, start looking in February-March. For winter semester, begin your search in October-November. Summer housing searches should start in March-April. Early searching gives you the best selection and often better prices."
            },
            {
                id: 3,
                question: "What documents do I need to rent an apartment?",
                answer: "Typically you'll need: valid photo ID, proof of income or financial aid, rental application, application fee ($25-50), security deposit (usually one month's rent), and sometimes a co-signer if you're a student without income history."
            },
            {
                id: 4,
                question: "Are utilities typically included in rent?",
                answer: "It varies by property. Some include all utilities, others include just water/sewer. Expect to pay $80-150/month for utilities not included in rent. Always ask what's included before signing a lease."
            },
            {
                id: 5,
                question: "What's the typical security deposit?",
                answer: "Security deposits in Rexburg typically range from $200-500, or equivalent to one month's rent. Some properties offer reduced deposits for good credit or longer lease terms. Deposits are refundable if you leave the property in good condition."
            },
            {
                id: 6,
                question: "Can I break my lease if I need to leave early?",
                answer: "Lease breaking policies vary by landlord. Some allow early termination with 30-60 days notice and a fee. Others require you to find a replacement tenant. Always read your lease carefully and discuss options with your landlord."
            },
            {
                id: 7,
                question: "What should I know about buying a home in Rexburg?",
                answer: "Rexburg's housing market is influenced by the university calendar. Consider proximity to campus, property taxes (around 0.75% annually), seasonal market fluctuations, and potential for rental income if you plan to rent to students."
            },
            {
                id: 8,
                question: "Are pets allowed in most rentals?",
                answer: "Pet policies vary widely. Many student housing complexes don't allow pets, while some private rentals do with additional deposits ($200-500) and monthly pet rent ($25-50). Always confirm pet policies before applying."
            }
        ];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResourcesApp();
});