'use client';
import Link from 'next/link';

export default function PublicHeader() {
  const isLogged = typeof document !== 'undefined' && document.cookie.includes('access=');
  const target = isLogged ? '/dashboard' : '/login';
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm sm:text-base font-bold">Clube Emagrecimento</span>
          <nav className="hidden sm:flex items-center gap-3">
            <Link href="/" className="text-sm">Home</Link>
            <Link href="/planos" className="text-sm">Planos</Link>
            <Link href="/sobre" className="text-sm">Sobre</Link>
          </nav>
        </div>
        <Link href={target} className="text-sm underline">Entrar</Link>
      </div>
    </header>
  );
}
