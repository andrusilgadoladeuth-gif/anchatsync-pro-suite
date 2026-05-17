'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Menu, Users, LogOut, UserCircle, Search, Trash2, Pencil, X, Shield } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [selectedUser, setSelectedUser] = useState<any | null>(null); 
  const [messages, setMessages] = useState<any[]>([]); 
  const [messageInput, setMessageInput] = useState(''); 
  
  // Estados para la lógica de edición
  const [editingMessage, setEditingMessage] = useState<any | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Estado para controlar si es administrador
  const [isAdmin, setIsAdmin] = useState(false);
  
  const router = useRouter();

  // 1. EFECTO DE CONEXIÓN Y SOCKETS
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // 🔍 Mantenemos la línea espía en consola para monitorear el token
      console.log("🔍 CONTENIDO DEL TOKEN DE ANDRU:", payload);
      
      setCurrentUserId(payload.id);

      // 🚀 PLAN DE EMERGENCIA: Como el token no trae la propiedad role, validamos con tu ID que es 1
      if (payload.id === 1) {
        setIsAdmin(true);
      }

      const newSocket = io('http://localhost:3000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('✅ Conectado al servidor en tiempo real');
        newSocket.emit('join', payload.id.toString());
      });

      newSocket.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
        
        setContacts((prev) => {
          const exists = prev.find(c => c.id === msg.sender_id);
          if (!exists) {
              fetchContacts(payload.id); 
          }
          return prev;
        });
      });

      newSocket.on('message_sent', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      // ESCUCHAR EDICIÓN EN TIEMPO REAL
      newSocket.on('message_updated', (updatedMsg) => {
        setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      });

      // ESCUCHAR ELIMINACIÓN EN TIEMPO REAL
      newSocket.on('message_deleted', (deletedId) => {
        setMessages((prev) => prev.filter(m => m.id !== deletedId));
      });

      setSocket(newSocket);
      return () => { newSocket.disconnect(); };
      
    } catch (error) {
      console.error("Error leyendo token:", error);
    }
  }, [router]);

  // 2. FUNCIÓN PARA CARGAR CONTACTOS
  const fetchContacts = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contacts/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Error cargando contactos:", error);
    }
  };

  // 3. CARGAR CONTACTOS AL INICIAR
  useEffect(() => {
    if (currentUserId) {
      fetchContacts(currentUserId);
    }
  }, [currentUserId]);

  // 4. CARGAR HISTORIAL AL SELECCIONAR CONTACTO
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/messages/${currentUserId}/${selectedUser.id}`);
        if (res.ok) {
          const history = await res.json();
          setMessages(history);
        }
      } catch (error) {
        console.error("Error descargando el historial:", error);
      }
    };
    fetchHistory();
    setEditingMessage(null);
    setMessageInput('');
  }, [selectedUser, currentUserId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/search?query=${searchQuery}`);
      if (res.ok) {
        const user = await res.json();
        setContacts((prev) => {
          if (!prev.find(c => c.id === user.id)) return [...prev, user];
          return prev;
        });
        setSearchQuery('');
      } else {
        alert('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error buscando:', error);
    }
  };

  // ACCIÓN ENVIAR O ACTUALIZAR MENSAJE
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser || !currentUserId || !socket) return;

    if (editingMessage) {
      // SI ESTAMOS EDITANDO
      try {
        const res = await fetch(`http://localhost:3000/api/messages/${editingMessage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageInput })
        });
        if (res.ok) {
          const updatedMsg = await res.json();
          setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
          
          // Notificar vía socket al receptor
          socket.emit('edit_message', { ...updatedMsg, receiver_id: selectedUser.id });
          
          setEditingMessage(null);
          setMessageInput('');
        }
      } catch (error) {
        console.error("Error editando mensaje:", error);
      }
    } else {
      // SI ES UN ENVIÓ NORMAL
      socket.emit('send_message', {
        sender_id: currentUserId,
        receiver_id: selectedUser.id,
        content: messageInput
      });
      setMessageInput(''); 
    }
  };

  // ACCIÓN ELIMINAR MENSAJE INDIVIDUAL
  const handleDeleteMessage = async (msgId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/messages/${msgId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages((prev) => prev.filter(m => m.id !== msgId));
        if (socket && selectedUser) {
          socket.emit('delete_message', { id: msgId, receiver_id: selectedUser.id });
        }
      }
    } catch (error) {
      console.error("Error borrando mensaje:", error);
    }
  };

  // ACCIÓN ELIMINAR CONVERSACIÓN COMPLETA
  const handleDeleteConversation = async () => {
    if (!selectedUser || !currentUserId) return;
    const confirmDelete = confirm(`¿Estás seguro de eliminar la conversación con ${selectedUser.real_name || selectedUser.username}? Esto limpiará todo el historial.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/api/contacts/${currentUserId}/${selectedUser.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setContacts((prev) => prev.filter(c => c.id !== selectedUser.id));
        setMessages([]);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error eliminando conversación:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (socket) socket.disconnect();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-6 flex-1 flex flex-col h-full overflow-hidden">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-indigo-500 tracking-tighter italic">AnChat Sync</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Messenger System</p>
          </div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Users className="text-indigo-500" /> Contactos</h2>
          <form onSubmit={handleSearch} className="mb-6 relative">
            <input type="text" placeholder="Buscar correo o celular..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <button type="submit" className="absolute right-2 top-2 text-slate-400 hover:text-indigo-400"><Search className="w-5 h-5" /></button>
          </form>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {contacts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-4">Busca a alguien para empezar.</p>
            ) : (
              contacts.map((user) => (
                <div key={user.id} onClick={() => { setSelectedUser(user); setShowSidebar(false); }} className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group border ${selectedUser?.id === user.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800/30 hover:bg-indigo-500/10 border-transparent hover:border-indigo-500/30'}`}>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><UserCircle className="w-6 h-6" /></div>
                  <div>
                    <p className="font-medium text-slate-200">{user.real_name || user.username}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${user.status === 'offline' ? 'bg-slate-500' : 'bg-emerald-500'}`}></span> {user.status || 'Disponible'}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 🛡️ BOTÓN UBICADO ARRIBA DEL BOTÓN DE CERRAR SESIÓN */}
          {isAdmin && (
            <button 
              onClick={() => router.push('/admin')}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/5 cursor-pointer group shrink-0"
            >
              <Shield className="w-5 h-5 text-indigo-500 group-hover:text-white transition-colors" />
              <span>Eres Administrador</span>
            </button>
          )}

          <button onClick={handleLogout} className="mt-2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 rounded-xl border border-red-500/20 active:scale-95 shrink-0"><LogOut className="w-5 h-5" /> Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2 hover:bg-white/5 rounded-lg"><Menu className="text-white" /></button>
            <div>
              <h3 className="font-bold text-white">{selectedUser ? selectedUser.real_name || selectedUser.username : 'Sala de Espera'}</h3>
              <p className="text-xs flex items-center gap-1 text-slate-400">
                {socket ? <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Conectado a la red</> : <><span className="w-2 h-2 rounded-full bg-red-500"></span> Desconectado</>}
              </p>
            </div>
          </div>
          {selectedUser && (
            <button onClick={handleDeleteConversation} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Eliminar conversación">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {!selectedUser ? (
            <div className="h-full flex items-center justify-center text-slate-500">Selecciona o busca un contacto para chatear</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">No hay mensajes aún. ¡Di hola!</div>
          ) : (
            messages.filter(m => (m.sender_id === currentUserId && m.receiver_id === selectedUser.id) || (m.sender_id === selectedUser.id && m.receiver_id === currentUserId))
            .map((msg, index) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div key={msg.id || index} className={`flex items-center gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* ICONOS DE ACCIONES PARA MIS MENSAJES */}
                  {isMe && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/5 order-1">
                      <button onClick={() => { setEditingMessage(msg); setMessageInput(msg.content); }} className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors" title="Editar mensaje">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors" title="Eliminar mensaje">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className={`max-w-[80%] p-3 rounded-2xl shadow-lg relative ${isMe ? 'bg-indigo-600 text-white rounded-tr-none order-2 shadow-indigo-500/10' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.is_edited && (
                      <span className="text-[9px] text-white/50 block text-right mt-1 italic">editado</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/40 border-t border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            
            {/* PANEL DE INDICACIÓN DE EDICIÓN */}
            {editingMessage && (
              <div className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-400">
                <span>Editando mensaje...</span>
                <button type="button" onClick={() => { setEditingMessage(null); setMessageInput(''); }} className="p-1 hover:bg-indigo-500/20 rounded-lg text-indigo-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input type="text" placeholder={selectedUser ? (editingMessage ? "Corrige tu mensaje..." : "Escribe un mensaje...") : "Selecciona un chat primero..."} disabled={!selectedUser} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50" />
              <button type="submit" disabled={!selectedUser || !messageInput.trim()} className="p-3 bg-indigo-600 rounded-2xl active:scale-95 text-white disabled:opacity-50 shadow-lg shadow-indigo-500/10">
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}