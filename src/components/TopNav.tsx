'use client';
import Link from 'next/link';

export default function TopNav() {
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
        <Link href="/app" className="text-sm font-medium">App</Link>
        <Link href="/recipes" className="text-sm font-medium">Receitas</Link>
        <Link href="/plano" className="text-sm font-medium">Plano</Link>
        <button onClick={logout} className="ml-auto text-sm underline">Sair</button>
      </div>
    </div>
  );
}
