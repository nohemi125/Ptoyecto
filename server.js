const express = require('express');
const session = require('express-session'); // para guardar la info de inicio de sesion 
const mysql = require('mysql2');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta donde se guardan los archivos
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); 
const crypto = require('crypto'); 
 
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = 3000;

app.use('/uploads', express.static('uploads'));
app.use(express.json());






const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',  
    credentials: true
}));

app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
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
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public'));  






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
// app.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     const query = `SELECT * FROM students WHERE email = ?`;
//     db.query(query, [email], (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send({ message: 'Error en el servidor' });
//         }
//         if (results.length > 0) {
//             // Comparar contraseñas (en este caso, simple comparación)
//             if (password === results[0].password) {

//                 req.session.user = {
//                     id: results[0].id,
//                     name: results[0].first_name                     
//                 };
//                 console.log("✅ Sesión guardada:", req.session.user); // Verifica que la sesión se guarde bien

//                 const checkMateriasQuery = `SELECT COUNT(*) AS total FROM matricula WHERE id_student = ?`;
//                 db.query(checkMateriasQuery, [results[0].id], (err, countResults) => {
//                     if (err) {
//                         console.error('Error al verificar materias:', err);
//                         return res.status(500).send({ message: 'Error en el servidor' });
//                     }
                     

//                     const totalMaterias = countResults[0].total;

//                     if (totalMaterias > 0) {
//                         // Si ya tiene materias registradas, redirigir al dashboard
//                         res.send({
//                             message: 'Inicio de sesión exitoso',
//                             redirect: '/dashboardStudents.html'
//                         });
//                     } else {
//                         // Si no tiene materias registradas, redirigir a la página de matrícula
//                         res.send({
//                             message: 'Inicio de sesión exitoso',
//                             redirect: '/Mstudents.html'
//                         });
//                     }
//                 });
//             } else {
//                 res.status(401).send({ message: 'contraseña incorrecta' });
//             }
//         } 
//     });
// });







//esto es una prueba de la consilta de arriba  y funciona 
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM students WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error en el servidor' });
        }

        // Si no hay resultados, el correo no existe
        if (results.length === 0) {
            return res.status(401).send({ message: 'Correo incorrecto' });
        }

        // Comparar contraseñas
        if (password === results[0].password) {
            req.session.user = {
                id: results[0].id,
                name: results[0].first_name                     
            };
            console.log("✅ Sesión guardada:", req.session.user);

            const checkMateriasQuery = `SELECT COUNT(*) AS total FROM matricula WHERE id_student = ?`;
            db.query(checkMateriasQuery, [results[0].id], (err, countResults) => {
                if (err) {
                    console.error('Error al verificar materias:', err);
                    return res.status(500).send({ message: 'Error en el servidor' });
                }

                const totalMaterias = countResults[0].total;

                if (totalMaterias > 0) {
                    res.send({
                        message: 'Inicio de sesión exitoso',
                        redirect: '/dashboardStudents.html'
                    });
                } else {
                    res.send({
                        message: 'Inicio de sesión exitoso',
                        redirect: '/Mstudents.html'
                    });
                }
            });
        } else {
            res.status(401).send({ message: 'Contraseña incorrecta' });
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

app.get('/matricula', (req, res) => {
  const sql = "SELECT * FROM matricula WHERE tipo = 'estudiante'";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send('Error en la consulta');
    }
    res.json(results);
  });
});





