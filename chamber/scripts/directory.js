// JavaScript for the directory page

// DOM elements
const gridBtn = document.getElementById('gridBtn');
const listBtn = document.getElementById('listBtn');
const membersContainer = document.getElementById('members');

// Add event listeners for view buttons
gridBtn.addEventListener('click', () => {
    membersContainer.classList.add('grid');
    membersContainer.classList.remove('list');
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
});

listBtn.addEventListener('click', () => {
    membersContainer.classList.add('list');
    membersContainer.classList.remove('grid');
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
});

// Fetch and display member data
const getMembers = async () => {
    try {
        const response = await fetch('data/members.json');
        if (response.ok) {
            const data = await response.json();
            displayMembers(data);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log(error);
    }
};

// Function to display members in the container
function displayMembers(members) {
    // Clear the container
    membersContainer.innerHTML = '';
    
    // Display each member
    members.forEach(member => {
        // Create the member card
        const card = document.createElement('div');
        card.classList.add('member-card');
        
        // Get membership level class
        let membershipClass = '';
        switch (member.membershipLevel) {
            case 3:
                membershipClass = 'gold-member';
                break;
            case 2:
                membershipClass = 'silver-member';
                break;
            case 1:
                membershipClass = 'member';
                break;
        }
        
        // Add membership class to card
        card.classList.add(membershipClass);
        
        // Populate the card
        card.innerHTML = `
            <img src="images/${member.image}" alt="${member.name} Logo" loading="lazy">
            <h3>${member.name}</h3>
            <p>${member.address}</p>
            <p>${member.phone}</p>
            <p><a href="${member.website}" target="_blank">Website</a></p>
        `;
        
        // Add the card to the container
        membersContainer.appendChild(card);
    });
}

// Call the getMembers function when the page loads
document.addEventListener('DOMContentLoaded', getMembers);