import * as Collapsible from '@radix-ui/react-collapsible';
import { Info } from 'lucide-react';

type Props = {
  text?: string;
  audioUrl?: string;
};

export default function ExecutionInfoCard({ text, audioUrl }: Props) {
  const content = text || '';
  return (
    <div className="mx-4 mt-4 rounded-xl border border-primary bg-[#121212] text-white">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-headline font-semibold">Como executar o exercício</span>
        </div>
      </div>
      <Collapsible.Root defaultOpen>
        <Collapsible.Content>
          <div className="px-4 pb-4 text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">
            {content}
          </div>
          {audioUrl ? (
            <div className="px-4 pb-4">
              <audio controls src={audioUrl} className="w-full" />
            </div>
          ) : null}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
