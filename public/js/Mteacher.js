// Esto se ejecuta al cargar la página y rellena el campo de materia
window.addEventListener('DOMContentLoaded', () => {
    fetch('/materia-profesor')
        .then(res => res.json())
        .then(data => {
            if (data.materia) {
                document.getElementById('subject').value = data.materia;
            }
        });
});

// Esto maneja el envío del formulario
document.getElementById('matriculaForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se recargue

    const subject = document.getElementById('subject').value;
    const time = document.getElementById('time').value;
    const classroom = document.getElementById('classroom').value;

    fetch('/Mteacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, time, classroom })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            document.getElementById('error-message').innerText = data.message;
        }
    })
    .catch(error => console.error('Error:', error));
});





document.getElementById('classroom').addEventListener('change', function() {
    const classroom = this.value;
    if (!classroom) return;

    fetch(`/horarios-ocupados?classroom=${encodeURIComponent(classroom)}`)
        .then(res => res.json())
        .then(data => {
            const horariosOcupados = data.horarios || [];
            const selectTime = document.getElementById('time');
            Array.from(selectTime.options).forEach(option => {
                if (option.value === "") return; // No tocar la opción por defecto
                if (horariosOcupados.includes(option.value)) {
                    option.disabled = true;
                    option.style.color = "#ccc"; // Opcional: gris para visual
                } else {
                    option.disabled = false;
                    option.style.color = ""; // Restaurar color normal
                }
            });
        });
});