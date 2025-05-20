//funcion para mostrar "bienvendio" conn el nombre de la persona que inciio sesion 
document.addEventListener('DOMContentLoaded', () => {
    fetch('/perfilStudents')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('userName').textContent = data.name;
            } else {
                document.getElementById('userName').textContent = 'Estudiante';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('/materiasDisponibles')
        .then(response => response.json())
        .then(data => {
            console.log('Materias disponibles recibidas del servidor:', data);
            const container = document.getElementById('materias-container');
            container.innerHTML = ''; // Limpiar el contenedor antes de agregar las materias

            if (data.success && data.materias.length > 0) {
                data.materias.forEach(materia => {
                    const card = `
                       <div class="dashboard-card">
                            <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon">
                            <h3>${materia.subject}</h3>
                            <p>Profesor: ${materia.name_teachers}</p>
                            <p>Hora: ${materia.time}</p>
                            <p>Aula: ${materia.classroom}</p>
                            <div class="btn">
                                <button class="inscribir-btn" 
                                    data-subject="${materia.subject}" 
                                    data-classroom="${materia.classroom}" 
                                    data-time="${materia.time}" 
                                    data-name-teachers="${materia.name_teachers}">
                                    Matricular
                                </button>
                            </div>
                        </div>
                    `;
                    container.innerHTML += card;
                });

                // Agregar eventos a los botones "Matricular"
                document.querySelectorAll('.inscribir-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const subject = button.getAttribute('data-subject');
                        const classroom = button.getAttribute('data-classroom');
                        const time = button.getAttribute('data-time');
                        const name_teachers = button.getAttribute('data-name-teachers');

                        // Validar que todos los campos estén presentes
                        if (!subject || !classroom || !time || !name_teachers) {
                            console.error('Error: Faltan datos obligatorios para la inscripción.');
                            alert('Error: Faltan datos obligatorios para la inscripción.');
                            return;
                        }

                        console.log('Datos enviados al servidor:', { subject, classroom, time, name_teachers }); // Verificar los datos enviados
                        fetch('/inscribirMateria', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ subject, classroom, time, name_teachers }) // Enviar solo los datos de la materia
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('Inscripción realizada con éxito');
                                window.location.reload();
                            } else {
                                alert('Error al inscribirse en la materia: ' + data.message);
                            }
                        })
                        .catch(error => console.error('Error al inscribirse en la materia:', error));
                    });
                });
            } else {

                container.innerHTML = '<p>No hay materias disponibles en este momento.</p>';
            }
        })
        .catch(error => console.error('Error al cargar las materias disponibles:', error));
});