'use client';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import HeaderNav from '@/components/HeaderNav';

const items = [
  { name: 'Carla', text: 'Perdi 7kg em 2 meses com receitas fáceis.', img: '/images/avatar.jpg' },
  { name: 'Rafael', text: 'Treinos curtos e eficientes, ganhei energia.', img: '/images/avatar.jpg' },
  { name: 'Ana', text: 'O plano VIP me deu direção e constância.', img: '/images/avatar.jpg' },
  { name: 'Lucas', text: 'Aprendi a montar pratos saudáveis sem gastar muito.', img: '/images/avatar.jpg' },
  { name: 'Marina', text: 'Resultados reais e acompanhamento sem complicação.', img: '/images/avatar.jpg' },
];

export default function DepoimentosPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-10">
        <HeaderNav />
        <h1 className="text-2xl font-bold mb-6">Resultados reais de alunos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((d, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <img src={d.img} alt={d.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="font-semibold">{d.name}</div>
              </div>
              <div className="text-sm text-muted-foreground">{d.text}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
