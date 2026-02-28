import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  onBack: () => void;
};

export default function TrainingHeader({ title, imageUrl, videoUrl, onBack }: Props) {
  return (
    <div className="bg-[#0F0F0F] text-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="Voltar" className="text-white">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <Link href="/" aria-label="Início" className="inline-flex">
          <Button variant="ghost" size="sm" className="text-white">
            <Home className="w-4 h-4 mr-1" />
            Início
          </Button>
        </Link>
      </div>
      <div className="px-4 pb-3">
        <h1 className="font-headline text-xl font-bold text-[#FF4D2D]">{title}</h1>
      </div>
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={title}
            className="absolute inset-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <Image
            src={imageUrl || '/images/sweetpotato.png'}
            alt={title}
            fill
            className="object-cover rounded-lg"
            sizes="100vw"
            priority
          />
        )}
      </div>
    </div>
  );
}
