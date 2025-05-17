// JavaScript for toggling the mobile menu

// Get elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const primaryNav = document.getElementById('primaryNav');

// Toggle menu function
function toggleMenu() {
    primaryNav.classList.toggle('open');
    
    // Change hamburger button to X when menu is open
    if (primaryNav.classList.contains('open')) {
        hamburgerBtn.innerHTML = '&times;'; // X symbol
    } else {
        hamburgerBtn.innerHTML = '&#9776;'; // Hamburger symbol
    }
}

// Add event listener
hamburgerBtn.addEventListener('click', toggleMenu);