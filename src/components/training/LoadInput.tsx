import { useEffect, useMemo, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  editable?: boolean;
};

export function normalizeBrToNumber(v: string): number {
  const s = v.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return n;
}

export default function LoadInput({ value, onChange, editable = true }: Props) {
  const [focused, setFocused] = useState(false);
  const isValid = useMemo(() => {
    const pattern1 = /^\d{1,3}(\.\d{3})*,\d$/;
    const pattern2 = /^\d+,\d$/;
    return pattern1.test(value) || pattern2.test(value);
  }, [value]);

  useEffect(() => {
    if (!value) onChange('0,0');
  }, []);

  return (
    <div className={`mx-4 mt-4 relative rounded-xl ${focused ? 'border-2 border-[#FF4D2D]' : 'border border-neutral-700'} bg-[#121212]`}>
      <input
        type="text"
        value={value}
        disabled={!editable}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d,\.]/g, '');
          onChange(next);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent text-white text-xl px-5 py-4 pr-16 outline-none"
        placeholder="80,0"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">kg</span>
      {!isValid && (
        <div className="px-5 pb-3 text-xs text-[#FF4D2D]">Formato: 80,0</div>
      )}
    </div>
  );
}
