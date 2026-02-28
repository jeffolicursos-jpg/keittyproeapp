import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Poppins, PT_Sans } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Experimento',
  description: 'Projeto base neutro para aulas.',
};

export const viewport: Viewport = {
  themeColor: '#10b981',
};

 

metadata.openGraph = {
  title: 'Experimento',
  description: 'Projeto base neutro para aulas.',
  type: 'website',
};

metadata.twitter = {
  card: 'summary_large_image',
  title: 'Experimento',
  description: 'Projeto base neutro para aulas.',
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}