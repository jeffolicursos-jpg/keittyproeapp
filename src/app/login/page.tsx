'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@seusistema.com');
  const [senha, setSenha] = useState('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage(data?.error || 'Falha no login');
        return;
      }
      const role = data?.user?.role || 'usuario';
      if (role === 'admin') window.location.href = '/admin';
      else window.location.href = '/dashboard';
    } catch (e: any) {
      setLoading(false);
      setMessage('Erro de conexão');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-bold text-center">Entrar</h1>
        <input
          className="w-full p-2 border rounded"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={doLogin}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {message && <div className="text-sm text-red-600">{message}</div>}
      </div>
    </div>
  );
}
