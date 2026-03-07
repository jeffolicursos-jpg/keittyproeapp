'use client';
import { useEffect, useState } from 'react';
import HeaderNav from '@/components/HeaderNav';
import Link from 'next/link';
import { trainingDaysDef } from '@/app/training-data';

export default function AdminTrainingDays() {
  const [items, setItems] = useState<Array<{ id: string; title: string; overview?: string }>>([]);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroup, setNewGroup] = useState({ order: 1, exercise_a_slug: '', exercise_b_slug: '', prescription: '' });
  const [newDay, setNewDay] = useState({ id: '', title: '', overview: '', cardio_title: '', cardio_prescription: '' });
  const [migrateMsg, setMigrateMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/training/days?limit=100', { cache: 'no-store' });
        const j = await r.json().catch(() => ({ items: [] }));
        if (Array.isArray(j.items) && j.items.length) {
          setItems(j.items);
        } else {
          // Fallback para dados locais exibidos na Home
          const locals = trainingDaysDef.map(d => ({ id: String(d.id), title: d.title, overview: d.overview }));
          setItems(locals);
          setMsg('Exibindo dias locais (fallback). Use Importação Unificada para migrar ao banco.');
        }
      } catch {
        const locals = trainingDaysDef.map(d => ({ id: String(d.id), title: d.title, overview: d.overview }));
        setItems(locals);
        setMsg('Falha ao carregar dias do banco. Exibindo dias locais.');
      }
    })();
  }, []);

  const reloadList = async () => {
    const r = await fetch('/api/training/days?limit=100', { cache: 'no-store' });
    const j = await r.json().catch(() => ({ items: [] }));
    if (Array.isArray(j.items) && j.items.length) {
      setItems(j.items);
      setMsg('');
    }
  };

  const loadDayDetails = async (id: string) => {
    const r = await fetch(`/api/admin/training/days/${encodeURIComponent(id)}`, { cache: 'no-store' });
    const j = await r.json();
    if (r.ok) {
      setEditing(j);
      setGroups(j.groups || []);
    }
  };

  const saveDay = async () => {
    if (!editing) return;
    await fetch(`/api/admin/training/days/${encodeURIComponent(editing.id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: editing.title,
        overview: editing.overview,
        cardio_title: editing.cardio?.title || '',
        cardio_prescription: editing.cardio?.prescription || ''
      })
    });
  };

  const createDay = async () => {
    await fetch('/api/admin/import', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: `tipo,id,title,overview,cardio_title,cardio_prescription\nday,${newDay.id},${newDay.title},${newDay.overview},${newDay.cardio_title},${newDay.cardio_prescription}`
    });
    setNewDay({ id: '', title: '', overview: '', cardio_title: '', cardio_prescription: '' });
    await reloadList();
  };

  const addGroup = async () => {
    if (!editing) return;
    await fetch('/api/admin/training/day-groups', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        training_day_id: editing.id,
        order: newGroup.order,
        exercise_a_slug: newGroup.exercise_a_slug,
        exercise_b_slug: newGroup.exercise_b_slug,
        prescription: newGroup.prescription
      })
    });
    await loadDayDetails(editing.id);
    setNewGroup({ order: 1, exercise_a_slug: '', exercise_b_slug: '', prescription: '' });
  };

  const updateGroup = async (g: any) => {
    await fetch(`/api/admin/training/day-groups/${g.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        order: g.order,
        exercise_a_slug: g.a?.slug || '',
        exercise_b_slug: g.b?.slug || '',
        prescription: g.prescription
      })
    });
  };

  const deleteGroup = async (id: number) => {
    await fetch(`/api/admin/training/day-groups/${id}`, { method: 'DELETE' });
    if (editing) await loadDayDetails(editing.id);
  };

  return (
    <div className="min-h-screen px-4 pt-8 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <HeaderNav />
        <h1 className="text-2xl font-bold">Dias de Treino</h1>
        <p className="text-sm text-muted-foreground">Escolha um dia para visualizar/alterar.</p>
        {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold mb-2">Migrar do local para o banco</div>
          <div className="text-sm text-muted-foreground mb-2">Irá criar exercícios, dias e grupos com base na Home.</div>
          <button
            className="px-3 py-2 rounded border"
            onClick={async () => {
              const r = await fetch('/api/admin/training/migrate-local', { method: 'POST' });
              const j = await r.json().catch(() => ({}));
              if (r.ok) {
                setMigrateMsg(`Migrados: ${j.exercises} exercícios, ${j.days} dias, ${j.groups} grupos`);
                await reloadList();
              } else {
                setMigrateMsg('Falha na migração');
              }
            }}
          >
            Migrar do Local
          </button>
          {migrateMsg && <div className="mt-2 text-sm">{migrateMsg}</div>}
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="font-semibold mb-2">Novo Dia</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className="p-2 border rounded" placeholder="ID" value={newDay.id} onChange={e => setNewDay({ ...newDay, id: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Título" value={newDay.title} onChange={e => setNewDay({ ...newDay, title: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Overview" value={newDay.overview} onChange={e => setNewDay({ ...newDay, overview: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input className="p-2 border rounded" placeholder="Cardio título" value={newDay.cardio_title} onChange={e => setNewDay({ ...newDay, cardio_title: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Cardio prescrição" value={newDay.cardio_prescription} onChange={e => setNewDay({ ...newDay, cardio_prescription: e.target.value })} />
          </div>
          <div className="mt-2">
            <button className="px-3 py-2 rounded border" onClick={createDay}>Criar</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((d) => (
            <Link key={d.id} href={`/training/day/${encodeURIComponent(d.id)}`} className="rounded-lg border bg-card p-4 hover:bg-muted">
              <div className="font-semibold">{d.title}</div>
              {d.overview && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.overview}</div>}
            </Link>
          ))}
          {!items.length && (
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Sem dias cadastrados. Use Importação Unificada para criar.</div>
              <Link href="/admin/import-unificado" className="text-sm underline">Ir para Importação</Link>
            </div>
          )}
        </div>
        {editing && (
          <div className="rounded-lg border bg-card p-4">
            <div className="font-semibold mb-2">Editar Dia • {editing.id}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className="p-2 border rounded" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              <input className="p-2 border rounded" value={editing.overview || ''} onChange={e => setEditing({ ...editing, overview: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <input className="p-2 border rounded" value={editing.cardio?.title || ''} onChange={e => setEditing({ ...editing, cardio: { ...(editing.cardio || {}), title: e.target.value } })} />
              <input className="p-2 border rounded" value={editing.cardio?.prescription || ''} onChange={e => setEditing({ ...editing, cardio: { ...(editing.cardio || {}), prescription: e.target.value } })} />
            </div>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-2 rounded border" onClick={saveDay}>Salvar</button>
              <button className="px-3 py-2 rounded border" onClick={async () => { await fetch(`/api/admin/training/days/${editing.id}`, { method: 'DELETE' }); setEditing(null); }}>Excluir Dia</button>
              <button className="px-3 py-2 rounded border" onClick={() => loadDayDetails(editing.id)}>Recarregar</button>
            </div>
            <div className="mt-4">
              <div className="font-semibold mb-2">Grupos</div>
              <div className="space-y-2">
                {groups.map((g: any) => (
                  <div key={g.id} className="rounded border p-3 bg-muted/40 grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <input className="p-2 border rounded" value={String(g.order || '')} onChange={e => { const v = parseInt(e.target.value || '0', 10) || 0; setGroups(gs => gs.map(x => x.id === g.id ? { ...x, order: v } : x)); }} />
                    <input className="p-2 border rounded" value={g.a?.slug || ''} onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, a: { ...(x.a || {}), slug: e.target.value } } : x))} placeholder="Exercício A slug" />
                    <input className="p-2 border rounded" value={g.b?.slug || ''} onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, b: { ...(x.b || {}), slug: e.target.value } } : x))} placeholder="Exercício B slug" />
                    <input className="p-2 border rounded sm:col-span-2" value={g.prescription || ''} onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, prescription: e.target.value } : x))} placeholder="Prescrição" />
                    <div className="flex gap-2">
                      <button className="px-3 py-2 rounded border" onClick={() => updateGroup(groups.find(x => x.id === g.id))}>Salvar Grupo</button>
                      <button className="px-3 py-2 rounded border" onClick={() => deleteGroup(g.id)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded border p-3 bg-card grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input className="p-2 border rounded" value={String(newGroup.order)} onChange={e => setNewGroup({ ...newGroup, order: parseInt(e.target.value || '1', 10) || 1 })} placeholder="Ordem" />
                <input className="p-2 border rounded" value={newGroup.exercise_a_slug} onChange={e => setNewGroup({ ...newGroup, exercise_a_slug: e.target.value })} placeholder="Exercício A slug" />
                <input className="p-2 border rounded" value={newGroup.exercise_b_slug} onChange={e => setNewGroup({ ...newGroup, exercise_b_slug: e.target.value })} placeholder="Exercício B slug" />
                <input className="p-2 border rounded sm:col-span-2" value={newGroup.prescription} onChange={e => setNewGroup({ ...newGroup, prescription: e.target.value })} placeholder="Prescrição" />
                <button className="px-3 py-2 rounded border" onClick={addGroup}>Adicionar Grupo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
