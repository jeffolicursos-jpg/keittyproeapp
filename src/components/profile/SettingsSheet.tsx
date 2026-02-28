'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import { Palette, Bell, Shield, Edit, Sun, Moon, Info, RefreshCcw, AlertTriangle } from 'lucide-react';
import type { UserProfile } from '@/app/gamification-data';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface SettingsSheetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setTheme: (theme: string, isDarkMode: boolean) => void;
  onResetOnboarding: () => void;
}

export default function SettingsSheet({ isOpen, setIsOpen, profile, setProfile, setTheme, onResetOnboarding }: SettingsSheetProps) {
    const { toast } = useToast();
    const [name, setName] = useState(profile.name);
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
    
    // State for theme controls, initialized from profile
    const [currentTheme, setCurrentTheme] = useState(profile.theme || 'theme-green');
    const [isDarkMode, setIsDarkMode] = useState(profile.darkMode || false);
    const [gender, setGender] = useState<UserProfile['gender']>(profile.gender || 'other');
    const [notifyTimer, setNotifyTimer] = useState(profile.notifyTimer ?? true);
    const [notifyNewRecipes, setNotifyNewRecipes] = useState(profile.notifyNewRecipes ?? true);

    useEffect(() => {
        // When sheet opens, sync local state with profile props
        if (isOpen) {
          setName(profile.name);
          setAvatarUrl(profile.avatarUrl);
          setCurrentTheme(profile.theme || 'theme-green');
          setIsDarkMode(profile.darkMode || false);
          setGender(profile.gender || 'other');
          setNotifyTimer(profile.notifyTimer ?? true);
          setNotifyNewRecipes(profile.notifyNewRecipes ?? true);
        }
    }, [isOpen, profile]);

    const handleThemeChange = (themeValue: string) => {
        const newTheme = `theme-${themeValue}`;
        setCurrentTheme(newTheme);
        setTheme(newTheme, isDarkMode); // Pass both theme and dark mode state
    }

    const handleDarkModeToggle = (checked: boolean) => {
        setIsDarkMode(checked);
        setTheme(currentTheme, checked); // Pass both theme and dark mode state
    }
    
    const handleSaveChanges = () => {
        setProfile(prev => ({
            ...prev,
            name,
            avatarUrl,
            theme: currentTheme,
            darkMode: isDarkMode,
            gender,
            notifyTimer,
            notifyNewRecipes,
        }));
        toast({ title: 'Configurações Salvas!', description: 'Suas preferências de perfil e tema foram atualizadas.' });
        setIsOpen(false);
    }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent id="settings-sheet-content" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Configurações</SheetTitle>
          <SheetDescription>
            Gerencie suas preferências e informações do perfil.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 py-6">
          
          {/* Editar Perfil */}
          <section className="space-y-4">
            <h3 className="font-headline text-lg flex items-center gap-2"><Edit className="w-5 h-5 text-primary"/>Perfil</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">URL do Avatar</Label>
              <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://exemplo.com/sua-foto.jpg"/>
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                      Não tem uma URL? Suba sua foto no <Link href="https://postimages.org/" target="_blank" className="text-primary underline">Postimages</Link>, copie o <strong className="text-foreground">&quot;Link direto&quot;</strong> e cole aqui.
                  </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Tema do Aplicativo */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-primary"/>Tema</h3>
              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5" />
                <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleDarkModeToggle}
                />
                <Moon className="h-5 w-5" />
              </div>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-center gap-2">
                <Button variant={currentTheme === 'theme-green' ? 'default' : 'outline'} onClick={() => handleThemeChange('green')}>Verde</Button>
                <Button variant={currentTheme === 'theme-orange' ? 'default' : 'outline'} onClick={() => handleThemeChange('orange')}>Laranja</Button>
                <Button variant={currentTheme === 'theme-blue' ? 'default' : 'outline'} onClick={() => handleThemeChange('blue')}>Azul</Button>
                <Button variant={currentTheme === 'theme-purple' ? 'default' : 'outline'} onClick={() => handleThemeChange('purple')}>Roxo</Button>
                <Button variant={currentTheme === 'theme-red' ? 'default' : 'outline'} onClick={() => handleThemeChange('red')}>Vermelho</Button>
                <Button variant={currentTheme === 'theme-teal' ? 'default' : 'outline'} onClick={() => handleThemeChange('teal')}>Verde-Água</Button>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-medium mb-2">Paleta custom</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primária (hex)</Label>
                    <Input id="primary-color" placeholder="#FF4D2D" onChange={(e) => {
                      const v = e.target.value;
                      setProfile(prev => ({ ...prev, themeCustomPrimary: v }));
                      try { localStorage.setItem('customThemeVars', JSON.stringify({ primary: v, accent: (profile.themeCustomAccent || '#FF4D2D') })); } catch {}
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Acento (hex)</Label>
                    <Input id="accent-color" placeholder="#FF4D2D" onChange={(e) => {
                      const v = e.target.value;
                      setProfile(prev => ({ ...prev, themeCustomAccent: v }));
                      try { localStorage.setItem('customThemeVars', JSON.stringify({ primary: (profile.themeCustomPrimary || '#FF4D2D'), accent: v })); } catch {}
                    }} />
                  </div>
                </div>
                <div className="mt-2">
                  <Button variant={currentTheme === 'theme-custom' ? 'default' : 'outline'} onClick={() => handleThemeChange('custom')}>Usar custom</Button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Label>Avatar</Label>
                <Button variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>Mulher</Button>
                <Button variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>Homem</Button>
              </div>
            </div>

          </section>

          <Separator />
          
           {/* Notificações */}
          <section className="space-y-4">
            <h3 className="font-headline text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-primary"/>Notificações</h3>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <Label htmlFor="notifications-timer">Timer da receita</Label>
              <Switch id="notifications-timer" checked={notifyTimer} onCheckedChange={(v) => setNotifyTimer(v)} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <Label htmlFor="notifications-news">Novas receitas</Label>
              <Switch id="notifications-news" checked={notifyNewRecipes} onCheckedChange={(v) => setNotifyNewRecipes(v)} />
            </div>
          </section>

          <Separator />

          {/* Privacidade */}
           <section className="space-y-4">
            <h3 className="font-headline text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-primary"/>Privacidade</h3>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <RefreshCcw className="w-4 h-4"/>
                  Resetar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader className="text-left">
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-destructive"/>Atenção!</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza? Esta ação é irreversível e irá apagar completamente seu perfil, incluindo nome, avatar, pontos, nível, conquistas e receitas favoritas. <br/><br/>O aplicativo será reiniciado para a tela de boas-vindas, como se fosse o primeiro uso.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onResetOnboarding} className="bg-destructive hover:bg-destructive/90">
                    Apagar e resetar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>


        </div>

        <SheetFooter className="mt-auto pt-6 flex-col gap-2 sm:flex-row sm:justify-between">
           <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>Cancelar</Button>
           <Button onClick={handleSaveChanges} className="w-full">Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
