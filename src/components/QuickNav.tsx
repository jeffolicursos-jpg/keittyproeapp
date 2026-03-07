'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuickNav() {
  const router = useRouter();
  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <Link href="/" className="px-3 py-2 rounded border bg-card">
        Home
      </Link>
      <button onClick={() => router.back()} className="px-3 py-2 rounded border bg-card">
        Voltar
      </button>
    </div>
  );
}
