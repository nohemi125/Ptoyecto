const express = require('express');
const session = require('express-session'); // para guardar la info de inicio de sesion 
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Importar bcrypt
const crypto = require('crypto'); // Para generar un token aleatorio
 
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = 3000;

app.use(express.json());






const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',  // cambia al puerto frontend que uses
    credentials: true
}));

app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // porque usas localhost sin HTTPS
      sameSite: 'lax'
    }
}));




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

// app.use(session({
//     secret: 'secreto',
//     resave: false,
//     saveUninitialized: true
// }));

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






// Ruta para registro de estudiantes (guardando contraseña encriptada)
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


// Ruta para login para sestduiantes (comparando contraseña encriptada)
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

                req.session.user = {
                    id: results[0].id,
                    name: results[0].first_name                     
                };
                console.log("✅ Sesión guardada:", req.session.user); // Verifica que la sesión se guarde bien

                const checkMateriasQuery = `SELECT COUNT(*) AS total FROM matricula WHERE id_student = ?`;
                db.query(checkMateriasQuery, [results[0].id], (err, countResults) => {
                    if (err) {
                        console.error('Error al verificar materias:', err);
                        return res.status(500).send({ message: 'Error en el servidor' });
                    }

                    const totalMaterias = countResults[0].total;

                    if (totalMaterias > 0) {
                        // Si ya tiene materias registradas, redirigir al dashboard
                        res.send({
                            message: 'Inicio de sesión exitoso',
                            redirect: '/dashboardStudents.html'
                        });
                    } else {
                        // Si no tiene materias registradas, redirigir a la página de matrícula
                        res.send({
                            message: 'Inicio de sesión exitoso',
                            redirect: '/Mstudents.html'
                        });
                    }
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





// // Ruta GET para obtener estudiantes
// app.get('/students', (req, res) => {
//   db.query('SELECT * FROM students', (err, resultados) => {
//     if (err) {
//       console.error('❌ Error al ejecutar la consulta:', err);
//       res.status(500).send('Error al obtener los datos');
//       return;
//     }

//     console.log('📦 Datos obtenidos:', resultados); // Se muestra en la terminal
//     res.json(resultados); // Se muestra en el navegador
//   });
// });


app.get('/estudiantes/:materia', async (req, res) => {
  const materia = req.params.materia;

  try {
    const [rows] = await pool.query(
      `SELECT id_student, name_students FROM tu_tabla WHERE subject = ? AND tipo = 'estudiante'`,
      [materia]
    );

    res.json({ success: true, estudiantes: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener estudiantes' });
  }
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

                // Verificar si el profesor ya tiene materias registradas
                const checkMateriasQuery = `SELECT COUNT(*) AS total FROM matricula WHERE id_teacher = ?`;
                db.query(checkMateriasQuery, [results[0].id], (err, countResults) => {
                    if (err) {
                        console.error('Error al verificar materias:', err);
                        return res.status(500).send({ message: 'Error en el servidor' });
                    }

                    const totalMaterias = countResults[0].total;

                    if (totalMaterias > 0) {
                        // Si ya tiene materias registradas, redirigir al dashboard
                        res.send({
                            message: 'Inicio de sesión exitoso',
                            redirect: '/dashboardProfesor.html'
                        });
                    } else {
                        // Si no tiene materias registradas, redirigir a la página de matrícula
                        res.send({
                            message: 'Inicio de sesión exitoso',
                            redirect: '/Mteacher.html'
                        });
                    }
                });
            } else {
                res.status(401).send({ message: 'Credenciales incorrectas' });
            }
        } else {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
    });
});


//funcion para matricualr materiasProfesor
app.post('/Mteacher', (req, res) => {
    if (!req.session.user || !req.session.user.id || !req.session.user.name) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const { subject, time, classroom } = req.body;
    const teacherId = req.session.user.id;  // ID del profesor
    const teacherName = req.session.user.name; // Nombre del profesor

    // Asegúrate de que los 5 valores están correctamente definidos
    console.log("Datos a insertar:", teacherName, subject, time, classroom, teacherId);

    const query = `
    INSERT INTO matricula (name_teachers, subject, time, classroom, id_teacher, tipo)
    VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [teacherName, subject, time, classroom, teacherId, 'profesor'], (err, result) => {
        if (err) {
            console.error('Error al matricular:', err);
            return res.status(500).json({ success: false, message: 'Error al registrar la materia' });
        }

        res.json({
            success: true,
            message: 'Materia matriculada correctamente',
            redirect: '/dashboardProfesor.html'
        });
    });
});



//ruta para cerra sesion 
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }

        res.clearCookie('connect.sid'); // Asegúrate de usar el nombre correcto de la cookie de sesión
        res.json({ message: 'Sesión cerrada' });
    });
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


// STUDENTS
//para poner nombre de la perosn que o session en el dasboard de estudiantes
app.get('/perfilStudents', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, name: req.session.user.name });
     }
});


// Ruta para ver todas las materias matriculadas por los profesores y se reflegen en vista de student
app.get('/materiasDisponibles', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    const studentId = req.session.user.id;
    const query = `
        SELECT subject, classroom, time, name_teachers  FROM matricula  WHERE tipo = 'profesor'  AND CONCAT(subject, classroom, time)
        NOT IN (  SELECT CONCAT(subject, classroom, time) 
        FROM matricula WHERE id_student = ?)`;
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error al obtener las materias disponibles:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        res.json({ success: true, materias: results });
    });
});





// Ruta para inscribir a un estudiante en una materia


//ruta para ver las materias que el estduiante matriuclo en su dashboard

app.post('/inscribirMateria', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(400).send({ message: 'No se encontró el ID del estudiante. Por favor, inicie sesión nuevamente.' });
    }

    const studentId = req.session.user.id;
    const { subject, classroom, time, name_teachers } = req.body;
    const tipo = 'estudiante';

    if (!subject || !classroom || !time || !name_teachers) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe la matrícula
    const checkQuery = `
        SELECT * FROM matricula  WHERE id_student = ? AND subject = ?`;
    db.query(checkQuery, [studentId, subject], (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error al verificar la matrícula' });
        }

        if (results.length > 0) {
            return res.status(400).send({ message: 'Ya estás matriculado en esta materia' });
        }

        // Insertar la nueva matrícula
        const insertQuery = ` INSERT INTO matricula (id_student, subject, classroom, time, name_teachers, id_teacher, tipo)
            VALUES (?, ?, ?, ?, ?, NULL, ?) `;
        db.query(insertQuery, [studentId, subject, classroom, time, name_teachers, tipo], (err, results) => {
            if (err) {
                console.error('Error al inscribir al estudiante:', err.sqlMessage || err.message);
                return res.status(500).send({ message: 'Error al inscribir al estudiante', error: err.sqlMessage || err.message });
            }

            res.send({ success: true, message: 'Inscripción realizada con éxito' });
        });
    });
});



app.get('/materiasEstudiante', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const studentId = req.session.user.id;

    const query = `SELECT subject, classroom, time, name_teachers  FROM matricula  WHERE id_student = ? AND tipo = 'estudiante'`;
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error al obtener las materias del estudiante:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        res.json({ success: true, materias: results });
    });
});





//ruta para asignar tareas desde el rol profesor a estudiante y que se guarde en la bd;
app.post('/asignarTarea', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).send("Usuario no autenticado");
    }
    const id_teacher = req.session.user.id;
    const { subject, classroom, title, description, time, due_date } = req.body;

    // Validación de campos
    if (!subject || !classroom || !title || !description || !time || !due_date) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `INSERT INTO tareas (id_teacher, subject, classroom, title, description, time, due_date)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [id_teacher, subject, classroom, title, description, time, due_date], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error al enviar tarea ' });
        }
        res.json({ message: 'Tarea enviada' });
    });
});










