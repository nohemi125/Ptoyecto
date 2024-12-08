
// students.js

document.addEventListener('DOMContentLoaded', function() {
    const studentsTable = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const closeModal = document.getElementById('closeModal');
    const studentForm = document.getElementById('studentForm');

    // Función para cargar los estudiantes desde el servidor
    function loadStudents() {
        fetch('http://localhost:3000/get-students')  // Endpoint para obtener los estudiantes
            .then(response => response.json())
            .then(data => {
                studentsTable.innerHTML = '';  // Limpiar la tabla antes de agregar filas
                data.forEach(student => {
                    const row = studentsTable.insertRow();
                    row.innerHTML = `
                        <td>${student.first_name} ${student.last_name}</td>
                        <td>${student.email}</td>
                        <td>${student.career}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Eliminar</button>
                        </td>
                    `;
                });
            })
            .catch(err => console.error('Error al cargar los estudiantes:', err));
    }

    // Función para eliminar un estudiante
    function deleteStudent(studentId) {
        fetch(`http://localhost:3000/delete-student/${studentId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadStudents();  // Recargar los estudiantes
        })
        .catch(err => console.error('Error al eliminar el estudiante:', err));
    }

    // Función para mostrar el formulario emergente
    addStudentBtn.addEventListener('click', function() {
        studentModal.style.display = 'block'; // Mostrar el modal
    });

    // Función para cerrar el modal
    closeModal.addEventListener('click', function() {
        studentModal.style.display = 'none'; // Ocultar el modal
    });

    // Función para agregar un nuevo estudiante
    studentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const career = document.getElementById('career').value;
        const password = document.getElementById('password').value;

        // Enviar datos al servidor para agregar un estudiante
        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, career, password })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            studentModal.style.display = 'none'; // Cerrar el modal
            loadStudents();  // Recargar la lista de estudiantes
        })
        .catch(err => console.error('Error al agregar el estudiante:', err));
    });

    // Cargar los estudiantes al cargar la página
    loadStudents();
});
