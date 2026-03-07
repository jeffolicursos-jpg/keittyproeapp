'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function HeaderNav() {
  const router = useRouter();
  const goHome = () => {
    try {
      const hasAccess = document.cookie.includes('access=');
      router.push(hasAccess ? '/dashboard' : '/');
    } catch {
      router.push('/');
    }
  };
  return (
    <div className="flex items-center justify-between mb-4">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <Button variant="ghost" className="gap-2" onClick={goHome}>
        <Home className="h-4 w-4" />
        Início
      </Button>
    </div>
  );
}
