'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Home } from 'lucide-react';

export default function AdminUsuariosPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [sexo, setSexo] = useState('outro');
  const [nascimento, setNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [objetivo, setObjetivo] = useState('perder');
  const [atividade, setAtividade] = useState('sedentario');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [msg, setMsg] = useState('');
  const [items, setItems] = useState<Array<{ id: string; nome: string; email: string; cpf?: string; valid_until?: string }>>([]);
  const [filter, setFilter] = useState('');
  const [plano, setPlano] = useState<'basico' | 'premium' | 'vip'>('basico');
  const [planosDisponiveis, setPlanosDisponiveis] = useState<Array<{ key: 'basico' | 'premium' | 'vip'; label: string }>>([
    { key: 'basico', label: 'Básico' },
    { key: 'premium', label: 'Premium' },
    { key: 'vip', label: 'VIP' },
  ]);

  const salvar = async () => {
    setMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nome, email, senha, cpf,
          sexo, data_nascimento: nascimento, telefone,
          objetivo, atividade, peso_kg: Number(peso), altura_cm: Number(altura),
          plano
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(j?.error || 'Erro ao salvar'); return; }
      setMsg('Usuário cadastrado com sucesso');
      setNome(''); setEmail(''); setSenha(''); setCpf(''); setPeso(''); setAltura(''); setTelefone(''); setNascimento('');
      await carregar();
    } catch { setMsg('Erro de conexão'); }
  };
  const carregar = async () => {
    try {
      const r = await fetch('/api/admin/users', { cache: 'no-store' });
      const j = await r.json();
      setItems(j.items || []);
    } catch {}
  };
  const addMes = async (id: string) => {
    try {
      await fetch(`/api/admin/users/${id}/validity`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ add_months: 1 })
      });
      await carregar();
    } catch {}
  };
  (async () => { await carregar(); })();
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/planos', { cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          const cfg = j?.config || {};
          const keys: Array<'basico' | 'premium' | 'vip'> = ['basico', 'premium', 'vip'];
          const list = keys.map(k => ({ key: k, label: k === 'basico' ? 'Básico' : (k === 'premium' ? 'Premium' : 'VIP') }));
          setPlanosDisponiveis(list);
        }
      } catch {}
    })();
  }, []);

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { window.location.href = '/'; }}>
          <Home className="w-4 h-4 mr-1" /> Home
        </Button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-headline text-2xl">Admin • Cadastrar Usuário</h1>
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div><label className="text-sm">Nome</label><Input value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><label className="text-sm">Email</label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="text-sm">Senha</label><Input type="password" value={senha} onChange={e => setSenha(e.target.value)} /></div>
            <div><label className="text-sm">CPF</label><Input value={cpf} onChange={e => setCpf(e.target.value)} /></div>
            <div>
              <label className="text-sm">Sexo</label>
              <select className="w-full border rounded px-2 py-1" value={sexo} onChange={e => setSexo(e.target.value)}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div><label className="text-sm">Data de nascimento</label><Input type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} /></div>
            <div><label className="text-sm">Telefone</label><Input value={telefone} onChange={e => setTelefone(e.target.value)} /></div>
            <div>
              <label className="text-sm">Objetivo</label>
              <select className="w-full border rounded px-2 py-1" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
                <option value="perder">Perder peso</option>
                <option value="manter">Manter</option>
                <option value="ganhar">Ganhar massa</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Nível de atividade</label>
              <select className="w-full border rounded px-2 py-1" value={atividade} onChange={e => setAtividade(e.target.value)}>
                <option value="sedentario">Sedentário</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="ativo">Ativo</option>
                <option value="muito_ativo">Muito ativo</option>
              </select>
            </div>
            <div><label className="text-sm">Peso (kg)</label><Input type="number" value={peso} onChange={e => setPeso(e.target.value)} /></div>
            <div><label className="text-sm">Altura (cm)</label><Input type="number" value={altura} onChange={e => setAltura(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Plano</label>
              <select className="w-full border rounded px-2 py-1" value={plano} onChange={e => setPlano(e.target.value as any)}>
                {planosDisponiveis.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button onClick={salvar}>Salvar</Button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </CardContent>
      </Card>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-headline text-xl">Usuários cadastrados</h2>
          <Input placeholder="Filtrar por nome, email ou CPF" value={filter} onChange={e => setFilter(e.target.value)} className="max-w-xs" />
        </div>
        <div className="rounded border">
          <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted text-xs font-semibold">
            <div>Nome</div><div>Email</div><div>CPF</div><div>Validade</div><div>Ações</div>
          </div>
          {items
            .filter(u => {
              const f = filter.trim().toLowerCase();
              if (!f) return true;
              return (u.nome || '').toLowerCase().includes(f) || (u.email || '').toLowerCase().includes(f) || (u.cpf || '').toLowerCase().includes(f);
            })
            .map(u => (
              <div key={u.id} className="grid grid-cols-5 gap-2 px-3 py-2 border-t text-sm">
                <div>{u.nome}</div>
                <div>{u.email}</div>
                <div>{u.cpf || '-'}</div>
                <div>{u.valid_until || '-'}</div>
                <div>
                  <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => addMes(u.id)}>+1 Mês</Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