// mostrar estydiantes que vean materia con el mismo profesor
app.get('/estudiantes-del-profesor', (req, res) => {
  const { id_teacher } = req.query;
  console.log("ID del profesor recibido:", id_teacher); 
  if (!id_teacher) {
    return res.status(400).json({ error: 'Falta el id del profesor' });
  }

  const sql = `
    SELECT DISTINCT s.id, s.first_name, s.last_name, s.email, s.career
    FROM matricula m
    INNER JOIN students s ON m.id_student = s.id
    WHERE m.id_teacher = ? AND m.tipo = 'estudiante'
  `;

  db.query(sql, [id_teacher], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results); // devuelve todos los estudiantes con ese profesor
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




// ruta para registrar profesores
app.post('/registroProfesores', (req, res) => {
    const { first_name, last_name, email, password, faculty, area } = req.body;

    // Verifica si el email ya existe
    db.query('SELECT id FROM profesores WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: ' registrate con otro correo' });
        }

        // Si no existe, inserta el nuevo profesor
        const query = `INSERT INTO profesores (first_name, last_name, email, password, faculty, area) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(query, [first_name, last_name, email, password, faculty, area], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al registrar el usuario' });
            }
            res.json({ 
                success: true,
                message: 'Usuario registrado exitosamente',
                redirect: '/indexProfesores.html'
            });
        });
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
        req.session.user = {
            id: results[0].id,
            name: results[0].first_name
        };

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
                // Solo la PRIMERA vez, guarda la materia en sesión y redirige a matrícula
                req.session.materiaProfesor = results[0].area;
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
    const teacherId = req.session.user.id;
    const teacherName = req.session.user.name;

    // 1. Verifica si ya existe la misma materia para este profesor
    const checkSubjectQuery = `
        SELECT * FROM matricula 
        WHERE id_teacher = ? AND LOWER(subject) = LOWER(?) AND tipo = 'profesor'
    `;
    db.query(checkSubjectQuery, [teacherId, subject], (err, results) => {
        if (err) {
            console.error('Error al verificar materia:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar la materia' });
        }
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Ya tienes inscrita una materia con ese nombre.' });
        }

        // 2. Verifica si ya hay una materia en ese aula y horario para ese profesor
        const checkAulaHoraQuery = `
            SELECT * FROM matricula 
    WHERE id_teacher = ? AND classroom = ? AND time = ? AND tipo = 'profesor'
        `;
            db.query(checkAulaHoraQuery, [teacherId, classroom, time], (err, resultsAulaHora) => {
                if (resultsAulaHora.length > 0) {
                    return res.status(400).json({ success: false, message: 'Ya tienes una materia en ese aula y horario.' });
            }
            if (resultsAulaHora.length > 0) {
                return res.status(400).json({ success: false, message: 'Ya tienes una materia en ese aula y horario.' });
                }

            // 3. Si no hay conflicto, inserta la nueva materia
                const insertQuery = `
                    INSERT INTO matricula (name_teachers, subject, time, classroom, id_teacher, tipo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                db.query(insertQuery, [teacherName, subject, time, classroom, teacherId, 'profesor'], (err, result) => {
                    if (err) {
                        console.error('Error al matricular:', err);
                        return res.status(500).json({ success: false, message: 'Error al registrar la materia' });
                    }
                    req.session.materiaProfesor = '';
                    res.json({
                        success: true,
                        message: 'Materia matriculada correctamente',
                        redirect: '/dashboardProfesor.html'
                });
            });
        });
    });
});




app.get('/horarios-ocupados', (req, res) => {
    const { classroom } = req.query;
    const teacherId = req.session.user?.id;
    if (!teacherId || !classroom) {
        return res.json({ horarios: [] });
    }
    const query = `
        SELECT time FROM matricula
        WHERE id_teacher = ? AND classroom = ? AND tipo = 'profesor'
    `;
    db.query(query, [teacherId, classroom], (err, results) => {
        if (err) {
            return res.json({ horarios: [] });
        }
        const horarios = results.map(r => r.time);
        res.json({ horarios });
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




// Ruta para obtener la materia guardada en sesión al registrar
app.get('/materia-profesor', (req, res) => {
    res.json({ materia: req.session.materiaProfesor || '' });
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




// Ruta para obtener las materias que el estudiante ya matriculó
app.get('/materiasEstudiante', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const studentId = req.session.user.id;

    const query = `
  SELECT m.*, 
    (
       SELECT COUNT(*) FROM tareas t
      WHERE t.subject = m.subject
        AND t.classroom = m.classroom
        AND t.id_teacher = (
            SELECT m2.id_teacher
            FROM matricula m2
            WHERE m2.subject = m.subject
              AND m2.classroom = m.classroom
              AND m2.tipo = 'profesor'
            LIMIT 1
        )
        AND t.id NOT IN (
            SELECT r.id_tarea FROM respuestas r WHERE r.id_student = m.id_student
        )
    ) AS tareas_pendientes
  FROM matricula m
  WHERE m.id_student = ?
`;

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error al obtener las materias del estudiante:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }
        res.json({ success: true, materias: results });
    });
});









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



app.get('/tareasMateria', (req, res) => {
    const subject = req.query.subject || '';
    const classroom = req.query.classroom || '';
    const id_student = req.session.user ? req.session.user.id : null;

    if (!id_student) {
      return res.status(401).json({ success: false, message: 'No hay sesión activa' });
    }

   const query = `
  SELECT t.id, t.title, t.description, t.time, t.due_date, t.file
  FROM tareas t
  WHERE LOWER(t.subject) = LOWER(?) AND LOWER(t.classroom) = LOWER(?)
    AND NOT EXISTS (
      SELECT 1 FROM respuestas r 
      WHERE r.id_tarea = t.id AND r.id_student = ?
    )
`;

    db.query(query, [subject.trim(), classroom.trim(), id_student], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener tareas:', err);
            return res.json({ success: false, tareas: [], message: 'Error en la base de datos' });
        }
        res.json({ success: true, tareas: results });
    });
});





