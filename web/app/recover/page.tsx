'use client';
import { useState } from 'react';
import Link from 'next/link';
import { User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function RecoverPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Aquí conectaremos con el Backend más adelante para enviar el correo/SMS de recuperación
      const res = await fetch('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      // Si todo sale bien, mostramos un mensaje de éxito
      setMessage('Si el usuario existe, hemos enviado las instrucciones para recuperar el acceso.');

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
          <p className="text-slate-400 font-medium">Recuperar acceso</p>
          <p className="text-sm text-slate-500 mt-2">
            Ingresa tu correo electrónico o celular y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleRecover} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
            <input
              type="text"
              required
              placeholder="Correo o Celular registrado"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* Mensaje de error dinámico */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          {/* Mensaje de éxito dinámico */}
          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || message !== ''}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 mt-8"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <> Enviar instrucciones <ArrowRight className="w-5 h-5" /> </>
            )}
          </button>
        </form>

        {/* Sección de enlace para volver */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 font-semibold hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}