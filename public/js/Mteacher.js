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
    .then(response => response.json()) // Convertir respuesta a JSON
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            document.getElementById('error-message').innerText = data.message;
        }
    })
    .catch(error => console.error('Error:', error));
});
