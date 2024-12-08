document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // Obtener el token desde la URL

    if (!newPassword) {
        alert("Por favor ingresa una nueva contraseña.");
        return;
    }

    fetch(`/reset-password/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: newPassword })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw error });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message); 
        window.location.href = 'index.html'; // Redirigir a la página de login
    })
    .catch(error => {
        console.error('Error:', error); // Mostrar detalles del error en la consola
        alert("Hubo un error al procesar tu solicitud. Detalles: " + error.message); // Mostrar mensaje detallado
    });
});