//ruta para asignar tareas desde el rol profesor a estudiante y que se guarde en la bd;
// app.post('/asignarTarea', (req, res) => {
//     if (!req.session.user || !req.session.user.id) {
//         return res.status(401).send("Usuario no autenticado");
//     }
//     const id_teacher = req.session.user.id;
//     const { subject, classroom, title, description, time, due_date } = req.body;

//     // Validación de campos
//     if (!subject || !classroom || !title || !description || !time || !due_date) {
//         return res.status(400).json({ message: 'Todos los campos son obligatorios' });
//     }

//     const query = `INSERT INTO tareas (id_teacher, subject, classroom, title, description, time, due_date)
//                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
//     db.query(query, [id_teacher, subject, classroom, title, description, time, due_date], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send({ message: 'Error al enviar tarea ' });
//         }
//         res.json({ message: 'Tarea enviada' });
//     });
// });



// convierte la hora de formato 12 horas a formato 24 horas
function to24HourFormat(time, ampm) {
    let [hour, minute] = time.split(':').map(Number);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

app.post('/asignarTarea', upload.single('file'), (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const id_teacher = req.session.user.id;
    let { subject, classroom, title, description, time, due_date, ampm } = req.body;
    const file = req.file ? req.file.filename : null;

    // Convierte la hora a formato 24 horas
    time = to24HourFormat(time, ampm);

    db.query(
        'INSERT INTO tareas (id_teacher, subject, classroom, title, description, time, due_date, file) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id_teacher, subject, classroom, title, description, time, due_date, file],
        (err, result) => {
            if (err) {
                console.error('Error al guardar tarea:', err);
                return res.json({ success: false });
            }
            res.json({ success: true });
        }
    );
});




//ruta pora que los estudinates puedan ver estas taeras asignadas por los profesores en el dasboard del rol de estudiante
// VER TAREAS (estudiante)


app.get('/tareasMateria', (req, res) => {
    const subject = req.query.subject || '';
    const classroom = req.query.classroom || '';
    const id_student = req.session.user ? req.session.user.id : null;

    if (!id_student) {
      return res.status(401).json({ success: false, message: 'No hay sesión activa' });
    }

    const query = `
        SELECT t.id, t.title, t.description, t.time, t.due_date, t.file
        FROM tareas t
        WHERE LOWER(t.subject) = LOWER(?) AND LOWER(t.classroom) = LOWER(?)
        AND NOT EXISTS (
            SELECT 1 FROM respuestas r 
            WHERE r.id_tarea = t.id AND r.id_student = ?
        )
    `;

    db.query(query, [subject.trim(), classroom.trim(), id_student], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener tareas:', err);
            return res.json({ success: false, tareas: [], message: 'Error en la base de datos' });
        }
        res.json({ success: true, tareas: results });
    });
});





//ruta para que los estduiantes respondas a las tareas asignadas por los profesores y se guarde en la bd
// RESPONDER TAREA (estudiante)

