import pool from './config/db';

const testInsert = async () => {
    try {
        console.log('⏳ Intentando insertar mensaje de prueba...');
        
        // Cambiamos el [1, 2, ...] por [1, 1, ...] porque el usuario 2 no existe aún
        const res = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [1, 1, '¡Confirmado! La base de datos de AnChat Sync está viva 🚀']
        );
        
        console.log('✅ ¡ÉXITO! Mensaje guardado en PostgreSQL:');
        console.table(res.rows[0]); 
        
    } catch (err: any) {
        console.error('❌ Error insertando:', err.message);
        console.log('💡 Tip: Asegúrate de que el usuario con ID 1 ya exista en la tabla "users".');
    } finally {
        // Cerramos la conexión para que el script termine solo
        await pool.end();
        console.log('🔌 Conexión cerrada.');
    }
};

testInsert();