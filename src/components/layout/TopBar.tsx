'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Home as HomeIcon, User, Dumbbell, FileText, RefreshCcw } from 'lucide-react';

export default function TopBar() {
  const [role, setRole] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    try {
      const r = (document.cookie.split('; ').find(c => c.startsWith('role=')) || '').split('=')[1] || '';
      setRole(r);
    } catch { setRole(''); }
  }, []);
  const logout = () => {
    try {
      document.cookie = 'role=; path=/; max-age=0';
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    } catch {}
  };
  const resetPoints = () => {
    try {
      window.dispatchEvent(new CustomEvent('reset-points'));
      setIsMenuOpen(false);
    } catch {}
  };
  return (
    <div className="w-full bg-card border-b sticky top-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="container mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} className="min-h-12">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="text-sm">Perfil: {role || 'desconhecido'}</div>
        </div>
        <Button size="sm" variant="outline" onClick={logout} className="min-h-12">Sair</Button>
      </div>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Navegação rápida</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <a href="/" className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted">
              <HomeIcon className="w-4 h-4" /> Início
            </a>
            <a href="/perfil" className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted">
              <User className="w-4 h-4" /> Perfil
            </a>
            <a href="/training/day/1" className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted">
              <Dumbbell className="w-4 h-4" /> Treinos
            </a>
            <a href="/treinos/mes" className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted">
              <Dumbbell className="w-4 h-4" /> Treinos do mês
            </a>
            <a href="/receitas" className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted">
              <FileText className="w-4 h-4" /> Receitas
            </a>
            {role === 'admin' && (
              <a href="/admin/usuarios" className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted">
                <User className="w-4 h-4" /> Admin • Usuários
              </a>
            )}
            {role === 'admin' && (
              <button className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted w-full" onClick={resetPoints}>
                <RefreshCcw className="w-4 h-4" /> Resetar pontos (hoje)
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