app.post('/responderTarea', upload.single('file'), (req, res) => {
    const { id_tarea, respuesta } = req.body;
    const id_student = req.session.user.id;
    const file = req.file ? req.file.filename : null;

    // Verifica si ya existe una respuesta para esa tarea y estudiante
    db.query(
        'SELECT id FROM respuestas WHERE id_tarea = ? AND id_student = ?',
        [id_tarea, id_student],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Error en la consulta' });
            if (results.length > 0) {
                return res.status(400).json({ success: false, message: 'Ya has respondido esta tarea.' });
            }
            // Si no existe, inserta la respuesta
            const insertQuery = `INSERT INTO respuestas (id_tarea, id_student, respuesta, archivo) VALUES (?, ?, ?, ?)`;
            db.query(insertQuery, [id_tarea, id_student, respuesta, file], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error al guardar la respuesta' });
                }
                res.json({ success: true });
            });
        }
    );
});





//prueba de la ruta de arriba y funciona
// app.post('/responderTarea', upload.single('file'), (req, res) => {
//     const { id_tarea, respuesta } = req.body;
//     const id_student = req.session.user.id;
//     const file = req.file ? req.file.filename : null;

//     // Consulta si la tarea está vencida directamente en MySQL
//     const vencimientoQuery = `
//         SELECT 
//             due_date, time,
//             NOW() AS ahora,
//             CONCAT(due_date, ' ', time) AS limite,
//             (NOW() > CONCAT(due_date, ' ', time)) AS vencida
//         FROM tareas
//         WHERE id = ?
//     `;
//     db.query(vencimientoQuery, [id_tarea], (err, results) => {
//         if (err || results.length === 0) {
//             return res.status(400).json({ success: false, message: 'Tarea no encontrada' });
//         }
//         if (results[0].vencida == 1) {
//             return res.status(400).json({ success: false, message: 'Esta tarea ya se venció.' });
//         }

//         // Si no ha vencido, guarda la respuesta (ahora con archivo)
//         const insertQuery = `INSERT INTO respuestas (id_tarea, id_student, respuesta, file) VALUES (?, ?, ?, ?)`;
//         db.query(insertQuery, [id_tarea, id_student, respuesta, file], (err, result) => {
//             if (err) {
//                 return res.status(500).json({ success: false, message: 'Error al guardar la respuesta' });
//             }
//             res.json({ success: true });
//         });
//     });
// });













// Ruta para ver respuestas de tareas enviadas por el profesor
app.get('/respuestas-tareas-profesor', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    const id_teacher = req.session.user.id;
    const { subject, classroom } = req.query;

    const query = `
        SELECT 
            r.id, 
            r.respuesta, 
            r.fecha_respuesta,
            r.archivo,    
            s.first_name, 
            s.last_name, 
            t.title
        FROM respuestas r
        JOIN students s ON r.id_student = s.id
        JOIN tareas t ON r.id_tarea = t.id
        WHERE t.id_teacher = ? AND t.subject = ? AND t.classroom = ?
        ORDER BY r.fecha_respuesta DESC
    `;
    db.query(query, [id_teacher, subject, classroom], (err, results) => {
        if (err) {
            console.error('Error al obtener respuestas:', err);
            return res.status(500).json({ success: false, message: 'Error en la consulta' });
        }
        res.json({ success: true, respuestas: results });
    });
});








// RUTA PARA VER LOS ESTUDIANTES QUE ESTAN MATRIUCLADOS EN UNA MATERIA EN ESPECIFICO
app.get('/estudiantes-materias', (req, res) => {
    const materia = req.query.subject;

    if (!materia) {
        return res.status(400).json({ error: 'Debe especificar la materia con ?subject=' });
    }

    const query = `
    SELECT students.id, students.first_name, students.last_name, students.email, students.career
    FROM matricula
    JOIN students ON matricula.id_student = students.id
    WHERE matricula.subject = ? AND matricula.tipo = 'estudiante'
    ORDER BY students.last_name, students.first_name
`;

    db.query(query, [materia], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        res.json(results);
    });
});




