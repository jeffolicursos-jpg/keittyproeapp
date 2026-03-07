import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Props = {
  data: Array<{ date: string; kg: number }>;
};

export default function ProgressChart({ data }: Props) {
  return (
    <div className="mx-4 mt-8 rounded-xl border border-neutral-800 bg-[#121212] text-white">
      <div className="px-4 py-3 font-headline font-semibold">Evolução do peso</div>
      <div className="px-2 pb-3" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: '#bbb', fontSize: 12 }} />
            <YAxis tick={{ fill: '#bbb', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff' }} />
            <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
