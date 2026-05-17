'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, Phone, ArrowRight, Loader2, BadgeCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [realName, setRealName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setError('Debes ingresar al menos un correo o un número de celular.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realName, username, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear la cuenta');
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] text-white">
      <div className="w-full max-w-md bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/10 shadow-lg">
        <h1 className="text-3xl font-black text-center mb-6">Crear <span className="text-indigo-500">Cuenta</span></h1>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nombre Real */}
          <div className="relative">
            <BadgeCheck className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
            <input type="text" required placeholder="Tu Nombre Real" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-indigo-500" value={realName} onChange={(e) => setRealName(e.target.value)} />
          </div>

          {/* Apodo / Username */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
            <input type="text" required placeholder="Apodo de usuario" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-indigo-500" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          {/* Correo (Opcional) */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
            <input type="email" placeholder="Correo (Opcional)" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-indigo-500" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Celular (Opcional) */}
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
            <input type="tel" placeholder="Celular (Opcional)" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-indigo-500" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
            <input type="password" required placeholder="Contraseña" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-indigo-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div className="text-red-400 text-sm text-center animate-pulse">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 mt-4">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> Registrarse <ArrowRight className="w-5 h-5" /> </>}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">¿Ya tienes cuenta? <Link href="/" className="text-indigo-400 hover:text-indigo-300">Inicia sesión aquí</Link></p>
      </div>
    </div>
  );
}