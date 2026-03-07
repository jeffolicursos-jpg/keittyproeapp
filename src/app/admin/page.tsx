'use client';
import HeaderNav from '@/components/HeaderNav';
import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="min-h-screen px-4 pt-8 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <HeaderNav />
        <h1 className="text-2xl font-bold">Painel do Admin</h1>
        <p className="text-sm text-muted-foreground">Acesso rápido às principais áreas de gestão.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/receitas" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Receitas</div>
            <div className="text-sm text-muted-foreground">Listar, editar, excluir e importar CSV.</div>
          </Link>
          <Link href="/admin/analytics" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Analytics</div>
            <div className="text-sm text-muted-foreground">Cards, gráfico, tabela e CSV.</div>
          </Link>
          <Link href="/admin/planos" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Planos (Acesso)</div>
            <div className="text-sm text-muted-foreground">Definir páginas por plano.</div>
          </Link>
          <Link href="/admin/import-unificado" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Importação Unificada</div>
            <div className="text-sm text-muted-foreground">Exercícios, dias e grupos em um único CSV.</div>
          </Link>
          <Link href="/admin/training-days" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Dias de Treino</div>
            <div className="text-sm text-muted-foreground">Visualizar composição e navegar pelos exercícios.</div>
          </Link>
          <Link href="/recipes" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Receitas (App)</div>
            <div className="text-sm text-muted-foreground">Lista pública com cronômetro e detalhes.</div>
          </Link>
          <Link href="/dashboard" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Dashboard do Aluno</div>
            <div className="text-sm text-muted-foreground">Visão geral do aluno para validação.</div>
          </Link>
          <Link href="/planos" className="rounded-lg border bg-card p-4 hover:bg-muted">
            <div className="font-semibold">Planos Públicos</div>
            <div className="text-sm text-muted-foreground">Funil de planos e CTA de compra.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
