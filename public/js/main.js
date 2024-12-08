document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form'); // Usamos querySelector para seleccionar por clase

    if (loginForm) { // Verificamos si se encontró el formulario
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Por favor, ingresa tu correo y contraseña.');
                return;
            }

            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(email)) {
                alert('Por favor, ingresa un correo electrónico válido.');
                return;
            }

            // Enviar los datos al backend
            const loginData = { email, password };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    if (result.redirect) {
                        window.location.href = result.redirect; // Redirige dinámicamente
                    } else {
                        alert('Inicio de sesión exitoso, pero no se encontró la redirección.');
                    }
                } else {
                    alert(result.message || 'Error en el inicio de sesión');
                }
            } catch (error) {
                console.error('Error al conectarse al servidor:', error);
                alert('Hubo un error al intentar iniciar sesión.');
            }
        });
    } else {
        console.error('Formulario de inicio de sesión no encontrado en el DOM');
    }
});
