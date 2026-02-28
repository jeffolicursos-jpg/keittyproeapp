
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Palette, Sun, Moon, Sparkles, Trophy, ListChecks, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const themes = [
    { name: 'green', gradient: 'from-green-500 to-lime-400' },
    { name: 'female', gradient: 'from-pink-500 to-fuchsia-500' },
    { name: 'blue', gradient: 'from-blue-500 to-sky-400' },
    { name: 'yellow', gradient: 'from-yellow-500 to-amber-400' },
    { name: 'rainbow', gradient: 'rainbow-gradient' }
];

interface LandingPageProps {
  onStart: () => void;
  setTheme: (theme: string, isDarkMode: boolean) => void;
  userName?: string;
}

export default function LandingPage({ onStart, setTheme, userName }: LandingPageProps) {
  const [currentTheme, setCurrentTheme] = useState('theme-green');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setTheme(currentTheme, isDarkMode);
  }, [currentTheme, isDarkMode, setTheme]);

  const handleThemeChange = (themeName: string) => {
    const newTheme = `theme-${themeName}`;
    setCurrentTheme(newTheme);
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
  }

  const FeatureSection = ({ title, description, children, reverse = false }: { title: string, description: string, children: React.ReactNode, reverse?: boolean }) => (
    <section className="max-w-6xl mx-auto py-16">
      <div className={`flex flex-col md:flex-row items-center justify-center gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/2"
        >
          <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{description}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/2 w-full"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      <style jsx global>{`
        .bg-rainbow-gradient {
          background-image: linear-gradient(to right, #E40303, #FF8C00, #FFED00, #008026, #004DFF, #750787);
        }
      `}</style>
      
      {/* Header Section */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-muted/20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-4xl md:text-5xl font-extrabold font-headline tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          {(() => {
            const name = (userName || '').trim()
            const isGeneric = name.length === 0 || name.toLowerCase() === 'usuário'
            return isGeneric 
              ? 'Bem-vindo! Escolha seu tema e comece.'
              : `${name}, bem-vindo! Escolha seu tema e comece.`
          })()}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
        >
          Este é um projeto base neutro para estudos e aulas.
        </motion.p>
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
        >
            <Button size="lg" className="h-14 text-lg font-bold shadow-lg shadow-primary/30" onClick={onStart}>
              <Sparkles className="w-6 h-6 mr-3" />
              Começar agora
            </Button>
        </motion.div>
      </header>
      
      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8">

        {/* Recipes Feature */}
        <FeatureSection
          title="Receitas deliciosas e fáceis de seguir"
          description="Explore um cardápio completo com pratos anti-inflamatórios. Cada receita vem com instruções passo a passo, timers integrados e informações nutricionais para facilitar sua vida na cozinha."
        >
          <Card className="p-4 bg-card/50 border-0 shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image src="/images/salada-de-salmao-com-abacate.webp" alt="Salada de Salmão" fill className="object-cover" data-ai-hint="salmon salad" unoptimized/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 font-headline text-2xl text-white">Salada de Salmão com Abacate</h3>
            </div>
          </Card>
        </FeatureSection>

        {/* Planning Feature */}
        <FeatureSection
          title="Planejador Semanal Inteligente"
          description="Organize seu cardápio, crie listas de compras automáticas e nunca mais se preocupe com 'o que comer hoje?'. O Glicozen ajuda você a manter o foco nos seus objetivos de saúde sem estresse."
          reverse={true}
        >
          <Card className="p-6 bg-card/50 border-0 shadow-xl -rotate-2 hover:rotate-0 transition-transform">
            <h4 className="font-headline text-xl mb-4 text-center">Cardápio da Semana</h4>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="font-bold">Segunda</span>
                    <span className="text-sm text-muted-foreground">Sopa de Tomate</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="font-bold">Terça</span>
                    <span className="text-sm text-muted-foreground">Frango com Limão</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="font-bold">Quarta</span>
                    <span className="text-sm text-muted-foreground">Salada de Quinoa</span>
                </div>
            </div>
             <div className="flex items-center justify-center mt-4">
                 <ListChecks className="w-8 h-8 text-primary" />
             </div>
          </Card>
        </FeatureSection>

        {/* Gamification Feature */}
        <FeatureSection
          title="Acompanhe seu Progresso e Divirta-se"
          description="Transforme sua saúde em um jogo! Calcule seu IMC, registre seu peso, ganhe pontos a cada receita preparada e desbloqueie conquistas exclusivas. Manter-se saudável nunca foi tão recompensador."
        >
          <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card/50 border-0 shadow-lg h-full text-center">
                <Trophy className="w-10 h-10 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-bold font-headline">Conquistas</h3>
                <p className="text-xs text-muted-foreground mt-1">Desbloqueie medalhas por seus feitos.</p>
              </Card>
               <Card className="p-4 bg-card/50 border-0 shadow-lg h-full text-center">
                <BarChart className="w-10 h-10 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-bold font-headline">Pontos e Níveis</h3>
                <p className="text-xs text-muted-foreground mt-1">Suba de nível e mostre sua evolução.</p>
              </Card>
          </div>
        </FeatureSection>


        {/* Theme Customization Section */}
        <section className="max-w-3xl mx-auto text-center py-16">
          <h2 className="text-3xl font-bold font-headline mb-4 flex items-center justify-center gap-3"><Palette />Personalize a sua Experiência</h2>
          <p className="text-muted-foreground mb-8">O aplicativo se adapta ao seu estilo. Escolha seu tema preferido e alterne entre os modos claro e escuro a qualquer momento.</p>
          
          <Card className="p-6 bg-muted/20 border-2 border-dashed">
            <CardContent className="p-0">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Sun className="h-6 w-6 text-muted-foreground" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeToggle}
                  aria-label="Alternar modo escuro"
                />
                <Moon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex justify-center gap-3 sm:gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none ring-offset-background ring-offset-2 focus:ring-2 focus:ring-ring',
                      `bg-gradient-to-r ${theme.gradient}`,
                      currentTheme === `theme-${theme.name}` && 'ring-2 ring-primary scale-110'
                    )}
                    aria-label={`Selecionar tema ${theme.name}`}
                  />
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">Ao acessar as Configurações, você poderá trocar a cor do seu aplicativo por lá.</p>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA Section */}
        <section className="text-center py-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <h2 className="text-3xl font-bold font-headline mb-6">Pronto para começar?</h2>
            <Button size="lg" className="h-14 text-lg font-bold shadow-lg shadow-primary/30" onClick={onStart}>
              <Sparkles className="w-6 h-6 mr-3" />
              Começar agora
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Agora você faz parte de milhares de pessoas que transformaram a saúde.</p>
          </motion.div>
        </section>

      </main>

       {/* Footer */}
      <footer className="text-center py-8 border-t mt-12">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Glicozen. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

    
