'use client';
import { useState } from 'react';
import HeaderNav from '@/components/HeaderNav';

export default function ImportUnificado() {
  const [msg, setMsg] = useState('');
  const [count, setCount] = useState(0);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch('/api/admin/import', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: text });
    const j = await res.json();
    if (res.ok) {
      setCount(j.imported || 0);
      setMsg('Importação concluída');
    } else {
      setMsg(j.error || 'Falha na importação');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <HeaderNav />
      <h1 className="text-2xl font-bold mb-4">Importação Unificada</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Envie um único CSV com a coluna "tipo" indicando a entidade: exercicio | day | group.
      </p>
      <div className="rounded border p-4 bg-card">
        <input type="file" accept=".csv,text/csv" onChange={upload} />
        {msg && <div className="mt-2 text-sm">{msg} • Linhas importadas: {count}</div>}
        <div className="mt-4 text-sm">
          Colunas para exercicio:
          <ul className="list-disc ml-6">
            <li>tipo: exercicio</li>
            <li>slug</li>
            <li>Nome_do_exercicio (ou title)</li>
            <li>Como_executar (linhas separadas por "\n" ou ";")</li>
            <li>Series (default_series)</li>
            <li>Repeticoes (default_reps)</li>
            <li>Video_URL (opcional)</li>
          </ul>
        </div>
        <div className="mt-4 text-sm">
          Colunas para day:
          <ul className="list-disc ml-6">
            <li>tipo: day</li>
            <li>id</li>
            <li>title</li>
            <li>overview</li>
            <li>cardio_title</li>
            <li>cardio_prescription</li>
          </ul>
        </div>
        <div className="mt-4 text-sm">
          Colunas para group:
          <ul className="list-disc ml-6">
            <li>tipo: group</li>
            <li>training_day_id</li>
            <li>order</li>
            <li>exercise_a_slug</li>
            <li>exercise_b_slug</li>
            <li>prescription</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
