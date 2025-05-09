// Date Functions for Footer
document.addEventListener("DOMContentLoaded", function() {
    // Get the current year for copyright
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentyear');
    
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
    
    // Get the last modified date
    const lastModified = document.lastModified;
    const lastModifiedElement = document.getElementById('lastModified');
    
    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last Modified: ${lastModified}`;
    }
});