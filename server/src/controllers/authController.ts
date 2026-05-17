import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response): Promise<any> => {
    const { username, email, password } = req.body;

    try {
        // 1. Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Guardar en PostgreSQL
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "Usuario creado con éxito", user: newUser.rows[0] });
    } catch (error: any) {
        res.status(500).json({ error: "Error al registrar: " + error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // 2. Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 3. Crear el Token (JWT)
        const token = jwt.sign(
            { id: user.rows[0].id, username: user.rows[0].username },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ message: "Login exitoso", token, user: { id: user.rows[0].id, username: user.rows[0].username } });
    } catch (error: any) {
        res.status(500).json({ error: "Error en el login: " + error.message });
    }
};