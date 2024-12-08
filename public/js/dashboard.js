document.addEventListener('DOMContentLoaded', function() {
    // Get user information
    const userType = localStorage.getItem('userType') || 'student';
    const userName = localStorage.getItem('userName') || 'User';

    // Set user information in the UI
    document.getElementById('userGreeting').textContent = `Welcome, ${userName}`;
    document.getElementById('userName').textContent = userName;

    // Set body attribute for role-specific styling
    document.body.setAttribute('data-role', userType);

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;

            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });

            // Show target section
            document.getElementById(targetSection).classList.add('active');

            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            link.classList.add('active');
        });
    });

    // Role-specific functionality
    if (userType === 'teacher') {
        setupTeacherFunctionality();
    } else if (userType === 'employee') {
        setupEmployeeFunctionality();
    } else {
        setupStudentFunctionality();
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
});

function setupStudentFunctionality() {
    // Add any student-specific event listeners or functionality
    console.log('Setting up student dashboard');
}

function setupTeacherFunctionality() {
    // Add event listeners for grade management buttons
    const updateGradeButtons = document.querySelectorAll('.grades-table .action-btn');
    updateGradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, this would open a grade update modal
            alert('Grade update functionality would open here');
        });
    });

    // Add event listeners for class management buttons
    const manageClassButtons = document.querySelectorAll('.course-card .action-btn');
    manageClassButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, this would open class management interface
            alert('Class management interface would open here');
        });
    });
}


  // Evento al hacer clic en el botón de cerrar sesión
  document.getElementById('logoutButton').addEventListener('click', function() {
    // Realizar una solicitud para cerrar la sesión
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Sesión cerrada') {
            // Redirigir al usuario al login o a la página principal
            window.location.href = '/login.html';  // Cambia la URL según tu ruta
        }
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
    });
});

function setupEmployeeFunctionality() {
    // Add event listeners for administrative actions
    const approveButtons = document.querySelectorAll('.action-btn.success');
    const rejectButtons = document.querySelectorAll('.action-btn.danger');
    const generateReportButtons = document.querySelectorAll('.report-card .action-btn');

    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, this would handle request approval
            alert('Request approved');
            this.closest('.request-item').remove();
        });
    });

    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, this would handle request rejection
            alert('Request rejected');
            this.closest('.request-item').remove();
        });
    });

    generateReportButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, this would generate and download reports
            alert('Generating report...');
        });
    });
}
// Evento al hacer clic en el botón de cerrar sesión
document.getElementById('logoutButton').addEventListener('click', function() {
    // Realizar una solicitud para cerrar la sesión
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Sesión cerrada') {
            // Redirigir al usuario al login o a la página principal
            window.location.href = '/login.html';  // Cambia la URL según tu ruta
        }
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
    });
});