// registro de las tareas que el estduiante ha enviado
app.get('/registros-tareas-estudiante', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    const id_student = req.session.user.id;
    const subject = req.query.subject;
    const classroom = req.query.classroom;

   let query = `
    SELECT r.id AS id_respuesta, t.title, r.respuesta, r.fecha_respuesta, r.nota, r.archivo
    FROM respuestas r
    JOIN tareas t ON r.id_tarea = t.id
    WHERE r.id_student = ?
`;
    const params = [id_student];

    if (subject && classroom) {
        query += ' AND t.subject = ? AND t.classroom = ?';
        params.push(subject, classroom);
    }

    query += ' ORDER BY r.fecha_respuesta DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener registros:', err);
            return res.status(500).json({ success: false, message: 'Error en la consulta' });
        }
        res.json({ success: true, registros: results });
    });
});



// Ver todos los estudiantes que ven materias con un profesor
app.get('/todos-estudiantes-del-profesor', (req, res) => {
  const id_teacher = req.session.user?.id || req.query.id_teacher;
  if (!id_teacher) {
    return res.status(400).json({ error: 'Falta el id del profesor' });
  }

  const sql = `
    SELECT 
      s.id, 
      s.first_name, 
      s.last_name, 
      s.career, 
      s.email,
      m2.subject
    FROM matricula m1
    JOIN matricula m2 ON m1.subject = m2.subject AND m2.tipo = 'estudiante'
    JOIN students s ON m2.id_student = s.id
    WHERE m1.id_teacher = ? AND m1.tipo = 'profesor'
    ORDER BY s.last_name, s.first_name, m2.subject
  `;

  db.query(sql, [id_teacher], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results);
  });
});





// fncion para editar o elimniar tarea d eun estduiante
// Tareas de una materia específica del profesor
app.get('/tareas-materia', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.json({ success: false, tareas: [] });
    }
    const id_teacher = req.session.user.id;
    const { subject, classroom } = req.query;
    db.query(
        'SELECT * FROM tareas WHERE id_teacher = ? AND subject = ? AND classroom = ?',
        [id_teacher, subject, classroom],
        (err, results) => {
            if (err) return res.json({ success: false, tareas: [] });
            res.json({ success: true, tareas: results });
        }
    );
});

// Editar respuesta
app.put('/editar-respuesta', (req, res) => {
    const { id_respuesta, respuesta } = req.body;
    db.query('UPDATE respuestas SET respuesta = ? WHERE id = ?', [respuesta, id_respuesta], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// Eliminar respuesta
app.delete('/eliminar-respuesta', (req, res) => {
    const { id_respuesta } = req.body;
    db.query('DELETE FROM respuestas WHERE id = ?', [id_respuesta], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});



app.delete('/eliminar-tarea', (req, res) => {
    const { id } = req.body;
    
    // Primero verificar si la tarea tiene respuestas calificadas
    const checkCalificacionesQuery = `
        SELECT COUNT(*) as total_calificadas 
        FROM respuestas 
        WHERE id_tarea = ? AND nota IS NOT NULL
    `;
    
    db.query(checkCalificacionesQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar calificaciones:', err);
            return res.json({ success: false, message: 'Error al verificar calificaciones' });
        }

        // Verificar si hay calificaciones
        if (results[0].total_calificadas > 0) {
            return res.json({ 
                success: false, 
                message: 'No se puede eliminar la tarea porque ya tiene calificaciones asignadas' 
            });
        }

        // Verificar si la tarea existe y pertenece al profesor actual
        const checkTareaQuery = `
            SELECT id_teacher 
            FROM tareas 
            WHERE id = ?
        `;
        
        db.query(checkTareaQuery, [id], (err, tareaResults) => {
            if (err) {
                console.error('Error al verificar la tarea:', err);
                return res.json({ success: false, message: 'Error al verificar la tarea' });
            }

            if (tareaResults.length === 0) {
                return res.json({ success: false, message: 'La tarea no existe' });
            }

            // Si no hay calificaciones, proceder con la eliminación
            // Primero eliminar las respuestas no calificadas
            db.query('DELETE FROM respuestas WHERE id_tarea = ? AND nota IS NULL', [id], (err) => {
                if (err) {
                    console.error('Error al eliminar respuestas:', err);
                    return res.json({ success: false, message: 'Error al eliminar respuestas' });
                }
                
                // Luego eliminar la tarea
                db.query('DELETE FROM tareas WHERE id = ?', [id], (err, result) => {
                    if (err) {
                        console.error('Error al eliminar tarea:', err);
                        return res.json({ success: false, message: 'Error al eliminar tarea' });
                    }
                    if (result.affectedRows > 0) {
                        res.json({ success: true, message: 'Tarea eliminada correctamente' });
                    } else {
                        res.json({ success: false, message: 'No se pudo eliminar la tarea' });
                    }
                });
            });
        });
    });
});


// Ver tareas enviadas por el profesor
// app.get('/tareas-enviadas-profesor', (req, res) => {
//     if (!req.session.user || !req.session.user.id) {
//         return res.json({ success: false, tareas: [] });
//     }
//     const id_teacher = req.session.user.id;
//     const { subject, classroom } = req.query;

//     let query = 'SELECT * FROM tareas WHERE id_teacher = ?';
//     const params = [id_teacher];

//     if (subject && classroom) {
//         query += ' AND subject = ? AND classroom = ?';
//         params.push(subject, classroom);
//     }

//     db.query(query, params, (err, results) => {
//         if (err) return res.json({ success: false, tareas: [] });
//         res.json({ success: true, tareas: results });
//     });
// });




// esto e suna prueba
app.get('/tareas-enviadas-profesor', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.json({ success: false, tareas: [] });
    }
    const id_teacher = req.session.user.id;
    const subject = req.query.subject;
    const classroom = req.query.classroom;

    const query = `
        SELECT t.*, 
        EXISTS (
            SELECT 1 FROM respuestas r 
            WHERE r.id_tarea = t.id AND r.nota IS NOT NULL
        ) AS tiene_calificadas
        FROM tareas t
        WHERE t.id_teacher = ? AND t.subject = ? AND t.classroom = ?
    `;
    db.query(query, [id_teacher, subject, classroom], (err, results) => {
        if (err) return res.json({ success: false });
        res.json({ success: true, tareas: results });
    });
});



