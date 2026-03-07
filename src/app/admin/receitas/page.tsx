'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import HeaderNav from '@/components/HeaderNav';

export default function Admin() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<boolean>(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      Papa.parse(f, { header: true, complete: (r: any) => setPreview((r.data as any[]).slice(0, 5)) });
    }
  };
  const upload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('csv', file);
    const res = await fetch('/api/admin/receitas', { method: 'POST', body: fd });
    if (res.ok) alert('Upload OK!');
  };
  const load = async () => {
    const res = await fetch('/api/recipes?limit=50', { cache: 'no-store' });
    const data = await res.json();
    setItems(data.items || []);
  };
  const saveEdit = async () => {
    if (!editing) return;
    const payload = {
      name: editing.name,
      imageUrl: editing.image_url,
      portions: editing.portions || 1,
      temperature: editing.temperature || '',
      totalTime: editing.total_time || '',
      tip: editing.tip || '',
      proteinGrams: editing.protein_grams || null,
      tags: editing.tags || [],
      status: editing.status || 'published',
      plano_minimo: editing.plano_minimo || null,
      cronometro: editing.cronometro || null,
    };
    const res = await fetch(`/api/recipes/${editing.recipe_number}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) { setEditing(null); await load(); }
  };
  const deleteItem = async (id: number) => {
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const check = async () => {
      const emailCookie = document.cookie.split('; ').find(c => c.startsWith('email='))?.split('=')[1] || '';
      const roleCookie = document.cookie.split('; ').find(c => c.startsWith('role='))?.split('=')[1] || '';
      const email = emailCookie || null;
      setUserEmail(email);
      if (!email || ((email || '').toLowerCase() !== 'admin@seusistema.com' && roleCookie !== 'admin')) {
        setBlocked(true);
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      }
    };
    check();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <HeaderNav />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Receitas</h1>
        <div className="flex items-center gap-3">
          {userEmail && <span className="text-sm text-muted-foreground">{userEmail}</span>}
          <button className="px-3 py-2 rounded border" onClick={logout}>Sair</button>
        </div>
      </div>
      {blocked && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
          Acesso restrito. Redirecionando para login...
        </div>
      )}
      <div className="bg-white p-8 rounded-lg shadow-md flex gap-4 items-center">
        <input type="file" accept=".csv" onChange={handleFile} className="p-2 border rounded" />
        <button onClick={upload} disabled={!file} className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50">
          Upload CSV
        </button>
      </div>
      {preview.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Preview:</h3>
          <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Lista</h3>
        <div className="space-y-2">
          {items.map((it: any) => (
            <div key={it.id} className="bg-white p-4 rounded border flex items-center gap-2">
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-muted-foreground"># {it.recipe_number}</div>
              <button className="px-2 py-1 rounded border" onClick={() => setEditing({ ...it })}>Editar</button>
              <button className="px-2 py-1 rounded border" onClick={() => deleteItem(it.recipe_number)}>Excluir</button>
            </div>
          ))}
        </div>
        {editing && (
          <div className="mt-4 bg-white p-4 rounded border space-y-2">
            <input className="w-full p-2 border rounded" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            <input className="w-full p-2 border rounded" value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
            <input className="w-full p-2 border rounded" value={editing.plano_minimo || ''} onChange={e => setEditing({ ...editing, plano_minimo: e.target.value })} />
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded border" onClick={saveEdit}>Salvar</button>
              <button className="px-3 py-2 rounded border" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
