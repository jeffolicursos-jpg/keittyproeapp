'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, Apple } from 'lucide-react';

function trackClick(event: string) {
  try {
    // Google Analytics if available
    // @ts-ignore
    if (typeof window !== 'undefined' && window.gtag) {
      // @ts-ignore
      window.gtag('event', 'click', { event_category: 'install', event_label: event });
    }
  } catch {}
  try {
    const key = 'install_clicks';
    const raw = localStorage.getItem(key);
    const obj = raw ? JSON.parse(raw) as Record<string, number> : {};
    obj[event] = (obj[event] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(obj));
  } catch {}
}

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: 'accepted'|'dismissed' }> }

export default function AppDownloadPage() {
  const [iosHelp, setIosHelp] = useState(false);
  const [supported, setSupported] = useState(false);
  const bipRef = useRef<BIPEvent | null>(null);

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      bipRef.current = e as BIPEvent;
      setSupported(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', onBIP as any);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', onBIP as any);
      }
    };
  }, []);

  const os = useMemo<'android'|'ios'|'other'>(() => {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    return 'other';
  }, []);

  const handleAndroidInstall = async () => {
    trackClick('android_install_click');
    const ev = bipRef.current;
    if (ev && ev.prompt) {
      try {
        await ev.prompt();
        if (ev.userChoice) {
          await ev.userChoice;
        }
      } catch {}
    } else {
      // Fallback: show iOS-like help
      setIosHelp(true);
    }
  };

  const openIosHelp = () => {
    trackClick('ios_help_open');
    setIosHelp(true);
  };

  const title = 'Baixar App ProE 📱';
  const appUrl = (process?.env?.NEXT_PUBLIC_APP_URL as string) || 'https://keittyproeapp.vercel.app';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">Instale na tela inicial do seu celular para uma experiência completa, rápida e em tela cheia.</p>
          <div className="text-xs text-muted-foreground mt-1">{appUrl}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`rounded border p-5 bg-card text-center ${os === 'android' ? 'ring-2 ring-green-600' : ''}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div className="font-semibold">Android</div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleAndroidInstall}
              disabled={os !== 'android' && !supported}
            >
              Instalar no Android
            </Button>
            <div className="mt-2 text-xs text-muted-foreground">
              {supported ? 'Instalação direta disponível' : 'Se o botão desabilitar, abra no Chrome Android'}
            </div>
          </div>
          <div className={`rounded border p-5 bg-card text-center ${os === 'ios' ? 'ring-2 ring-blue-600' : ''}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Apple className="w-5 h-5 text-blue-600" />
              <div className="font-semibold">iPhone (Safari)</div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={openIosHelp}
            >
              Ver como instalar (iPhone)
            </Button>
            <div className="mt-2 text-xs text-muted-foreground">Abra no Safari para ver a opção “Tela de Início”.</div>
          </div>
        </div>
        <div className="mt-8 rounded border bg-card p-4">
          <div className="font-semibold mb-1">Como funciona</div>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>No Android (Chrome), um prompt de instalação aparece. Toque em “Instalar”.</li>
            <li>No iPhone (Safari), toque no botão Compartilhar e depois em “Adicionar à Tela de Início”.</li>
            <li>O app abre em tela cheia como um app nativo.</li>
          </ul>
        </div>
      </div>

      <Dialog open={iosHelp} onOpenChange={setIosHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Instalar no iPhone</DialogTitle>
          </DialogHeader>
          <ol className="list-decimal pl-4 text-sm text-muted-foreground space-y-1">
            <li>Abra este link no Safari: <a className="underline" href={appUrl} target="_blank" rel="noreferrer">{appUrl}</a></li>
            <li>Toque no botão Compartilhar (ícone de seta para cima).</li>
            <li>Toque em “Adicionar à Tela de Início”.</li>
            <li>Confirme. Pronto! O app aparecerá na sua tela inicial.</li>
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}

