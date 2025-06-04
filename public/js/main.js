// 



document.querySelector('.login-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
  
     
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
            
            if (data.studentId) {
                sessionStorage.setItem('studentId', data.studentId);
                errorMessage.textContent = 'contraseñas incorrecta...';
            }
            window.location.href = data.redirect;
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error al iniciar sesión:', error));
});