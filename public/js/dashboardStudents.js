// Seleccionamos los elementos
const agregarBtn = document.querySelector('.btn button');
const taskContainer = document.getElementById('taskContainer');
const overlay = document.getElementById('overlay');







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


//  funcion deñ botón de cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', function() {

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
            window.location.href = '/index.html';  // Cambia la URL según tu ruta
        }
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
    });
});




//funion paa agregar otra materia
document.getElementById('addBtn').addEventListener('click', function() {

    fetch('/inscribirMateria', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
            // Redirigir al usuario al login o a la página principal
            window.location.href = '/Mstudents.html';  // Cambia la URL según tu ruta
    
});






//ruta para mostrar las materias que el estudiante ya se inscribió en su dashboard
// Solo cargar materias inscritas por el estudiante
document.addEventListener('DOMContentLoaded', () => {
    fetch('/materiasEstudiante')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('materias-container');
            container.innerHTML = '';
            if (data.success && data.materias.length > 0) {
                data.materias.forEach(materia => {
                    const card = document.createElement('div');
                    card.className = 'dashboard-card';
                    card.innerHTML = `
                       <div class="card-header-horizontal">
                            <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg" alt="Courses" class="card-icon-horizontal">
                            <h3>${materia.subject}</h3>
                        </div>
                        <p>Profesor: ${materia.name_teachers}</p>
                        <p>Hora: ${materia.time}</p>
                        <p>Aula: ${materia.classroom}</p>
                    `;
                             if (materia.tieneTareasPendientes) { // Cambia esto según tu backend
        mostrarToast(`Tienes tareas en "${materia.subject}"`);
    }
        
                    card.addEventListener('click', function () {
                        materiaSeleccionada = {
                            subject: materia.subject,
                            profesor: materia.name_teachers,
                            classroom: materia.classroom,
                            time: materia.time
                        };
                        document.getElementById('modalTitulo').textContent = materia.subject;
                        document.getElementById('modalOpciones').style.display = 'block'; // Mostrar el modal de opciones
                    });

                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p>No tienes materias matriculadas aún.</p>';
            }
        })
        .catch(error => console.error('Error al cargar las materias del estudiante:', error));
});



// //funciones para cerrar el modal de opciones
function cerrarModal() {
  document.getElementById('modalOpciones').style.display = 'none';
  document.getElementById('modalTareas').style.display = 'none';
    
}

function volverAlDashboard() {
    document.getElementById('seccionTareas').style.display = 'none';
    document.getElementById('modalOpciones').style.display = 'none';
    document.getElementById('modalTareas').style.display = 'none';
    document.getElementById('materias-container').style.removeProperty('display'); // ✅ Restaurar el CSS original
    document.getElementById('user').style.display = 'block';
}




// Función para mostrar el modal de tareas

function verTareas() {
    if (!materiaSeleccionada) {
        alert('Selecciona una materia primero.');
        return;
    }
    fetch(`/tareasMateria?subject=${encodeURIComponent(materiaSeleccionada.subject)}&classroom=${encodeURIComponent(materiaSeleccionada.classroom)}&time=${encodeURIComponent(materiaSeleccionada.time)}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#tablaTareasModal tbody');
            tbody.innerHTML = '';
            if (data.success && data.tareas.length > 0) {
                data.tareas.forEach((tarea) => {
                   // ...dentro de data.tareas.forEach((tarea) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="titulo-tarea">${tarea.title}</td>`;
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                tareaSeleccionada = tarea; // <-- Guarda el id e la tarea aquí
                console.log('🔍 Tarea seleccionada:', tarea);

                document.getElementById('user').style.display = 'none';
                document.getElementById('modalTareas').style.display = 'none';
                document.getElementById('materias-container').style.display = 'none';
                document.getElementById('seccionTareas').style.display = 'block';

               
                const h4s = document.querySelectorAll('#seccionTareas .input-container h4');
                if (h4s.length >= 4) {
                    h4s[0].textContent = materiaSeleccionada.subject;
                    h4s[1].textContent = 'Profe: ' + (materiaSeleccionada.profesor || '');
                    h4s[2].textContent = 'Título: ' + tarea.title;
                    h4s[3].textContent = 'Descripción: ' + (tarea.description || '');
                }
            });
            tbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>No hay tareas asignadas.</td>`;
                tbody.appendChild(tr);
            }
            document.getElementById('modalOpciones').style.display = 'none';
            document.getElementById('modalTareas').style.display = 'block';
        })
        .catch(error => {
            alert('Error al cargar las tareas');
            console.error(error);
        });
}

   
      // Función para manejar la selección de una tarea
      function seleccionarTarea(titulo) {
        alert('Tarea seleccionada: ' + titulo);
      }


      
document.getElementById('responder').addEventListener('click', function () {
    const respuesta = document.getElementById('description').value;
  

    if (!respuesta.trim()) {
        alert('Por favor escribe tu respuesta.');
        return;
    }

    if (!tareaSeleccionada) {
        alert('No hay ninguna tarea seleccionada.');
        return;
    }

    const id_tarea = tareaSeleccionada.id;
    console.log('🔍 ID de tarea seleccionada:', id_tarea);


    fetch('/responderTarea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_tarea,
            respuesta
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Respuesta enviada correctamente');
            document.getElementById('description').value = ''; // limpia el textarea
        } else {
            alert('❌ No se pudo enviar la respuesta');
        }
    })
    .catch(err => {
        console.error(err);
        alert('⚠️ Error al enviar la respuesta');
    });
});





// registros de las tareas que ha enviado el estduiante
function verRegistros() {
    if (!materiaSeleccionada) {
        alert('Selecciona una materia primero.');
        return;
    }
    // Oculta otras vistas
    document.getElementById('modalOpciones').style.display = 'none';
    document.getElementById('materias-container').style.display = 'none';
    document.getElementById('seccionTareas').style.display = 'none';
    document.getElementById('user').style.display = 'none';
    document.getElementById('vistaRegistros').style.display = 'block';

    // Envía subject y classroom como query params
    fetch(`/registros-tareas-estudiante?subject=${encodeURIComponent(materiaSeleccionada.subject)}&classroom=${encodeURIComponent(materiaSeleccionada.classroom)}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tablaRegistros');
            tbody.innerHTML = '';
            if (data.success && data.registros.length > 0) {
                data.registros.forEach(reg => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${reg.title}</td>
                            <td>${reg.respuesta}</td>
                            <td>${new Date(reg.fecha_respuesta).toLocaleString()}</td>
                         <td>
                         <button class="btn-accion btn-editar" onclick="abrirEditarRespuesta(${reg.id_respuesta}, '${reg.respuesta.replace(/'/g, "\\'")}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarRespuesta(${reg.id_respuesta})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                        </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No hay registros.</td></tr>';
            }
        })
        .catch(err => {
            alert('Error al cargar los registros');
            console.error(err);
        });
}
function volverAlDashboardDesdeRegistros() {
    document.getElementById('vistaRegistros').style.display = 'none';
    document.getElementById('materias-container').style.display = 'flex';
    document.getElementById('user').style.display = 'block';
}






