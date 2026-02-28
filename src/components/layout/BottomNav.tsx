'use client';

import { Home, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'explorar', label: 'Explorar', icon: Compass },
  { id: 'perfil', label: 'Perfil', icon: User },
];

export default function BottomNav({ activePage, setActivePage }: BottomNavProps) {
  const isRecipeDetail = activePage === 'detalhe-receita';

  const handleNavClick = (pageId: string) => {
    if (pageId === 'inicio' && isRecipeDetail) {
      setActivePage('inicio');
    } else {
      setActivePage(pageId);
    }
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-t-lg z-50">
      <div className="grid grid-cols-3 items-center h-full w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200 ease-in-out focus:outline-none',
              { 'text-primary': !isRecipeDetail && activePage === item.id },
              { 'text-primary': isRecipeDetail && item.id === 'inicio' }
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
