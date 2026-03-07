'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-sm text-muted-foreground">
          Dieta Template Verde © 2026 | São Paulo SP
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link href="/" className="text-sm underline">Home</Link>
          <Link href="/app" className="text-sm underline">App</Link>
          <Link href="/planos" className="text-sm underline">Planos</Link>
          <Link href="/sobre" className="text-sm underline">Sobre</Link>
          <Link href="/privacidade" className="text-sm underline">Privacidade</Link>
          <Link href="/termos" className="text-sm underline">Termos</Link>
        </div>
        <div className="mt-3 text-sm">Kiwify Pagamentos Seguros</div>
      </div>
    </footer>
  );
}