// funcion para eliminar o editar una tarea enviada
let idRespuestaSeleccionada = null;

// Abrir modal de edición
function abrirEditarRespuesta(id_respuesta, respuesta) {
    idRespuestaSeleccionada = id_respuesta;
    document.getElementById('editarRespuestaTextarea').value = respuesta;
    document.getElementById('modalEditarRespuesta').style.display = 'block';
}

function cerrarModalEditarRespuesta() {
    document.getElementById('modalEditarRespuesta').style.display = 'none';
}

// Guardar edición
function guardarEdicionRespuesta() {
    const nuevaRespuesta = document.getElementById('editarRespuestaTextarea').value;
    fetch('/editar-respuesta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_respuesta: idRespuestaSeleccionada, respuesta: nuevaRespuesta })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Respuesta actualizada');
            cerrarModalEditarRespuesta();
            verRegistros(); 
        } else {
            alert('No se pudo actualizar');
        }
    });
}

// Eliminar respuesta
function eliminarRespuesta(id_respuesta) {
    if (!confirm('¿Seguro que quieres eliminar tu respuesta?')) return;
    fetch('/eliminar-respuesta', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_respuesta })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Respuesta eliminada');
            verRegistros(); 
        } else {
            alert('No se pudo eliminar');
        }
    });
}




// mensaje de nueva atrea asignada
function mostrarToast(mensaje) {
    const toast = document.getElementById('toastMensaje');
    toast.textContent = mensaje;
    toast.style.display = 'block';
    toast.style.opacity = '0.95';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 400);
    }, 3000); // 3 segundos visible
}