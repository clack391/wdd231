// Responsive Navigation Menu
document.addEventListener("DOMContentLoaded", function() {
    // Get the hamburger button and the primary navigation
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const primaryNav = document.getElementById('primaryNav');
    
    // Toggle menu when hamburger button is clicked
    hamburgerBtn.addEventListener('click', function() {
        primaryNav.classList.toggle('responsive');
    });
    
    // Close the responsive menu when a menu item is clicked
    const navLinks = document.querySelectorAll('#primaryNav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only perform this action if the menu is in responsive mode (small screen)
            if (window.innerWidth < 768) {
                primaryNav.classList.remove('responsive');
            }
        });
    });
    
    // Close the responsive menu when window resizes to larger screen
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            primaryNav.classList.remove('responsive');
        }
    });
    
    // Add active class for current page
    const currentPage = window.location.pathname;
    navLinks.forEach(link => {
        // Extract the page name from the href attribute
        const linkPath = link.getAttribute('href');
        
        // Check if the current page matches the link
        if (currentPage.includes(linkPath) && linkPath !== '#') {
            // Find the parent li and add the active class
            link.parentElement.classList.add('active');
        }
    });
});