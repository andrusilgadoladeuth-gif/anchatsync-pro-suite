import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db'; // Conexión a tu base de datos PostgreSQL

const router = express.Router();

// ==========================================
// 1. RUTA DE REGISTRO
// ==========================================
router.post('/register', async (req, res) => {
    // Ahora recibimos los nuevos campos que pusimos en el Frontend
    const { realName, username, email, phone, password } = req.body;

    try {
        // Encriptamos la contraseña por seguridad
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardamos en la base de datos (PostgreSQL)
        // Usamos "|| null" para que si el email o celular vienen vacíos, no den error
        const newUser = await pool.query(
            `INSERT INTO users (real_name, username, email, phone, password) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, username, real_name`,
            [realName, username, email || null, phone || null, hashedPassword]
        );

        res.status(201).json({ message: "Usuario creado con éxito", user: newUser.rows[0] });
    } catch (error: any) {
        console.error("Error en registro:", error);
        // Si el correo, celular o usuario ya existen, PostgreSQL lanzará un error que podemos atrapar
        res.status(400).json({ message: "El usuario, correo o celular ya están registrados." });
    }
});

// ==========================================
// 2. RUTA DE INICIO DE SESIÓN (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
    // ¡AQUÍ ESTÁ LA MAGIA! Ahora recibimos 'identifier' (Correo o Celular)
    const { identifier, password } = req.body;

    try {
        // Buscamos al usuario usando el correo o el celular
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR phone = $1",
            [identifier]
        );

        // Si no encuentra a nadie con ese correo/celular
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const user = userResult.rows[0];

        // Comparamos la contraseña encriptada
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Si todo está bien, creamos su llave de acceso (Token)
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'secreto_super_seguro_123', 
            { expiresIn: '1d' }
        );
        
        // Respondemos con el token para que el Frontend lo guarde y lo deje entrar
        res.json({ 
            token, 
            user: { id: user.id, username: user.username, real_name: user.real_name } 
        });
    } catch (error: any) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error en el servidor al intentar iniciar sesión." });
    }
});

// ==========================================
// 3. RUTA DE RECUPERACIÓN (Preparación)
// ==========================================
router.post('/recover', async (req, res) => {
    const { identifier } = req.body;
    try {
        // Por ahora solo validamos que la ruta exista y responda bien a tu nueva pantalla
        res.json({ message: "Si el usuario existe, se enviarán las instrucciones." });
    } catch (error) {
        res.status(500).json({ message: "Error procesando la recuperación." });
    }
});

export default router;