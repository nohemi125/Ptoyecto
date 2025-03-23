// Función para eliminar estudiante (ahora está en el ámbito global)
async function deleteStudent(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        try {
            const response = await fetch(`/students/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            alert(result.message);
            loadStudents(); // Recargar la lista
        } catch (error) {
            console.error('Error al eliminar estudiante:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const studentsTable = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];

    async function loadStudents() {
        try {
            const response = await fetch('/students');  
            const students = await response.json();
            
            studentsTable.innerHTML = '';  

            students.forEach(student => {
                const row = studentsTable.insertRow();
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.first_name}</td>
                    <td>${student.last_name}</td>
                    <td>${student.email}</td>
                    <td>${student.career}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteStudent(${student.id})">Eliminar</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        }
    }

    loadStudents(); 
});
