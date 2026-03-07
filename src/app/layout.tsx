import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Poppins, PT_Sans } from 'next/font/google'
import DevSWGuard from '@/components/DevSWGuard'

export const metadata: Metadata = {
  title: 'Keitty Oliveira Nutri - Método PROE',
  description: 'App de dieta personalizada, treinos e streaks para transformacao corporal',
  metadataBase: new URL('https://keittyproeapp.vercel.app'),
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#10b981',
};

 

metadata.openGraph = {
  title: 'Keitty Oliveira Nutri - Método PROE',
  description: 'Dieta + treino + streaks = sua melhor versao',
  type: 'website',
  url: 'https://keittyproeapp.vercel.app',
  images: [
    { url: '/og-proe.jpg', width: 1200, height: 630, alt: 'Keitty Oliveira Nutri - Método PROE' },
    { url: '/images/sweetpotato.png', width: 512, height: 512, alt: 'PROE' },
  ],
};

metadata.twitter = {
  card: 'summary_large_image',
  title: 'Keitty Oliveira Nutri - Método PROE',
  description: 'Dieta + treino + streaks = sua melhor versao',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${ptSans.variable} font-body antialiased`}>
        <DevSWGuard />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
