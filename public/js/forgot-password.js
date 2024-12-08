document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;

    if (!email) {
        alert("Por favor ingresa tu correo electrónico.");
        return;
    }

    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Mostrar el mensaje del servidor
        if (data.success) {
            window.location.href = 'index.html'; // Redirigir a la página de login si la solicitud fue exitosa
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    });
});
