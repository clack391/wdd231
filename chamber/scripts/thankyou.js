// JavaScript for Chamber Thank You Page

document.addEventListener('DOMContentLoaded', function() {
    displayFormData();
});

function displayFormData() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Extract required form data
    const formData = {
        firstName: urlParams.get('firstName') || '',
        lastName: urlParams.get('lastName') || '',
        email: urlParams.get('email') || '',
        phone: urlParams.get('phone') || '',
        businessName: urlParams.get('businessName') || '',
        timestamp: urlParams.get('timestamp') || ''
    };
    
    // Display the data
    displayName(formData.firstName, formData.lastName);
    displayEmail(formData.email);
    displayPhone(formData.phone);
    displayBusiness(formData.businessName);
    displayTimestamp(formData.timestamp);
    
    // Log for debugging (remove in production)
    console.log('Form Data Received:', formData);
}

function displayName(firstName, lastName) {
    const nameElement = document.getElementById('displayName');
    if (firstName && lastName) {
        nameElement.textContent = `${firstName} ${lastName}`;
    } else if (firstName) {
        nameElement.textContent = firstName;
    } else if (lastName) {
        nameElement.textContent = lastName;
    } else {
        nameElement.textContent = 'Not provided';
        nameElement.style.fontStyle = 'italic';
        nameElement.style.color = '#999';
    }
}

function displayEmail(email) {
    const emailElement = document.getElementById('displayEmail');
    if (email) {
        emailElement.textContent = email;
        // Make email clickable
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${email}`;
        emailLink.textContent = email;
        emailLink.style.color = '#3498db';
        emailLink.style.textDecoration = 'none';
        emailElement.innerHTML = '';
        emailElement.appendChild(emailLink);
    } else {
        emailElement.textContent = 'Not provided';
        emailElement.style.fontStyle = 'italic';
        emailElement.style.color = '#999';
    }
}

function displayPhone(phone) {
    const phoneElement = document.getElementById('displayPhone');
    if (phone) {
        phoneElement.textContent = formatPhoneForDisplay(phone);
        // Make phone clickable
        const phoneLink = document.createElement('a');
        phoneLink.href = `tel:${phone}`;
        phoneLink.textContent = formatPhoneForDisplay(phone);
        phoneLink.style.color = '#3498db';
        phoneLink.style.textDecoration = 'none';
        phoneElement.innerHTML = '';
        phoneElement.appendChild(phoneLink);
    } else {
        phoneElement.textContent = 'Not provided';
        phoneElement.style.fontStyle = 'italic';
        phoneElement.style.color = '#999';
    }
}

function displayBusiness(businessName) {
    const businessElement = document.getElementById('displayBusiness');
    if (businessName) {
        businessElement.textContent = businessName;
    } else {
        businessElement.textContent = 'Not provided';
        businessElement.style.fontStyle = 'italic';
        businessElement.style.color = '#999';
    }
}

function displayTimestamp(timestamp) {
    const timestampElement = document.getElementById('displayTimestamp');
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            const formattedDate = formatDateForDisplay(date);
            timestampElement.textContent = formattedDate;
        } catch (error) {
            console.error('Error parsing timestamp:', error);
            timestampElement.textContent = 'Invalid date';
            timestampElement.style.fontStyle = 'italic';
            timestampElement.style.color = '#999';
        }
    } else {
        const now = new Date();
        const formattedDate = formatDateForDisplay(now);
        timestampElement.textContent = formattedDate;
    }
}

function formatPhoneForDisplay(phone) {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length === 10) {
        return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    } else if (digits.length === 11 && digits.charAt(0) === '1') {
        return `+1 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
    } else {
        // Return original if not standard US format
        return phone;
    }
}

function formatDateForDisplay(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    
    return date.toLocaleDateString('en-US', options);
}

// Add some animation to the thank you page
document.addEventListener('DOMContentLoaded', function() {
    const summaryCard = document.querySelector('.summary-card');
    const nextSteps = document.querySelector('.next-steps');
    const contactInfo = document.querySelector('.contact-info');
    
    // Add fade-in animation
    setTimeout(() => {
        if (summaryCard) {
            summaryCard.style.opacity = '0';
            summaryCard.style.transform = 'translateY(20px)';
            summaryCard.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                summaryCard.style.opacity = '1';
                summaryCard.style.transform = 'translateY(0)';
            }, 200);
        }
    }, 100);
    
    setTimeout(() => {
        if (nextSteps) {
            nextSteps.style.opacity = '0';
            nextSteps.style.transform = 'translateY(20px)';
            nextSteps.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                nextSteps.style.opacity = '1';
                nextSteps.style.transform = 'translateY(0)';
            }, 400);
        }
    }, 300);
    
    setTimeout(() => {
        if (contactInfo) {
            contactInfo.style.opacity = '0';
            contactInfo.style.transform = 'translateY(20px)';
            contactInfo.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                contactInfo.style.opacity = '1';
                contactInfo.style.transform = 'translateY(0)';
            }, 600);
        }
    }, 500);
});

// Handle case where no form data is present
function handleMissingData() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAnyData = Array.from(urlParams.keys()).length > 0;
    
    if (!hasAnyData) {
        // Show message that no form data was found
        const summaryCard = document.querySelector('.summary-card');
        if (summaryCard) {
            summaryCard.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <h3>No Application Data Found</h3>
                    <p>It appears you accessed this page directly. Please <a href="join.html" style="color: #3498db;">submit the membership form</a> to see your application summary.</p>
                </div>
            `;
        }
        
        // Hide next steps and contact info sections
        const nextSteps = document.querySelector('.next-steps');
        const contactInfo = document.querySelector('.contact-info');
        
        if (nextSteps) nextSteps.style.display = 'none';
        if (contactInfo) contactInfo.style.display = 'none';
    }
}

// Check for missing data after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(handleMissingData, 1000); // Give time for data to load
});

// Utility function to safely get and display data
function safeDisplayData(elementId, value, fallback = 'Not provided') {
    const element = document.getElementById(elementId);
    if (element) {
        if (value && value.trim()) {
            element.textContent = value.trim();
            element.style.fontStyle = 'normal';
            element.style.color = 'inherit';
        } else {
            element.textContent = fallback;
            element.style.fontStyle = 'italic';
            element.style.color = '#999';
        }
    }
}

// Enhanced error handling
window.addEventListener('error', function(event) {
    console.error('Error on thank you page:', event.error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #fdf2f2;
        color: #e74c3c;
        padding: 1rem;
        border: 1px solid #e74c3c;
        border-radius: 5px;
        margin: 1rem 0;
        text-align: center;
    `;
    errorDiv.textContent = 'There was an issue displaying your form data. Please contact us if this problem persists.';
    
    const mainContent = document.querySelector('.thankyou-content');
    if (mainContent) {
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
});