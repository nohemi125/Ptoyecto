// // Función para eliminar estudiante (ahora está en el ámbito global)
// async function deleteStudent(id) {
//     if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
//         try {
//             const response = await fetch(`/students/${id}`, {
//                 method: 'DELETE'
//             });
//             const result = await response.json();
//             alert(result.message);
//             loadStudents(); // Recargar la lista
//         } catch (error) {
//             console.error('Error al eliminar estudiante:', error);
//         }
//     }
// }

// document.addEventListener('DOMContentLoaded', function() {
//     const studentsTable = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];

//     async function loadStudents() {
//         try {
//             const response = await fetch('/students');  
//             const students = await response.json();
            
//             studentsTable.innerHTML = '';  

//             students.forEach(student => {
//                 const row = studentsTable.insertRow();
//                 row.innerHTML = `
//                     <td>${student.id}</td>
//                     <td>${student.first_name}</td>
//                     <td>${student.last_name}</td>
//                     <td>${student.email}</td>
//                     <td>${student.career}</td>
//                     <td>
//                         <button class="delete-btn" onclick="deleteStudent(${student.id})">Eliminar</button>
//                     </td>
//                 `;
//             });
//         } catch (error) {
//             console.error('Error al cargar estudiantes:', error);
//         }
//     }

//     loadStudents(); 
// });

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const classroom = urlParams.get('classroom');
    const time = urlParams.get('time');

    console.log('Parámetros enviados al backend:', { subject, classroom, time });

    fetch(`/estudiantesMateria?subject=${encodeURIComponent(subject)}&classroom=${encodeURIComponent(classroom)}&time=${encodeURIComponent(time)}`)
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del backend:', data);

            const tableBody = document.querySelector('#studentsTable tbody');
            tableBody.innerHTML = '';

            if (data.success && data.estudiantes.length > 0) {
                data.estudiantes.forEach(estudiante => {
                    const row = `
                        <tr>
                            <td>${estudiante.id}</td>
                            <td>${estudiante.first_name}</td>
                            <td>${estudiante.last_name}</td>
                            <td>${estudiante.email}</td>
                            <td>${estudiante.career}</td>
                            <td>
                                <button class="delete-btn" onclick="deleteStudent(${estudiante.id})">Eliminar</button>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6">No hay estudiantes inscritos en esta materia.</td></tr>';
            }
        })
        .catch(error => console.error('Error al cargar los estudiantes:', error));
});

// Función para eliminar un estudiante
function eliminarEstudiante(studentId) {
    fetch(`/students/${studentId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        window.location.reload(); // Recargar la página para actualizar la tabla
    })
    .catch(error => console.error('Error al eliminar el estudiante:', error));
}
