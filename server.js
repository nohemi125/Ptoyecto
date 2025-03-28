
const express = require('express');
const session = require('express-session'); // para guardar la info de inicio de sesion 
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Importar bcrypt
const crypto = require('crypto'); // Para generar un token aleatorio
 
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = 3000;

// Configuración de base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'students'
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'email@gmail.com',  
        pass: 'contraseña'  
    }
});

app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
}));

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
app.set('view engine', 'ejs'); // Establecer el motor de plantillas EJS
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
        res.send({ message: 'Estudiante eliminado exitosamente' });
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

// ruta para registrar profesores

app.post('/registroProfesores', (req, res) => {
    const { first_name, last_name, email, password, faculty, area } = req.body;

    if (!first_name) {
        return res.status(400).json({ message: 'Error: El nombre del profesor es obligatorio' });
    }
    
    const query = `INSERT INTO profesores (first_name, last_name, email, password, faculty, area) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [first_name, last_name, email, password, faculty, area], (err, result) => {
        console.log(req.body);
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }
        res.json({ message: 'Usuario registrado exitosamente' });
    });
});    


// Ruta para login de profesores funciona
app.post('/indexProfesores', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM profesores WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            if (password === results[0].password) {
                // Guardar en sesión los datos del profesor
                req.session.user = {
                    id: results[0].id,
                    name: results[0].first_name                     
                };

                console.log("✅ Sesión guardada:", req.session.user); // Verifica que la sesión se guarde bien

                // Redirección después del inicio de sesión
                res.send({
                    message: 'Inicio de sesión exitoso',
                    redirect: '/Mteacher.html'
                });
            } else {
                res.status(401).send({ message: 'Credenciales incorrectas' });
            }
        } else {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
  });
});




//funcion para matricualr materia
// app.post('/Mteacher', (req, res) => {
//     console.log('🔍 Sesión recibida en /Mteacher:', req.session); 

//     if (!req.session.user || !req.session.user.name) {
//         return res.status(400).json({ message: 'Error: No se ha identificado el profesor' });
//     }

//     const name_teachers = req.session.user.name;
//     const { subject, time, classroom } = req.body;

//     console.log(' Nombre del profesor:', name_teachers);

//     const query = `INSERT INTO matricula (name_teachers, subject, time, classroom) VALUES (?, ?, ?, ?)`;

//     db.query(query, [name_teachers, subject, time, classroom], (err, result) => {
//         if (err) {
//             console.error('Error en la consulta SQL:', err);
//             return res.status(500).json({ message: 'Error al registrar la matrícula' });
//         }
//         res.json({ success: true, message: 'Matrícula registrada exitosamente' });    });
// });


//funcion para matricular materias con ide de profesor guradado desde el inciio de session.
// app.post('/Mteacher', (req, res) => {
//     if (!req.session.user || !req.session.user.id || !req.session.user.name) {
//         return res.status(401).json({ success: false, message: 'No autorizado' });
//     }

//     const { subject, time, classroom } = req.body;
//     const teacherId = req.session.user.id;  // ID del profesor
//     const teacherName = req.session.user.name; // Nombre del profesor

//     // Asegúrate de que los 5 valores están correctamente definidos
//     console.log("Datos a insertar:", teacherName, subject, time, classroom, teacherId);

//     const query = `INSERT INTO matricula (name_teachers, subject, time, classroom, id_teacher) VALUES (?, ?, ?, ?, ?)`;
    
//     db.query(query, [teacherName, subject, time, classroom, teacherId], (err, result) => {
//         if (err) {
//             console.error('Error al matricular:', err);
//             return res.status(500).json({ success: false, message: 'Error al registrar la materia' });
//         }

//         res.json({ success: true, message: 'Materia matriculada correctamente' });
//     });
// });




// Ruta para cerrar sesión

app.post('/Mteacher', (req, res) => {
    if (!req.session.user || !req.session.user.id || !req.session.user.name) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const { subject, time, classroom } = req.body;
    const teacherId = req.session.user.id;  // ID del profesor
    const teacherName = req.session.user.name; // Nombre del profesor

    // Asegúrate de que los 5 valores están correctamente definidos
    console.log("Datos a insertar:", teacherName, subject, time, classroom, teacherId);

    const query = `INSERT INTO matricula (name_teachers, subject, time, classroom, id_teacher) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(query, [teacherName, subject, time, classroom, teacherId], (err, result) => {
        if (err) {
            console.error('Error al matricular:', err);
            return res.status(500).json({ success: false, message: 'Error al registrar la materia' });
        }

        res.json({
            success: true,
            message: 'Matriculación registrada correctamente',
            redirect: '/dashboardProfesor.html'
        });
         
      });
});






app.post('/logout', (req, res) => {
    res.clearCookie('auth_token'); // Asegúrate de que 'auth_token' sea el nombre de tu cookie de autenticación
    
    res.send({ message: 'Sesión cerrada' }); // Respuesta de éxito
});


//para poner nombre de la perosn que inciio session en el dasboard.
app.get('/perfilProfesor', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, name: req.session.user.name });
     }
});


// Ruta para obtener las materias de un profesor
app.get('/materiasProfesor', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const teacherId = req.session.user.id;

    const query = 'SELECT subject, classroom, time FROM matricula WHERE id_teacher = ?';
    db.query(query, [teacherId], (err, results) => {
        if (err) {
            console.error('Error al obtener materias:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        res.json({ success: true, materias: results });
    });
});


app.get('/matricularMateria', (req, res) => {
    res.sendFile(__dirname + '/public/Mteacher.html');
});
