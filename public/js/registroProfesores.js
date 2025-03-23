document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const faculty = document.getElementById('faculty').value;
            const area = document.getElementById('area').value;
            const terms = document.getElementById('terms').checked;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            if (!terms) {
                alert('Debes aceptar los términos y condiciones.');
                return;
            }

            const professorData = {
                first_name: firstName, 
                last_name: lastName, 
                email, 
                password, 
                faculty, 
                area, 
                terms_accepted: terms
            };

            try {
                const response = await fetch('http://localhost:3000/registroProfesores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(professorData)
                });

                const result = await response.json();

                if (response.ok) {
                    if (result.success) {
                        window.location.href = '/indexProfesores.html'; // Redirige al login de profesores
                    } else {
                        alert(result.message || 'Hubo un error al registrar el profesor.');
                    }
                } else {
                    alert('Hubo un error en el servidor.');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor:', error);
                alert('Hubo un error al intentar registrar el profesor.');
            }
        });
    } else {
        console.error('Formulario de registro no encontrado en el DOM');
    }
});
