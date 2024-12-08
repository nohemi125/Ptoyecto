const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Importar bcrypt
const crypto = require('crypto'); // Para generar un token aleatorio
 
const nodemailer = require('nodemailer'); // Asegúrate de tener esta importación


const app = express();
const PORT = 3000;

// Configuración de base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'portal_academico'
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tuemail@gmail.com',  // Cambia esto por tu dirección de Gmail
        pass: 'contraseña_de_aplicación'  // Usa la contraseña de aplicación generada
    }
});


// Conexión a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conectado a MySQL');
});



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));  // Servir archivos estáticos de la carpeta public

// Ruta para registro (guardando contraseña encriptada)
app.post('/register', (req, res) => {
    const { firstName, lastName, email, password, career } = req.body;

    const query = `INSERT INTO students (first_name, last_name, email, password, career) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [firstName, lastName, email, password, career], (err, result) => {
        console.log(req.body);
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al registrar el usuario' });
        }
        res.send({ message: 'Usuario registrado exitosamente' });
    });
});


// Ruta para login (comparando contraseña encriptada)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM students WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            // Comparar contraseñas (en este caso, simple comparación)
            if (password === results[0].password) {
                // Inicio de sesión exitoso: enviar mensaje y redirección
                res.send({
                    message: 'Inicio de sesión exitoso',
                        redirect: '/dashboard.html'
                });
            } else {
                res.status(401).send({ message: 'Credenciales incorrectas' });
            }
        } 
    });
});
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html'); // Sirve el archivo dashboard.html
});


// Ruta para solicitar restablecimiento de contraseña (generación del token)
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // Verificar si el usuario existe en la base de datos
    const query = 'SELECT * FROM students WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        // Generar un token único
        const token = crypto.randomBytes(20).toString('hex');

        // Establecer una expiración para el token (1 hora)
        const tokenExpiry = Date.now() + 3600000; 

        // Guardar el token en la base de datos
        const updateQuery = 'UPDATE students SET reset_token = ?, reset_token_expiry = ? WHERE id = ?';
        db.query(updateQuery, [token, tokenExpiry, user.id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error al generar el token' });
            }

            // Enviar un correo con el enlace para restablecer la contraseña
            const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
            const mailOptions = {
                to: user.email,
                subject: 'Restablecimiento de contraseña',
                text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ message: 'Error al enviar el correo' });
                }

                res.send({ message: 'Correo de restablecimiento enviado. Revisa tu bandeja de entrada.' });
            });
        });
    });
});

// Ruta para restablecer la contraseña con el token
app.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const query = `SELECT * FROM students WHERE reset_token = ? AND reset_token_expiry > ?`;
    db.query(query, [token, Date.now()], (err, results) => {
        if (err) {
            console.error('Error en el servidor:', err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(400).send({ message: 'Enlace inválido o caducado' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        const updateQuery = `UPDATE students SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?`;
        db.query(updateQuery, [hashedPassword, token], (err) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                return res.status(500).send({ message: 'Error al restablecer la contraseña' });
            }

            res.send({ message: 'Contraseña restablecida con éxito. Ahora puedes iniciar sesión.' });
        });
    });
});




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
});
// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    // Eliminar la cookie de autenticación (si usas cookies)
    res.clearCookie('auth_token'); // Asegúrate de que 'auth_token' sea el nombre de tu cookie de autenticación
    
    // Si usas sesiones de Express (con express-session), sería algo como:
    // req.session.destroy((err) => {
    //     if (err) {
    //         return res.status(500).send({ message: 'Error al cerrar sesión' });
    //     }
    //     res.send({ message: 'Sesión cerrada' });
    // });
    
    res.send({ message: 'Sesión cerrada' }); // Respuesta de éxito
});
