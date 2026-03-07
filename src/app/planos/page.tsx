'use client';
import PublicHeader from '@/components/PublicHeader';
import HeaderNav from '@/components/HeaderNav';

export default function PlanosPage() {
  const planos = [
    { nome: 'Básico', preco: 'R$29/mês', beneficios: ['Receitas'], link: 'https://kiwify.com.br/placeholder-basico' },
    { nome: 'Premium', preco: 'R$49/mês', beneficios: ['Receitas', 'Treinos'], link: 'https://kiwify.com.br/placeholder-premium' },
    { nome: 'VIP', preco: 'R$99/mês', beneficios: ['Receitas', 'Treinos', 'Coach'], link: 'https://kiwify.com.br/placeholder-vip' },
  ];
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-10">
        <HeaderNav />
        <h1 className="text-2xl font-bold mb-6">Planos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {planos.map((p) => (
            <div key={p.nome} className="rounded-lg border bg-card p-4">
              <div className="text-lg font-semibold">{p.nome}</div>
              <div className="text-sm text-muted-foreground mb-2">{p.preco}</div>
              <ul className="text-sm mb-4">
                {p.beneficios.map((b) => <li key={b}>• {b}</li>)}
              </ul>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground">
                Comprar → Kiwify
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
