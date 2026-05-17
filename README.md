# 🚀 AnChatSync Pro Suite - Real-Time Ecosystem

**AnChatSync Pro Suite** es un ecosistema completo de mensajería instantánea diseñado con una arquitectura robusta y profesional. Integra un servidor escalable, una plataforma web administrativa y una aplicación móvil nativa sincronizada en tiempo real.

## 📝 Descripción del Proyecto
Este sistema permite la comunicación fluida multiplataforma. Utiliza una arquitectura basada en **Controladores** y **Rutas** para garantizar que cada mensaje, edición o eliminación se refleje instantáneamente en todos los clientes mediante WebSockets.

---

## 🛠️ Tecnologías Utilizadas (Full Stack)

### 🌍 Backend (Server)
* **Node.js & Express:** Motor de la API REST.
* **TypeScript:** Implementación de tipado estático en todo el servidor.
* **Socket.io:** Motor de comunicación bidireccional en tiempo real.
* **PostgreSQL:** Base de datos relacional para persistencia de datos.
* **Estructura Profesional:** Organización por `controllers/`, `routes/`, y `config/` (db.ts).
* **Scripts de Inicialización:** `initDb.ts` y `check-db.ts` para gestión de esquema.

### 📱 Mobile App (AnChatSync)
* **Expo (React Native):** Framework para el desarrollo de la aplicación híbrida.
* **TypeScript:** Uso de `.tsx` para pantallas y componentes.
* **Context API:** Gestión de estado global mediante `AuthContext.tsx`.
* **Lucide React Native:** Set de iconos profesionales.
* **Socket.io Client:** Sincronización instantánea con el backend.
* **Servicios Dedicados:** Carpeta `services/` con `socket.ts` para modularizar la conexión.

### 💻 Web Client (Next.js)
* **Next.js (App Router):** Estructura moderna de carpetas (`app/chat/page.tsx`).
* **Tailwind CSS:** Diseño responsivo y estilizado oscuro (Dark Mode).
* **TypeScript:** Garantía de consistencia de tipos entre Web y Servidor.

---

## 📂 Arquitectura Destacada
* **Seguridad:** Gestión de sesiones y autenticación integrada.
* **Gestión de Datos:** Archivo `database.sql` incluido para replicar el esquema.
* **Asistencia Avanzada:** Configuración para Agentes de IA (`AGENTS.md`, `CLAUDE.md`).

---

## ⚠️ Notas de Configuración (Importante)

### Conexión del Dispositivo Móvil
El error de **"Error de Conexión"** visto en las pruebas iniciales se debe al uso de una **IP Dinámica** o marcador de posición (`192.168.X.X`). Para un funcionamiento correcto:
1. Identifica tu IP local real (ej. `192.168.101.16`).
2. Actualiza la constante `BASE_URL` en la App y en la Web.
3. Asegúrate de que el servidor y el móvil estén en la misma red.

---

## 👨‍💻 Autor
**Andru** - *Desarrollador Full Stack*