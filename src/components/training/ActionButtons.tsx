import { Button } from '@/components/ui/button';

type Props = {
  onFinishSet: () => void;
  onFinishAll: () => void;
  onSubstitute: () => void;
  onAbandon: () => void;
};

export default function ActionButtons({ onFinishSet, onFinishAll, onSubstitute, onAbandon }: Props) {
  return (
    <div className="mx-4 mt-6 space-y-3">
      <Button className="w-full bg-[#FF4D2D] text-white hover:bg-[#e24428]" onClick={onFinishSet}>
        Finalizar série
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="border-[#FF4D2D] text-[#FF4D2D]" onClick={onFinishAll}>
          Finalizar todas as séries
        </Button>
        <Button variant="outline" className="border-[#FF4D2D] text-[#FF4D2D]" onClick={onSubstitute}>
          alterar exercício
        </Button>
      </div>
      <button className="w-full text-red-500 text-sm" onClick={onAbandon}>Abandonar exercício</button>
    </div>
  );
}
