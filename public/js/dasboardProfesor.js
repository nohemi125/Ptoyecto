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





        // Variable global
            let materiaSeleccionada = null;

                window.onload = function() {+
                fetch('/materiasProfesor')
                    .then(response => response.json())
                    .then(data => {
                        const container = document.getElementById('materias-container');
                        container.innerHTML = '';

                        if (data.success && data.materias.length > 0) {
                            data.materias.forEach(materia => {
                                const card = `
                                    <div class="dashboard-card" data-subject="${materia.subject}" data-classroom="${materia.classroom}" data-time="${materia.time}">
                                        <div class="card-header-horizontal">
                                            <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon-horizontal">
                                            <h3>${materia.subject}</h3>
                                        </div>
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
                             <div class="dashboard-card agregar-materia-card" onclick="window.location.href='/matricularMateria'">
                                <div class="agregar-materia-contenido">
                                    <div class="agregar-materia-icono">
                                        <i class="fas fa-plus-circle"></i>
                                    </div>
                                    <div class="agregar-materia-titulo">
                                        Agregar otra materia
                                    </div>
                                </div>
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
      }




            function volverAlModal() {
            document.getElementById('vistaEstudiantes').style.display = 'none';
            document.getElementById('modalOpciones').style.display = 'block';
            // Mostrar el contenido principal
            document.getElementById('contenidoPrincipal').style.display = 'block';
            document.getElementById('seccionTareas').style.display = 'none';
            }

            function volverAVistaPrincipal() {
            document.getElementById('contenidoPrincipal').style.display = 'block';
            document.getElementById('vistaEstudiantes').style.display = 'none';
            }




                //funcion para enviara tareas a los estdiantes

               document.getElementById('formTarea').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = this;
    const formData = new FormData(form);

    fetch('/asignarTarea', {
        method: 'POST',
        body: formData,
        credentials: 'include'
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
        return contentType && contentType.includes("application/json") 
            ? response.json() 
            : {};
    })
    .then(data => {
        alert('Tarea asignada correctamente');
        form.reset();
    })
    .catch(error => {
        alert('Hubo un problema al enviar la tarea: ' + error.message);
    });
});       

function cerrarForm(){
                    document.getElementById('seccionTareas').style.display = 'none';
                    document.getElementById('modalOpciones').style.display = 'block';
                    document.getElementById('contenidoPrincipal').style.display = 'block';
                    document.getElementById('vistaEstudiantes').style.display = 'none';
                    document.getElementById('vistaRespuestas').style.display = 'none';
                }



        // FUNCION PARA MOSTRAR LAS TAREAS RESPONDIDAS DEL ESTUDIANTE EN LA VISTA DEL PROFESOR
                function registroTareas() {
                    if (!materiaSeleccionada) {
                        alert('Selecciona una materia primero');
                        return;
                    }
                    
                    // Ocultar todas las vistas
                    document.getElementById('vistaTareasEnviadas').style.display = 'none';
                    document.getElementById('vistaEstudiantes').style.display = 'none';
                    document.getElementById('seccionTareas').style.display = 'none';
                    document.getElementById('modalOpciones').style.display = 'none';
                    document.getElementById('contenidoPrincipal').style.display = 'none';

                    // Mostrar la vista de respuestas
                    const vistaRespuestas = document.getElementById('vistaRespuestas');
                    vistaRespuestas.style.display = 'block';

                    // Obtener y mostrar las respuestas
                    fetch(`/respuestas-tareas-profesor?subject=${encodeURIComponent(materiaSeleccionada.subject)}&classroom=${encodeURIComponent(materiaSeleccionada.classroom)}`)
                        .then(response => response.json())
                        .then(data => {
                            const tabla = document.getElementById('tablaRespuestas');
                            tabla.innerHTML = '';
                            
                            if (data.success && data.respuestas.length > 0) {
                                data.respuestas.forEach(respuesta => {
                                    const row = document.createElement('tr');
                                    row.setAttribute('data-respuesta-id', respuesta.id);
                                    row.innerHTML = `
                                        <td>${respuesta.first_name} ${respuesta.last_name}</td>
                                        <td>${respuesta.title}</td>
                                        <td>${respuesta.respuesta}</td>
                                        <td>${respuesta.fecha_respuesta}</td>
                                        <td>${respuesta.archivo ? `<a href="/uploads/${respuesta.archivo}" target="_blank">Ver archivo</a>` : 'No hay archivo'}</td>
                                        <td>
                                            <input type="number" min="0" max="100" id="nota_${respuesta.id}" placeholder="0-100" style="width: 60px; margin-right: 5px;">
                                            <button onclick="calificarTarea(${respuesta.id})" class="btn-calificar">
                                                Calificar
                                            </button>
                                        </td>
                                    `;
                                    tabla.appendChild(row);
                                });
                            } else {
                                tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay respuestas pendientes</td></tr>';
                            }
                        })
                        .catch(error => {
                            console.error('Error al cargar respuestas:', error);
                            alert('Error al cargar las respuestas');
                        });
                }

                        function volverAlModal() {
                    document.getElementById('vistaRespuestas').style.display = 'none';
                    document.getElementById('contenidoPrincipal').style.display = 'block';
                }


            //FUNCION QUE CIERRA la tabla RESPUESTAS DE LOS ESTDUIANTES A LAS TAREAS

            function volverRespuestas() {
                document.getElementById('vistaRespuestas').style.display = 'none';
                document.getElementById('vistaEstudiantes').style.display = 'none';
                document.getElementById('seccionTareas').style.display = 'none';
                document.getElementById('modalOpciones').style.display = 'none';
                document.getElementById('tablaRespuestas').innerHTML = '';
                const tablaEstudiantes = document.getElementById('tablaEstudiantes');
                if (tablaEstudiantes) tablaEstudiantes.innerHTML = '';
                document.getElementById('contenidoPrincipal').style.display = 'block';
            }



    // FUNCION PARA MOSTRAR A LOS ESTDUIANTES QUE SE MATRICULARON EN UNA MATERIA EN ESPECIFICO
        function verEstudiantes() {
            console.log("Materia seleccionada:", materiaSeleccionada);
                    document.getElementById('modalOpciones').style.display = 'none';
                    document.getElementById('contenidoPrincipal').style.display = 'none';
                    document.getElementById('seccionTareas').style.display = 'none';

                fetch(`/estudiantes-materias?subject=${encodeURIComponent(materiaSeleccionada.subject)}`)

                .then(response => response.json())
                .then(data => {
                    console.log("Datos recibidos del backend:", data);
                    const tbody = document.getElementById('tablaEstudiantes');
                    tbody.innerHTML = '';

                    if (data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5">No hay estudiantes matriculados en esta materia</td></tr>';
                    } else {
                        data.forEach(estudiante => {
                            tbody.innerHTML += `
                                <tr>
                                    <td>${estudiante.id}</td>
                                    <td>${estudiante.first_name}</td>
                                    <td>${estudiante.last_name}</td>
                                    <td>${estudiante.email}</td>
                                    <td>${estudiante.career}</td>
                                </tr>
                            `;
                        });
                    }

                    document.getElementById('vistaEstudiantes').style.display = 'block';
                })
                .catch(error => {
                    console.error('Error al cargar estudiantes:', error);
                });
               }



// funcion para er todos los estudiantes que ven materia con el profesor

function verTodosEstudiantes() {
    // Oculta el contenido principal
    document.getElementById('contenidoPrincipal').style.display = 'none';
    // Muestra la tabla de todos los estudiantes
    document.getElementById('vistaTodosEstudiantes').style.display = 'block';

    // Toma el id_teacher de la sesión o de la URL
    const params = new URLSearchParams(window.location.search);
    const query = params.toString() ? '?' + params.toString() : '';

    fetch('/todos-estudiantes-del-profesor' + query, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tablaTodosEstudiantes');
            tbody.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(est => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${est.id}</td>
                            <td>${est.first_name}</td>
                            <td>${est.last_name}</td>
                            <td>${est.career}</td>
                            <td>${est.email}</td>
                            <td>${est.subject}</td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6">No hay estudiantes para este profesor</td></tr>';
            }
        })
        .catch(err => {
            console.error('Error al cargar estudiantes:', err);
        });
}

function cerrarTodosEstudiantes() {
    document.getElementById('vistaTodosEstudiantes').style.display = 'none';
    document.getElementById('contenidoPrincipal').style.display = 'block';
    document.getElementById('sesionTareas').style.display = 'none';
    document.getElementById('vistaTodosEstudiantes').style.display = 'none';
    document.getElementById('sesionTareas').style.display = 'none';


    
}



// funcion para ver tareas enviadas
function verTareasEnviadas() {
    document.getElementById('contenidoPrincipal').style.display = 'none';
    document.getElementById('vistaTareasEnviadas').style.display = 'block';
    document.getElementById('modalOpciones').style.display = 'none';

    fetch('/tareas-enviadas-profesor', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tablaTareasEnviadas');
            tbody.innerHTML = '';
            if (data.success && data.tareas.length > 0) {
                data.tareas.forEach(tarea => {
    tbody.innerHTML += `
        <tr>
            <td>${tarea.title}</td>
            <td>${tarea.description}</td>
            <td>
                ${tarea.file ? `<a href="/uploads/${tarea.file}" target="_blank">Ver archivo</a>` : 'No hay archivo'}
            </td>
            <td>${tarea.time}</td>
            <td>${tarea.due_date ? tarea.due_date.split('T')[0] : ''}</td>
            <td>
                ${
                    tarea.tiene_calificadas == 1
                        ? `<button class="btn-accion btn-editar" disabled style="opacity:0.5;cursor:not-allowed;"><i class="fas fa-edit"></i> Editar</button>
                           <button class="btn-accion btn-eliminar" disabled style="opacity:0.5;cursor:not-allowed;"><i class="fas fa-trash"></i> Eliminar</button>`
                        : `<button class="btn-accion btn-editar" onclick="abrirEditarTarea(${tarea.id}, '${tarea.title.replace(/'/g, "\\'")}', '${tarea.description.replace(/'/g, "\\'")}', '${tarea.time}', '${tarea.due_date}')">
                               <i class="fas fa-edit"></i> Editar
                           </button>
                           <button class="btn-accion btn-eliminar" onclick="eliminarTarea(${tarea.id})">
                               <i class="fas fa-trash"></i> Eliminar
                           </button>`
                            }
                        </td>
                    </tr>
                `;
            });
                        } else {
                       tbody.innerHTML = '<tr><td colspan="5">No hay tareas enviadas.</td></tr>';
                    }
                });
        }

            function cerrarVistaTareasEnviadas() {
                document.getElementById('vistaTareasEnviadas').style.display = 'none';
                document.getElementById('contenidoPrincipal').style.display = 'block';
            }



// fucnion para editar o eliminar tareas que envi el profesor
function verTareasEnviadas() {
    if (!materiaSeleccionada) {
        alert('Selecciona una materia primero');
        return;
    }
    document.getElementById('contenidoPrincipal').style.display = 'none';
    document.getElementById('vistaTareasEnviadas').style.display = 'block';

    fetch(`/tareas-enviadas-profesor?subject=${encodeURIComponent(materiaSeleccionada.subject)}&classroom=${encodeURIComponent(materiaSeleccionada.classroom)}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tablaTareasEnviadas');
            tbody.innerHTML = '';
            if (data.success && data.tareas.length > 0) {
                data.tareas.forEach(tarea => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${tarea.title}</td>
                            <td>${tarea.description}</td>
                            <td>
                                ${
                                    tarea.file
                                    ? `<a href="/uploads/${tarea.file}" target="_blank">Ver archivo</a>`
                                    : 'No hay archivo'
                                }
                                </td>
                                <td>${tarea.time}</td>
                                 <td>${tarea.due_date ? tarea.due_date.split('T')[0] : ''}</td>
                               <td>
                                <button class="btn-accion btn-editar" onclick="abrirEditarTarea(${tarea.id}, '${tarea.title.replace(/'/g, "\\'")}', '${tarea.description.replace(/'/g, "\\'")}', '${tarea.time}', '${tarea.due_date}')">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="btn-accion btn-eliminar" onclick="eliminarTarea(${tarea.id})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5">No hay tareas enviadas.</td></tr>';
            }
        });
}


// Abrir modal para editar tarea
function abrirEditarTarea(id, title, description, time, due_date) {
    document.getElementById('editarTituloTarea').value = title;
    document.getElementById('editarDescripcionTarea').value = description;
    document.getElementById('editarArchivoTarea').value = '';
    document.getElementById('editarHoraTarea').value = time;
    document.getElementById('editarFechaTarea').value = due_date ? due_date.split('T')[0] : '';
    document.getElementById('modalEditarTarea').style.display = 'block';
    // Guarda el id de la tarea que se está editando
    window.tareaEditandoId = id;
}

// Cerrar modal de edición
function cerrarModalEditarTarea() {
    document.getElementById('modalEditarTarea').style.display = 'none';
}

// Guardar cambios de edición
function guardarEdicionTarea() {
    const id = window.tareaEditandoId;
    const title = document.getElementById('editarTituloTarea').value;
    const description = document.getElementById('editarDescripcionTarea').value;
    const time = document.getElementById('editarHoraTarea').value;
    const due_date = document.getElementById('editarFechaTarea').value;

    fetch('/editar-tarea', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, description, time, due_date })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Tarea actualizada');
            cerrarModalEditarTarea();
            verTareasEnviadas();
        } else {
            alert('No se pudo actualizar');
        }
    });
}

