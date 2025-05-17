// JavaScript for dates in the header and footer

// Format the current date for the header banner
function formatCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
}

// Set the current date in the header
document.getElementById('currentDate').textContent = formatCurrentDate();

// Set the current year in the footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Set the last modified date in the footer
document.getElementById('lastModified').textContent = document.lastModified;