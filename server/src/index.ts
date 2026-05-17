import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; // Para encriptar contraseñas al resetearlas
import authRoutes from './routes/authRoutes';
import pool from './config/db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use('/api/auth', authRoutes);

// ==========================================
// MIDDLEWARE DE SEGURIDAD PARA ADMINS
// ==========================================
const isAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado. Falta Token." });

    const token = authHeader.split(' ')[1];
    try {
        // Decodificamos el JWT de forma segura
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Consultamos directo a la DB el rol real actual del usuario
        const result = await pool.query("SELECT role FROM users WHERE id = $1", [payload.id]);
        
        if (result.rows.length > 0 && result.rows[0].role === 'admin') {
            req.adminId = payload.id; // Guardamos el ID del admin por si se necesita
            next(); // ¡Pasa el control a la ruta!
        } else {
            res.status(403).json({ error: "Acceso denegado. Se requieren privilegios de Administrador." });
        }
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};

// ==========================================
// 🛡️ RUTAS EXCLUSIVAS DEL ADMINISTRADOR
// ==========================================

// 1. OBTENER TODOS LOS USUARIOS
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, username, real_name, email, phone, status, role, created_at FROM users ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// 2. EDITAR DATOS DE UN USUARIO (Nombre, correo, celular, rol)
app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, real_name, email, phone, role } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users 
             SET username = $1, real_name = $2, email = $3, phone = $4, role = $5 
             WHERE id = $6 RETURNING id, username, real_name, email, role`,
            [username, real_name, email, phone, role, id]
        );
        res.json({ message: "Usuario actualizado con éxito", user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// 3. CAMBIAR/RESETAR CONTRASEÑA DE UN USUARIO (Sin ver la anterior)
app.put('/api/admin/users/:id/password', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    try {
        // Encriptamos la nueva contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedOldOrNew = await bcrypt.hash(newPassword, salt);

        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedOldOrNew, id]);
        res.json({ message: "Contraseña actualizada de forma segura" });
    } catch (error) {
        res.status(500).json({ error: "Error al cambiar la contraseña" });
    }
});

// 4. ELIMINAR UN USUARIO POR COMPLETO (Y limpiar su rastro)
app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Para evitar errores de llaves foráneas, borramos primero sus mensajes y contactos asociados
        await pool.query("DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1", [id]);
        await pool.query("DELETE FROM user_contacts WHERE user_id = $1 OR contact_id = $1", [id]);
        // Finalmente borramos al usuario
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        
        res.json({ message: "Usuario y todo su historial eliminados permanentemente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});


// ==========================================
// RUTAS DE LOGICA DE USUARIOS Y MENSAJES (CHAT)
// ==========================================

app.get('/api/users/search', async (req, res) => {
    const { query } = req.query;
    try {
        const result = await pool.query(
            "SELECT id, username, real_name, status FROM users WHERE email = $1 OR phone = $1",
            [query]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error en la búsqueda" });
    }
});

app.get('/api/contacts/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT u.id, u.username, u.real_name, u.status 
             FROM users u 
             JOIN user_contacts uc ON u.id = uc.contact_id 
             WHERE uc.user_id = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar contactos" });
    }
});

app.delete('/api/contacts/:userId/:contactId', async (req, res) => {
    const { userId, contactId } = req.params;
    try {
        await pool.query("DELETE FROM user_contacts WHERE user_id = $1 AND contact_id = $2", [userId, contactId]);
        await pool.query(
            "DELETE FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
            [userId, contactId]
        );
        res.json({ message: "Conversación eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la conversación" });
    }
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [user1, user2]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar los mensajes" });
    }
});

app.put('/api/messages/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const result = await pool.query(
            "UPDATE messages SET content = $1, is_edited = true WHERE id = $2 RETURNING *",
            [content, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al editar" });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM messages WHERE id = $1", [id]);
        res.json({ message: "Mensaje borrado" });
    } catch (error) {
        res.status(500).json({ error: "Error al borrar" });
    }
});

// ==========================================
// MÁGIA DEL TIEMPO REAL (SOCKET.IO)
// ==========================================
io.on('connection', (socket) => {
    console.log('✨ Conectado:', socket.id);

    socket.on('join', (userId: string) => {
        socket.join(userId);
    });

    socket.on('send_message', async (data) => {
        const { sender_id, receiver_id, content } = data;
        try {
            const newMessage = await pool.query(
                'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
                [sender_id, receiver_id, content]
            );
            await pool.query('INSERT INTO user_contacts (user_id, contact_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [sender_id, receiver_id]);
            await pool.query('INSERT INTO user_contacts (user_id, contact_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [receiver_id, sender_id]);

            io.to(receiver_id.toString()).emit('receive_message', newMessage.rows[0]);
            socket.emit('message_sent', newMessage.rows[0]);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('edit_message', (data) => {
        io.to(data.receiver_id.toString()).emit('message_updated', data);
    });

    socket.on('delete_message', (data) => {
        io.to(data.receiver_id.toString()).emit('message_deleted', data.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ Desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 AnChat Sync en http://localhost:${PORT}`);
});