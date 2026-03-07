'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TopNav from '@/components/TopNav';
import { useToast } from '@/hooks/use-toast';
import HeaderNav from '@/components/HeaderNav';

export default function PlanoPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch('/api/subscriptions/me', { cache: 'no-store' }).then(res => res.json());
        setSub(r.subscription || null);
      } catch {}
      setLoading(false);
    };
    run();
  }, []);

  const cancelar = async () => {
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
      if (res.ok) {
        setSub((prev: any) => ({ ...(prev || {}), status: 'cancelada' }));
        toast({ title: 'Assinatura cancelada', description: 'Seu plano foi cancelado.' });
      } else {
        toast({ title: 'Falha ao cancelar', description: 'Tente novamente mais tarde.' });
      }
    } catch {
      toast({ title: 'Erro de conexão', description: 'Verifique sua rede e tente de novo.' });
    }
  };

  return (
    <div className="min-h-screen px-4 pt-14 pb-6">
      <TopNav />
      <div className="max-w-3xl mx-auto space-y-4">
        <HeaderNav />
        <h1 className="text-xl font-bold">Meu Plano</h1>
        {!sub && !loading && <div className="text-sm text-muted-foreground">Sem assinatura vinculada.</div>}
        {sub && (
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-semibold mb-2">{sub.status}</div>
            <div className="text-sm text-muted-foreground">Início</div>
            <div className="mb-2">{sub.data_inicio || '—'}</div>
            <div className="text-sm text-muted-foreground">Gateway</div>
            <div className="mb-2">{sub.gateway}</div>
            <div className="text-sm text-muted-foreground">Histórico</div>
            <div className="text-xs">{JSON.stringify(sub.historico || {})}</div>
            <div className="mt-4">
              <Button variant="outline" onClick={cancelar}>Cancelar assinatura</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
