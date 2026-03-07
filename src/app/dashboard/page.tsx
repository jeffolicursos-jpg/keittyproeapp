'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TopNav from '@/components/TopNav';
import HeaderNav from '@/components/HeaderNav';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('...');
  const [plano, setPlano] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = document.cookie.split('; ').find(c => c.startsWith('email='))?.split('=')[1] || '';
    const run = async () => {
      try {
        if (email) {
          const u = await fetch(`/api/test/user?email=${encodeURIComponent(email)}`, { cache: 'no-store' }).then(r => r.json());
          setUser(u.user || null);
        }
      } catch {}
      try {
        const subs = await fetch('/api/subscriptions/me', { cache: 'no-store' }).then(r => r.json());
        setStatus(subs.subscription?.status || 'none');
        setPlano(subs.subscription?.plano || null);
      } catch {}
      try {
        const rec = await fetch('/api/recipes?limit=6', { cache: 'no-store' }).then(r => r.json());
        setRecipes(rec.items || []);
      } catch {}
      setLoading(false);
    };
    run();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen px-4 pt-14 pb-6">
      <TopNav />
      <div className="max-w-4xl mx-auto space-y-4">
        <HeaderNav />
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Bem-vindo</div>
            <div className="text-lg font-semibold">{user?.nome || 'Aluno'}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Status do Plano</div>
            <div className="text-lg font-semibold">{status}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Receitas / Treinos</div>
            <div className="text-lg font-semibold">{recipes.length} / —</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(plano === 'premium' || plano === 'vip') && (
            <div className="p-4 rounded-lg border bg-card">
              <div className="font-semibold mb-1">Acesso Premium</div>
              <a href="/training/day/1" className="text-sm underline">Ver Treinos</a>
            </div>
          )}
          {plano === 'vip' && (
            <div className="p-4 rounded-lg border bg-card">
              <div className="font-semibold mb-1">Acesso VIP</div>
              <a href="/planilha" className="text-sm underline">Ver Planilha</a>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Receitas recentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recipes.map((r) => (
              <a key={r.recipe_number} href={`/recipe/${r.recipe_number}`} className="p-3 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground">#{r.recipe_number}</div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">status: {r.status}</div>
              </a>
            ))}
            {recipes.length === 0 && !loading && (
              <div className="text-sm text-muted-foreground">Sem receitas cadastradas</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
