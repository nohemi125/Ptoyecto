// Seleccionamos los elementos
const agregarBtn = document.querySelector('.btn button');
const taskContainer = document.getElementById('taskContainer');
const overlay = document.getElementById('overlay');

// Función para mostrar la ventana emergente
agregarBtn.addEventListener('click', () => {
    taskContainer.style.display = 'block';  // Muestra la ventana emergente
    overlay.style.display = 'block'; // Muestra la superposición
});

// Función para cerrar la ventana emergente al hacer clic en la superposición
overlay.addEventListener('click', () => {
    taskContainer.style.display = 'none';  // Oculta la ventana emergente
    overlay.style.display = 'none'; // Oculta la superposición
});

//funcion para mostrar "bienvendio" conn el nombre de la persona que inciio sesion 
document.addEventListener('DOMContentLoaded', () => {
    fetch('/perfilProfesor')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('userName').textContent = data.name;
            } else {
                document.getElementById('userName').textContent = 'Profesor';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

    window.onload = function() {
        console.log("Cargando materias...");
        fetch('/materiasProfesor')
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('materias-container');
                container.innerHTML = ''; // Limpia todo antes de renderizar

                if (data.success && data.materias.length > 0) {
                    data.materias.forEach(materia => {
                        const card = `
                            <div class="dashboard-card">
                                <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon">
                                <h3>${materia.subject}</h3>
                                <p>Hora: ${materia.time}</p>
                                <p>Aula: ${materia.classroom}</p>
                                <a href="#">Students</a>
                                <div class="btn">
                                    <button>Agregar Tareas</button>
                                </div>
                            </div>
                        `;
                        container.innerHTML += card;
                    });
                } else {
                    container.innerHTML = '<p>No tienes materias matriculadas aún.</p>';
                }

                // 👉 Al final agregas el botón "Agregar Materia"
                const agregarCard = `
                    <div class="dashboard-card">
                        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon">
                        <button onclick="window.location.href='/matricularMateria'">Agregar</button>
                    </div>
                `;
                container.innerHTML += agregarCard;
            })
            .catch(error => console.error('Error al cargar las materias:', error));
    }



       