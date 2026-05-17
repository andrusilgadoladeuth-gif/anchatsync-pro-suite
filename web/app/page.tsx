'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react'; // Cambiamos Mail por User

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // Ahora acepta correo o celular
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Limpiamos errores previos

    try {
      // Aquí llamamos a tu Backend
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }), // Enviamos el dato genérico
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      // 1. Guardamos la llave de acceso en el navegador
      localStorage.setItem('token', data.token);
      // También la guardamos como Cookie para que el Guardia (Middleware) pueda leerla
      document.cookie = `token=${data.token}; path=/; max-age=86400`; // Expira en 1 día

      // 2. ¡Redirección mágica a la sala de chat!
      router.push('/chat');

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      
      {/* Tarjeta con Glassmorphism (Diseño original conservado) */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]">
        
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-2xl bg-indigo-500/10 mb-4 border border-indigo-500/20">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              AnChat<span className="text-indigo-500">Sync</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium">Acceso seguro a la red</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            {/* Ícono de Usuario actualizado conservando el diseño original */}
            <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
            <input
              type="text"
              required
              placeholder="Correo o Celular"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
            <input
              type="password"
              required
              placeholder="Contraseña"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Mensaje de error dinámico */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 mt-8"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <> Entrar a la red <ArrowRight className="w-5 h-5" /> </>
            )}
          </button>
        </form>

        {/* Sección de enlaces actualizada conservando el estilo de la línea divisoria */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center space-y-4">
          <p>
            <Link href="/recover" className="text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              ¿Olvidaste tu contraseña? Recupérala aquí
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            ¿Nuevo aquí?{' '}
            <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Crea una cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}