// Eliminar tarea
function eliminarTarea(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        fetch('/eliminar-tarea', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                verTareasEnviadas(); // Actualizar la vista
            } else {
                alert(data.message || 'No se pudo eliminar la tarea');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar la tarea');
        });
    }
}

function cerrarVistaTareasMateria() {
    document.getElementById('vistaTareasMateria').style.display = 'none';
    document.getElementById('contenidoPrincipal').style.display = 'block';
}






// FUCNION PARA CALIFICAR LAS TAREAS RESPONDIDAS POR LOS ESTUDIANTES
function calificarTarea(id_respuesta) {
    const nota = document.getElementById('nota_' + id_respuesta).value;
    
    if (!nota) {
        alert('Por favor ingrese una calificación');
        return;
    }

    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
        alert('Por favor ingrese una calificación válida entre 0 y 100');
        return;
    }

    fetch('/calificar-tarea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_respuesta, nota: notaNum })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Eliminar la fila de la tabla de respuestas
            const fila = document.querySelector(`tr[data-respuesta-id="${id_respuesta}"]`);
            if (fila) {
                fila.remove();
            }

            // Verificar si quedan respuestas por calificar
            const tabla = document.getElementById('tablaRespuestas');
            if (tabla.children.length === 0) {
                tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay respuestas pendientes por calificar</td></tr>';
            }

            // Mostrar mensaje de éxito
            alert('Tarea calificada exitosamente');
        } else {
            alert('Error al calificar la tarea');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al calificar la tarea');
    });
}



