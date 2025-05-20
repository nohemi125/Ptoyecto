// Seleccionamos los elementos
const agregarBtn = document.querySelector('.btn button');
const taskContainer = document.getElementById('taskContainer');
const overlay = document.getElementById('overlay');





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

// Función de cierre de sesión
        document.addEventListener('DOMContentLoaded', () => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Evita que cambie de página
                    cerrarSesion();     // Llama a tu función de cerrar sesión
                });
            }
        });

    function cerrarSesion() {
        fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Sesión cerrada') {
                window.location.href = '/index.html';
            }
        })
        .catch(err => console.error('Error al cerrar sesión:', err));
    }





// Declaramos la variable global afuera para que sea accesible
// Variable global
let materiaSeleccionada = null;

    window.onload = function() {
    fetch('/materiasProfesor')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('materias-container');
            container.innerHTML = '';

            if (data.success && data.materias.length > 0) {
                data.materias.forEach(materia => {
                    const card = `
                        <div class="dashboard-card" data-subject="${materia.subject}" data-classroom="${materia.classroom}" data-time="${materia.time}">
                            <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon">
                            <h3>${materia.subject}</h3>
                            <p>Hora: ${materia.time}</p>
                            <p>Aula: ${materia.classroom}</p>
                        </div>
                    `;
                    container.innerHTML += card;
                });
            } else {
                container.innerHTML = '<p>No tienes materias matriculadas aún.</p>';
            }

            const agregarCard = `
                <div class="dashboard-card">
                    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon">
                    <button onclick="window.location.href='/matricularMateria'">Agregar</button>
                </div>
            `;
            container.innerHTML += agregarCard;

            // Listener para las tarjetas
            document.querySelectorAll('.dashboard-card[data-subject]').forEach(card => {
                card.addEventListener('click', function () {
                    const materia = card.getAttribute('data-subject');
                    const classroom = card.getAttribute('data-classroom');
                    const time = card.getAttribute('data-time');
                    if (materia) {
                        document.getElementById('modalTitulo').textContent = materia;
                        document.getElementById('materia').value = materia;
                        document.getElementById('classroom').value = classroom;
                        materiaSeleccionada = { subject: materia, classroom, time };
                        document.getElementById('modalOpciones').style.display = 'block';
                    }
                });
            });
        })
        .catch(error => console.error('Error al cargar las materias:', error));
}


            function verEstudiantes() {
            console.log('Función verEstudiantes llamada. Materia:', materiaSeleccionada);
            if (!materiaSeleccionada || !materiaSeleccionada.subject) {
                alert('Por favor, selecciona una materia primero.');
                return;
            }

            // Usamos solo el nombre de la materia para hacer la petición
            fetch(`/estudiantes/${encodeURIComponent(materiaSeleccionada.subject)}`)
                .then(response => response.json())
                .then(estudiantes => {
                console.log('Estudiantes recibidos:', estudiantes);
                const tbody = document.getElementById('tablaEstudiantes');
                tbody.innerHTML = '';

                estudiantes.forEach(est => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                    <td>${est.id}</td>
                    <td>${est.first_name}</td>
                    <td>${est.last_name}</td>
                    <td>${est.email}</td>
                    <td>${est.career}</td>
                    `;
                    tbody.appendChild(fila);
                });
                })
                .catch(err => {
                console.error('Error al obtener estudiantes:', err);
                });
            }







            function cerrarModal() {
            document.getElementById('modalOpciones').style.display = 'none';
            }

        function agregarTarea() {
        cerrarModal();
        document.getElementById('contenidoPrincipal').style.display = 'none';
        document.getElementById('seccionTareas').style.display = 'block';
        // El valor de materia ya está puesto por el click en la tarjeta
    }







            function verEstudiantes() {
            cerrarModal();
            document.getElementById('contenidoPrincipal').style.display = 'none';
            document.getElementById('vistaEstudiantes').style.display = 'block';

            const materia = materiaSeleccionada.subject || 'Desconocida';

            fetch(`/estudiantes/${encodeURIComponent(materia)}`)
                .then(response => response.json())
                .then(estudiantes => {
                const tbody = document.getElementById('tablaEstudiantes');
                tbody.innerHTML = '';

                estudiantes.forEach(est => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                    <td>${est.id}</td>
                    <td>${est.first_name}</td>
                    <td>${est.last_name}</td>
                    <td>${est.email}</td>
                    <td>${est.career}</td>
                    `;
                    tbody.appendChild(fila);
                });
                })
                .catch(err => {
                console.error('Error al obtener estudiantes:', err);
                });
            }


            function volverAlModal() {
            document.getElementById('vistaEstudiantes').style.display = 'none';
            document.getElementById('modalOpciones').style.display = 'block';
            // Mostrar el contenido principal
            document.getElementById('contenidoPrincipal').style.display = 'block';
            // Ocultar la sección de tareas
            document.getElementById('seccionTareas').style.display = 'none';
            }

            function volverAVistaPrincipal() {
            document.getElementById('contenidoPrincipal').style.display = 'block';
            document.getElementById('vistaEstudiantes').style.display = 'none';
            // Aquí puedes mostrar otra vista si tienes una
            }











