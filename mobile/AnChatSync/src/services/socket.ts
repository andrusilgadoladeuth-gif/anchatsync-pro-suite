import { io } from 'socket.io-client';

// 10.0.2.2 es la IP por defecto para que el emulador de Android vea  localhost
const SOCKET_URL = 'http://10.0.2.2:3000'; 

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});