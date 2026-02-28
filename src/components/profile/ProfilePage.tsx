'use client';

import { useState } from 'react';
import type { UserProfile } from '@/app/gamification-data';
import { Button } from '@/components/ui/button';
import { Settings, User, Trophy, Heart } from 'lucide-react';
import UserHeader from '@/components/profile/UserHeader';
import LevelProgressCard from '@/components/profile/LevelProgressCard';
import BMICard from '@/components/profile/BMICard';
import ActivityCard from '@/components/profile/ActivityCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AchievementsTab from '@/components/profile/AchievementsTab';
import FavoritesTab from '@/components/profile/FavoritesTab';
import type { Recipe } from '@/app/data/types';
import SettingsSheet from '../profile/SettingsSheet';


interface ProfilePageProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    setTheme: (theme: string, isDarkMode: boolean) => void;
    recipes: Recipe[];
    onSelectRecipe: (recipe: Recipe) => void;
    onResetOnboarding: () => void;
}

export default function ProfilePage({ profile, setProfile, setTheme, recipes, onSelectRecipe, onResetOnboarding }: ProfilePageProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className="bg-background min-h-screen">
       <header className="relative h-32 bg-gradient-to-r from-primary to-accent px-4 sm:px-6 lg:px-8 pt-8">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <div>
                <h1 className="font-headline text-3xl font-bold text-primary-foreground">Meu Perfil</h1>
            </div>
            <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/20" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-6 w-6" />
            </Button>
        </div>
      </header>

      <main className="relative -mt-10 rounded-t-3xl bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <UserHeader name={profile.name} avatarUrl={profile.avatarUrl} level={profile.level} />
        </div>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-8 pb-12">
           <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="progress" className="gap-2">
                  <User className="w-4 h-4" />
                  Progresso
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Conquistas
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Favoritos
                </TabsTrigger>
              </TabsList>
              <TabsContent value="progress" className="space-y-8 mt-6">
                <LevelProgressCard points={profile.points} />
                <BMICard profile={profile} setProfile={setProfile} />
                <ActivityCard profile={profile} />
              </TabsContent>
              <TabsContent value="achievements" className="mt-6">
                <AchievementsTab profile={profile} recipes={recipes} />
              </TabsContent>
              <TabsContent value="favorites" className="mt-6">
                <FavoritesTab profile={profile} recipes={recipes} onSelectRecipe={onSelectRecipe} />
              </TabsContent>
            </Tabs>
        </div>
      </main>
      <SettingsSheet 
        isOpen={isSettingsOpen} 
        setIsOpen={setIsSettingsOpen}
        profile={profile}
        setProfile={setProfile}
        setTheme={setTheme}
        onResetOnboarding={onResetOnboarding}
      />
    </div>
  );
}