// Función para mostrar estudiantes
// function verEstudiantes() {
//   cerrarModal(); // Oculta el modal
//   document.getElementById('contenidoPrincipal').style.display = 'none';
//   document.getElementById('vistaEstudiantes').style.display = 'block';
//   cargarEstudiantes(); // Llama al servidor para llenar la tabla
// }



// function cargarEstudiantes() {
//   fetch('http://localhost:3000/students')
//     .then(response => response.json())
//     .then(data => {
//       const cuerpoTabla = document.getElementById('tablaEstudiantes');
//       cuerpoTabla.innerHTML = ''; // Limpiar antes de agregar

//       data.forEach(estudiante => {
//         const fila = document.createElement('tr');
//         fila.innerHTML = `
//           <td>${estudiante.id}</td>
//           <td>${estudiante.first_name}</td>
//           <td>${estudiante.last_name}</td>
//           <td>${estudiante.email}</td>
//           <td>${estudiante.career}</td>
//         `;
//         cuerpoTabla.appendChild(fila);
//       });

//       document.getElementById('vistaEstudiantes').style.display = 'block';
//     })
//     .catch(error => console.error('Error al cargar estudiantes:', error));
// }







//funcion para enviara tareas a los estdiantes

document.getElementById('formTarea').addEventListener('submit', function (e)
 {
    e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    // Capturar los datos del formulario
    const subject = document.getElementById('materia').value;
    const classroom = document.getElementById('classroom').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const time = document.getElementById('time').value;
    const due_date = document.getElementById('due_date').value;



    // Validaciones
    if (!subject || !classroom || !title || !description) {
        showError('Todos los campos son obligatorios');
        return;
    }


    

    // Crear un objeto con los datos del formulario
    const tarea = {
        subject,
        classroom,
        title,
        description,
        time,
        due_date
        
    };
 console.log('Datos enviados al servidor:', tarea); 
    // Enviar los datos al servidor usando fetch
    fetch('/asignarTarea', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include', // 👈 Esto mantiene la sesión
    body: JSON.stringify(tarea)
})
.then(async response => {
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
            const err = await response.json();
            throw new Error(err.error || 'Error en la petición');
        } else {
            const text = await response.text();
            throw new Error(text || 'Error desconocido');
        }
    }

    // Si es una respuesta válida
    return contentType && contentType.includes("application/json") 
        ? response.json() 
        : {};
        })
        .then(data => {
            console.log('✅ Tarea asignada correctamente:', data);
            alert(' Tarea asignada correctamente');
        })
        .catch(error => {
            console.error('❌ Error al asignar tarea:', error.message);
            alert('Hubo un problema al enviar la tarea: ' + error.message);
        });
            // Limpiar el formulario después de enviar
            document.getElementById('formTarea').reset();
            // Volver a la vista principal
            volverAVistaPrincipal();
        });





