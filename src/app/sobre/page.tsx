'use client';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import HeaderNav from '@/components/HeaderNav';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-10 space-y-6">
        <HeaderNav />
        <h1 className="text-2xl font-bold">Sobre o Clube de Emagrecimento</h1>
        <p className="text-sm text-muted-foreground">
          Programa de assinatura focado em resultados: receitas práticas, treinos eficientes e acompanhamento inteligente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-1">Receitas</div>
            <div className="text-sm text-muted-foreground">Cardápio saudável e acessível para o dia a dia.</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-1">Treinos</div>
            <div className="text-sm text-muted-foreground">Protocolos simples que maximizam resultados.</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-1">Suporte</div>
            <div className="text-sm text-muted-foreground">Comunidade e ferramentas para manter constância.</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-1">Carla</div>
            <div className="text-sm text-muted-foreground">Perdi 7kg em 2 meses com receitas fáceis.</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-1">Rafael</div>
            <div className="text-sm text-muted-foreground">Treinos curtos e eficientes, ganhei energia.</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-1">Ana</div>
            <div className="text-sm text-muted-foreground">O plano VIP me deu direção e constância.</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
