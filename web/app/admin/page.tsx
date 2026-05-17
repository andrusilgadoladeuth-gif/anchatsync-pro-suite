'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Key, Trash2, Pencil, ArrowLeft, Users, Mail, Phone, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modales y Estados de edición
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Campos de los formularios
  const [editForm, setEditForm] = useState({ username: '', real_name: '', email: '', phone: '', role: 'user' });
  const [newPassword, setNewPassword] = useState('');

  const router = useRouter();

  // Cargar lista completa de usuarios
  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setError('');
      } else {
        const errData = await res.json();
        setError(errData.error || 'No tienes acceso a este panel.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  // Abrir formulario de edición
  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      real_name: user.real_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user'
    });
    setIsEditModalOpen(true);
  };

  // Enviar edición de usuario
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        alert('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Enviar reseteo de contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        alert('Contraseña cambiada exitosamente.');
        setIsPasswordModalOpen(false);
        setNewPassword('');
      } else {
        const err = await res.json();
        alert(err.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Eliminar usuario por completo
  const handleDeleteUser = async (id: number, username: string) => {
    const confirmDelete = confirm(`⚠️ ¿ESTÁS COMPLETAMENTE SEGURO de eliminar al usuario "${username}"?\nEsto borrará permanentemente su cuenta, historial de chats y contactos. Esta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchUsers();
      } else {
        alert('No se pudo eliminar al usuario');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center text-indigo-400 font-medium">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Shield className="w-8 h-8 animate-spin" />
          <span>Autenticando credenciales de administración...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-200 p-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-red-400 tracking-tight">ACCESO RESTRINGIDO</h1>
        <p className="text-slate-500 mt-2 text-center max-w-sm">{error}</p>
        <button onClick={() => router.push('/chat')} className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 text-sm rounded-xl flex items-center gap-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Regresar al chat
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-indigo-500 w-6 h-6" />
              <h1 className="text-3xl font-black tracking-tight italic">AnChat <span className="text-indigo-500">Admin</span></h1>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mt-1">Panel de Control Global del Sistema</p>
          </div>
          <button onClick={() => router.push('/chat')} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/5 text-sm font-medium rounded-xl flex items-center gap-2 transition-all active:scale-95">
            <ArrowLeft className="w-4 h-4" /> Volver al Chat
          </button>
        </header>

        {/* CONTENEDOR TABLA */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-2">
            <Users className="text-indigo-400 w-5 h-5" />
            <h2 className="font-bold text-lg text-slate-200">Usuarios Registrados ({users.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/5">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Nombre Real</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Rango / Rol</th>
                  <th className="p-4 text-center pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 font-mono text-slate-500 text-xs">#{u.id}</td>
                    <td className="p-4 font-semibold text-white">{u.username}</td>
                    <td className="p-4 text-slate-400">{u.real_name || 'No registrado'}</td>
                    <td className="p-4 space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400"><Mail className="w-3.5 h-3.5 text-slate-600" /> {u.email}</div>
                      <div className="flex items-center gap-1.5 text-slate-400"><Phone className="w-3.5 h-3.5 text-slate-600" /> {u.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${u.role === 'admin' ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(u)} className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-400 border border-white/5 transition-all" title="Editar datos">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(u); setIsPasswordModalOpen(true); }} className="p-2 bg-slate-800 hover:bg-amber-600 hover:text-white rounded-xl text-slate-400 border border-white/5 transition-all" title="Cambiar contraseña">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-xl text-slate-400 border border-white/5 transition-all" title="Eliminar usuario">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🟥 MODAL: EDITAR USUARIO */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><Pencil className="w-5 h-5 text-indigo-500" /> Editar Cuenta: <span className="text-indigo-400">{selectedUser?.username}</span></h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Username</label>
                  <input type="text" required value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Nombre Real</label>
                  <input type="text" value={editForm.real_name} onChange={(e) => setEditForm({...editForm, real_name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Correo Electrónico</label>
                  <input type="email" required value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Celular / Teléfono</label>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Rango del Sistema</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white">
                    <option value="user">User (Usuario Estándar)</option>
                    <option value="admin">Admin (Administrador Supremo)</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/10">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🟨 MODAL: ASIGNAR NUEVA CONTRASEÑA */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-lg font-bold mb-2 text-white flex items-center gap-2"><Key className="w-5 h-5 text-amber-500" /> Sobrescribir Llave</h3>
              <p className="text-xs text-slate-400 mb-4">Estás forzando un cambio de contraseña para <span className="text-amber-400 font-semibold">{selectedUser?.username}</span>. Recuerda guardarla bien de forma externa.</p>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Nueva Contraseña</label>
                  <input type="password" required placeholder="Mínimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/10">Actualizar Llave</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}