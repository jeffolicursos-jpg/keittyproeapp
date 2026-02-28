'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CsvRow = Record<string, string>;

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: CsvRow = {};
    header.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let i = 0; let cur = ''; let inQuotes = false;
  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      } else { cur += ch; i++; continue; }
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { out.push(cur); cur = ''; i++; continue; }
      cur += ch; i++; continue;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

export default function AdminImportPage() {
  const [exercisesCsv, setExercisesCsv] = useState<CsvRow[]>([]);
  const [daysCsv, setDaysCsv] = useState<CsvRow[]>([]);
  const [groupsCsv, setGroupsCsv] = useState<CsvRow[]>([]);
  const [recipesCsv, setRecipesCsv] = useState<CsvRow[]>([]);
  const [status, setStatus] = useState<string>('');

  const handleFile = async (file: File, set: (rows: CsvRow[]) => void) => {
    const txt = await file.text();
    const rows = parseCsv(txt);
    set(rows);
  };

  const handleUrl = async (url: string, set: (rows: CsvRow[]) => void) => {
    try {
      const res = await fetch(url);
      const txt = await res.text();
      const rows = parseCsv(txt);
      set(rows);
    } catch {
      setStatus('Falha ao baixar CSV da URL');
    }
  };

  const applyImports = () => {
    try {
      localStorage.setItem('import_exercises_base', JSON.stringify(exercisesCsv));
      localStorage.setItem('import_training_days', JSON.stringify(daysCsv));
      localStorage.setItem('import_training_day_groups', JSON.stringify(groupsCsv));
      localStorage.setItem('import_recipes', JSON.stringify(recipesCsv));
      const seedDays = daysCsv.map(d => ({
        id: Number(d.id),
        title: d.title,
        videoUrl: '',
        tips: d.overview || '',
      }));
      if (seedDays.length > 0) {
        localStorage.setItem('trainingDays', JSON.stringify(seedDays));
      }
      setStatus('Importação aplicada com sucesso.');
      window.dispatchEvent(new Event('progress-updated'));
    } catch {
      setStatus('Erro ao salvar importação.');
    }
  };

  const exportJson = () => {
    const bundle = {
      exercises_base: exercisesCsv,
      training_days: daysCsv,
      training_day_groups: groupsCsv,
      recipes: recipesCsv,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'import-bundle.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="font-headline text-2xl md:text-3xl mb-6">Admin • Importar</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle>Exercícios Base (exercises_base.csv)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Upload CSV</Label>
                <Input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, setExercisesCsv); }} />
              </div>
              <div>
                <Label>URL CSV (Google Sheets)</Label>
                <Input placeholder="https://docs.google.com/spreadsheets/…/export?format=csv" onBlur={e => e.target.value && handleUrl(e.target.value, setExercisesCsv)} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Colunas: slug,title,muscle_group,video_url,tips,default_series,default_reps,execution_text,audio_url</div>
            <div className="text-sm">Linhas: {exercisesCsv.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dias de Treino (training_days.csv)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Upload CSV</Label>
                <Input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, setDaysCsv); }} />
              </div>
              <div>
                <Label>URL CSV (Google Sheets)</Label>
                <Input placeholder="https://docs.google.com/spreadsheets/…/export?format=csv" onBlur={e => e.target.value && handleUrl(e.target.value, setDaysCsv)} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Colunas: id,title,overview,cardio_title,cardio_prescription</div>
            <div className="text-sm">Linhas: {daysCsv.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Grupos por Dia (training_day_groups.csv)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Upload CSV</Label>
                <Input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, setGroupsCsv); }} />
              </div>
              <div>
                <Label>URL CSV (Google Sheets)</Label>
                <Input placeholder="https://docs.google.com/spreadsheets/…/export?format=csv" onBlur={e => e.target.value && handleUrl(e.target.value, setGroupsCsv)} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Colunas: training_day_id,order,exercise_a_slug,exercise_b_slug,prescription</div>
            <div className="text-sm">Linhas: {groupsCsv.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Receitas (recipes.csv)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label>Upload CSV</Label>
                <Input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, setRecipesCsv); }} />
              </div>
              <div>
                <Label>URL CSV (Google Sheets)</Label>
                <Input placeholder="https://docs.google.com/spreadsheets/…/export?format=csv" onBlur={e => e.target.value && handleUrl(e.target.value, setRecipesCsv)} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Colunas: name,porcoes,preparo_min,cozimento_min,temperatura,proteina_g,categoria,ingredientes_text,modo_preparo_text,image_url</div>
            <div className="text-sm">Linhas: {recipesCsv.length}</div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={applyImports}>Aplicar importação</Button>
          <Button variant="outline" onClick={exportJson}>Exportar JSON</Button>
          <span className="text-sm text-muted-foreground">{status}</span>
        </div>
      </div>
    </div>
  );
}
