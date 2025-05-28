
document.getElementById('registerForm').addEventListener('submit', function (e)
 {
    e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    // Capturar los datos del formulario
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const career = document.getElementById('career').value;

    // Función para mostrar mensaje de error en el DOM
    function showError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block'; // Mostrar el contenedor
    }

    // Validaciones
    if (!email || !firstName || !lastName || !career) {
        showError('Todos los campos son obligatorios');
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        showError('Por favor, ingresa un correo electrónico válido.');
        return;
    }

    if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.');   
        return;
    }

    // Ocultar mensaje de error si todo está correcto
    document.getElementById('error-message').style.display = 'none';

    // Crear un objeto con los datos del formulario
    const userData = {
        firstName,
        lastName,
        email,
        password,
        career
    };

    // Enviar los datos al servidor usando fetch
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json()) // Espera la respuesta del servidor
    .then(data => {
        if (data.message === 'Usuario registrado exitosamente') {
            alert('Registro exitoso');
            window.location.href = 'index.html'; 
        } else {
            showError('Hubo un problema al registrar al usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Hubo un problema al registrar al usuario');
    });
});