// Editar tarea
app.put('/editar-tarea', (req, res) => {
    const { id, title, description, time, due_date } = req.body;
    db.query('UPDATE tareas SET title=?, description=?, time=?, due_date=? WHERE id=?', [title, description, time, due_date, id], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// Eliminar tarea
app.delete('/eliminar-tarea', (req, res) => {
    const { id } = req.body;
    db.query('DELETE FROM tareas WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar tarea:', err);
            return res.json({ success: false });
        }
        // Verifica si realmente se eliminó una fila
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});



// RUTA ENVIAR NOTA A LOS ESTDUIANTES
app.post('/calificar-tarea', (req, res) => {
    const { id_respuesta, nota } = req.body;
    db.query('UPDATE respuestas SET nota = ? WHERE id = ?', [nota, id_respuesta], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// Ruta para obtener las tareas calificadas
app.get('/tareas-calificadas-profesor', (req, res) => {
    console.log('Recibida petición para tareas calificadas');
    
    if (!req.session.user || !req.session.user.id) {
        console.log('No hay sesión de usuario');
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const id_teacher = req.session.user.id;
    const { subject, classroom } = req.query;

    console.log('Parámetros recibidos:', { id_teacher, subject, classroom });

    if (!subject || !classroom) {
        console.log('Faltan parámetros requeridos');
        return res.status(400).json({ 
            success: false, 
            message: 'Se requieren los parámetros subject y classroom' 
        });
    }

    const query = `
        SELECT t.title, t.description, t.time, t.due_date, r.nota, s.first_name, s.last_name
        FROM tareas t
        JOIN respuestas r ON t.id = r.id_tarea
        JOIN students s ON r.id_student = s.id
        WHERE t.id_teacher = ? 
        AND t.subject = ? 
        AND t.classroom = ?
        AND r.nota IS NOT NULL
        ORDER BY t.due_date DESC, s.last_name ASC
    `;

    console.log('Ejecutando query con parámetros:', [id_teacher, subject, classroom]);

    db.query(query, [id_teacher, subject, classroom], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error en la consulta',
                error: err.message 
            });
        }

        console.log('Tareas encontradas:', results.length);
        res.json({ success: true, tareas: results });
    });
});
