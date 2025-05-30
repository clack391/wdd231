// JavaScript for Chamber Join Page

// Set timestamp when page loads
document.addEventListener('DOMContentLoaded', function() {
    const timestampField = document.getElementById('timestamp');
    const now = new Date();
    timestampField.value = now.toISOString();
    
    // Set up form validation
    setupFormValidation();
    
    // Set up keyboard navigation for modals
    setupModalKeyboardNavigation();
});

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Focus on the modal content for accessibility
    const modalContent = modal.querySelector('.modal-content');
    modalContent.focus();
    
    // Add event listener for clicking outside modal to close
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal(modalId);
        }
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal(modalId);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // Remove event listeners
    modal.removeEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal(modalId);
        }
    });
    
    document.removeEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal(modalId);
        }
    });
    
    // Return focus to the button that opened the modal
    const activeButton = document.activeElement;
    if (activeButton && activeButton.classList.contains('info-btn')) {
        activeButton.focus();
    }
}

// Set up keyboard navigation for modals
function setupModalKeyboardNavigation() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('keydown', function(event) {
            if (event.key === 'Tab') {
                trapFocus(event, modal);
            }
        });
    });
}

// Trap focus within modal
function trapFocus(event, modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    }
}

// Form validation setup
function setupFormValidation() {
    const form = document.getElementById('membershipForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Add real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
    
    // Form submission validation
    form.addEventListener('submit', function(event) {
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            event.preventDefault();
            
            // Focus on first invalid field
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Show error message
            showFormError('Please correct the highlighted fields before submitting.');
        } else {
            // Update timestamp before submission
            const timestampField = document.getElementById('timestamp');
            const now = new Date();
            timestampField.value = now.toISOString();
        }
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error states
    field.classList.remove('error');
    removeFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Specific field validations
    if (value && !isValid === false) {
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
                
            case 'tel':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
                break;
                
            case 'text':
                if (field.hasAttribute('pattern')) {
                    const pattern = new RegExp(field.pattern);
                    if (!pattern.test(value)) {
                        isValid = false;
                        if (field.id === 'title') {
                            errorMessage = 'Title must be at least 7 characters and contain only letters, spaces, and hyphens.';
                        } else {
                            errorMessage = 'Please enter a valid value.';
                        }
                    }
                }
                break;
        }
    }
    
    // Apply error styling and message
    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show field-specific error
function showFieldError(field, message) {
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.9rem';
    errorElement.style.display = 'block';
    errorElement.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorElement);
}

// Remove field error
function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Show general form error
function showFormError(message) {
    // Remove existing error message
    const existingError = document.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    const form = document.getElementById('membershipForm');
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        background: #fdf2f2;
        color: #e74c3c;
        padding: 1rem;
        border: 1px solid #e74c3c;
        border-radius: 5px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: bold;
    `;
    
    form.insertBefore(errorElement, form.firstChild);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Utility function to format phone number
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    
    if (value.length === 10) {
        input.value = formattedValue;
    }
}

// Add phone formatting on input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});

// Accessibility enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels to form elements
    const form = document.getElementById('membershipForm');
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        const label = field.closest('label');
        if (label && !label.textContent.includes('*')) {
            // Already has asterisk in HTML
        }
        field.setAttribute('aria-required', 'true');
    });
    
    // Add live region for form errors
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'form-live-region';
    document.body.appendChild(liveRegion);
});

// Function to announce errors to screen readers
function announceError(message) {
    const liveRegion = document.getElementById('form-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}