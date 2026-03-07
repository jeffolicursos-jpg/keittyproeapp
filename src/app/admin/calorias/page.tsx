'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminCaloriasPage() {
  const [email, setEmail] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [atividade, setAtividade] = useState('sedentario');
  const [objetivo, setObjetivo] = useState('perder');
  const [msg, setMsg] = useState<string>('');

  const submit = async () => {
    setMsg('');
    try {
      const res = await fetch('/api/admin/perfil/calorias/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          peso_kg: Number(peso),
          altura_cm: Number(altura),
          idade: Number(idade),
          atividade,
          objetivo
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(j?.error || 'Erro ao salvar');
        return;
      }
      setMsg(`OK: TDEE ${Math.round(j.tdee)} | Meta ${Math.round(j.meta_diaria)} kcal`);
    } catch {
      setMsg('Erro de conexão');
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <Card>
        <CardContent className="p-6 space-y-3">
          <h1 className="font-headline text-2xl">Admin • Calorias por Usuário</h1>
          <div>
            <label className="text-sm">Email do usuário</label>
            <input className="w-full border rounded px-2 py-1" value={email} onChange={e => setEmail(e.target.value)} placeholder="ex.: aluno@dominio.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-sm">Peso (kg)</label>
              <input className="w-full border rounded px-2 py-1" value={peso} onChange={e => setPeso(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Altura (cm)</label>
              <input className="w-full border rounded px-2 py-1" value={altura} onChange={e => setAltura(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Idade</label>
              <input className="w-full border rounded px-2 py-1" value={idade} onChange={e => setIdade(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Atividade</label>
              <select className="w-full border rounded px-2 py-1" value={atividade} onChange={e => setAtividade(e.target.value)}>
                <option value="sedentario">Sedentário</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="ativo">Ativo</option>
                <option value="muito_ativo">Muito ativo</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Objetivo</label>
              <select className="w-full border rounded px-2 py-1" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
                <option value="manter">Manter</option>
                <option value="perder">Perder</option>
                <option value="ganhar">Ganhar</option>
              </select>
            </div>
          </div>
          <Button onClick={submit}>Salvar</Button>
          {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