//ruta pora que los estudinates puedan ver estas taeras asignadas por los profesores en el dasboard del rol de estudiante
// VER TAREAS (estudiante)

app.get('/tareasMateria', (req, res) => {
    const subject = req.query.subject || '';
    const classroom = req.query.classroom || '';
    const time = req.query.time || '';

    console.log('Parámetros recibidos:', { subject, classroom, time });

    // Consulta SQL con placeholders
    const query = `
    SELECT title, description, time
    FROM tareas
    WHERE LOWER(subject) = LOWER(?) AND LOWER(classroom) = LOWER(?)
`;
db.query(query, [subject.trim(), classroom.trim()], (err, results) =>  {
        if (err) {
            console.error('❌ Error al obtener tareas:', err);
            return res.json({ success: false, tareas: [], message: 'Error en la base de datos' });
        }

        res.json({ success: true, tareas: results });
    });
});






//ruta para que los estduiantes respondas a las tareas asignadas por los profesores y se guarde en la bd
// RESPONDER TAREA (estudiante)
app.post('/responderTarea', (req, res) => {
  const { id_tarea, id_student, respuesta } = req.body;

  if (!id_tarea || !id_student || !respuesta) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  const query = `
    INSERT INTO respuestas (id_tarea, id_student, respuesta)
    VALUES (?, ?, ?)
  `;

  db.query(query, [id_tarea, id_student, respuesta], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar la respuesta:', err);
      return res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }

    console.log('✅ Respuesta guardada');
    res.json({ success: true });
  });
});



