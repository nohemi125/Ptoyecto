
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    // Capturar los datos del formulario
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const career = document.getElementById('career').value;

    // Validación simple para asegurarse de que las contraseñas coincidan
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

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
        // Mostrar mensaje de éxito o manejar error según la respuesta
        console.log(data);
        if (data.message === 'Usuario registrado exitosamente') {
            alert('Registro exitoso');
            window.location.href = 'index.html'; // Redirigir al login
        } else {
            alert('Hubo un problema al registrar al usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al registrar al usuario');
    });
});








/*
// Ruta para obtener todos los estudiantes
app.get('/students', (req, res) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los estudiantes:', err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        res.json(results);  // Devolver los estudiantes como JSON
    });
});


// Eliminar estudiante por ID
app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM students WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al eliminar el registro' });
        }
        res.send({ message: 'Registro eliminado exitosamente' });
    });
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html'); // Sirve el archivo dashboard.html
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});*/
