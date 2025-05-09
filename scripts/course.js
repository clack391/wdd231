// Course data and filtering functionality
document.addEventListener("DOMContentLoaded", function() {
    // Course data array
    const courses = [
        {
            code: "CSE 121b",
            name: "JavaScript Language",
            credits: 3,
            completed: false
        },
        {
            code: "WDD 230",
            name: "Web Frontend Development I",
            credits: 3,
            completed: false
        },
        {
            code: "WDD 231",
            name: "Web Frontend Development II",
            credits: 3,
            completed: true
        },
        {
            code: "WDD 330",
            name: "Web Frontend Development III",
            credits: 3,
            completed: false
        },
        {
            code: "CSE 341",
            name: "Web Backend Development I",
            credits: 4,
            completed: false
        },
        {
            code: "CSE 350",
            name: "Web Backend Development II",
            credits: 4,
            completed: false
        },
        {
            code: "WDD 430",
            name: "Web Full-Stack Development",
            credits: 4,
            completed: false
        },
        {
            code: "CSE 270",
            name: "Data Structures",
            credits: 3,
            completed: false
        }
    ];

    // Get DOM elements
    const coursesContainer = document.getElementById('courses');
    const totalCreditsElement = document.getElementById('totalCredits');
    const allCoursesBtn = document.getElementById('allCourses');
    const wddCoursesBtn = document.getElementById('wddCourses');
    const cseCoursesBtn = document.getElementById('cseCourses');

    // Function to create course cards
    function displayCourses(courseList) {
        // Clear previous content
        coursesContainer.innerHTML = '';
        
        // If no courses match the filter
        if (courseList.length === 0) {
            coursesContainer.innerHTML = '<p>No courses match the selected filter.</p>';
            return;
        }
        
        // Create a card for each course
        courseList.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = course.completed ? 'course-card course-completed' : 'course-card';
            
            courseCard.innerHTML = `
                <h3>${course.code}</h3>
                <p>${course.name}</p>
                <p>${course.credits} credits</p>
                <p>${course.completed ? '✓ Completed' : 'Not completed'}</p>
            `;
            
            coursesContainer.appendChild(courseCard);
        });
        
        // Calculate and display total credits for filtered courses
        const totalCredits = courseList.reduce((sum, course) => sum + course.credits, 0);
        totalCreditsElement.textContent = `Total Credits: ${totalCredits}`;
    }
    
    // Filter functions
    function filterByType(type) {
        if (type === 'all') {
            return courses;
        } else if (type === 'wdd') {
            return courses.filter(course => course.code.startsWith('WDD'));
        } else if (type === 'cse') {
            return courses.filter(course => course.code.startsWith('CSE'));
        }
        
        return [];
    }
    
    // Set active button and update display
    function setActiveFilter(button, type) {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-buttons button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Filter and display courses
        const filteredCourses = filterByType(type);
        displayCourses(filteredCourses);
    }
    
    // Event listeners for filter buttons
    allCoursesBtn.addEventListener('click', function() {
        setActiveFilter(this, 'all');
    });
    
    wddCoursesBtn.addEventListener('click', function() {
        setActiveFilter(this, 'wdd');
    });
    
    cseCoursesBtn.addEventListener('click', function() {
        setActiveFilter(this, 'cse');
    });
    
    // Initial display - show all courses
    displayCourses(courses);
});