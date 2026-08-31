'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user)); // SIMPAN KE LOCALSTORAGE
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-white text-center">Login K&B</h1>
        {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl disabled:opacity-50"
        >
          {loading? 'Loading...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