function verTareasCalificadas() {
    if (!materiaSeleccionada) {
        alert('Selecciona una materia primero');
        return;
    }

    console.log('Materia seleccionada:', materiaSeleccionada);

    // Ocultar todas las vistas
    document.getElementById('vistaTareasEnviadas').style.display = 'none';
    document.getElementById('vistaRespuestas').style.display = 'none';
    document.getElementById('vistaEstudiantes').style.display = 'none';
    document.getElementById('seccionTareas').style.display = 'none';
    document.getElementById('modalOpciones').style.display = 'none';
    document.getElementById('contenidoPrincipal').style.display = 'none';

    // Mostrar la vista de notas
    const vistaNotas = document.getElementById('vistaNotas');
    vistaNotas.style.display = 'block';

    // Mostrar mensaje de carga
    const tabla = document.getElementById('tablaCalificaciones');
    tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando tareas calificadas...</td></tr>';

    const url = `/tareas-calificadas-profesor?subject=${encodeURIComponent(materiaSeleccionada.subject)}&classroom=${encodeURIComponent(materiaSeleccionada.classroom)}`;
    console.log('Haciendo petición a:', url);

    // Obtener y mostrar las tareas calificadas
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('Respuesta recibida:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos recibidos:', data);
        tabla.innerHTML = '';
        
        if (data.success && data.tareas && data.tareas.length > 0) {
            data.tareas.forEach(tarea => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tarea.title || ''}</td>
                    <td>${tarea.description || ''}</td>
                    <td>${tarea.time || ''}</td>
                    <td>${tarea.due_date || ''}</td>
                    <td>${tarea.nota || ''}</td>
                    <td>${(tarea.first_name || '')} ${(tarea.last_name || '')}</td>
                `;
                tabla.appendChild(row);
            });
        } else {
            tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay tareas calificadas</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error al cargar tareas calificadas:', error);
        tabla.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar las tareas calificadas</td></tr>';
    });
}

function volverARespuestas() {
    // Ocultar la vista de notas
    document.getElementById('vistaNotas').style.display = 'none';
    
    // Mostrar la vista de respuestas
    document.getElementById('vistaRespuestas').style.display = 'block';
}


