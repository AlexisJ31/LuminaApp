import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

export interface ChartDataPoint {
  day: string;
  spent: number;
  expected: number;
}

interface CashflowChartProps {
  data?: ChartDataPoint[];
}

export default function CashflowChart({ data }: CashflowChartProps) {
  const { transactions, budgetLimit } = useFinance();

  const currentDay = useMemo(() => new Date().getDate(), []);
  const totalDaysInMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }, []);

  const dynamicChartData = useMemo(() => {
    if (data && data.length > 0) return data;

    const sorted = [...transactions]
      .filter(t => t.type === 'EXPENSE' && (String(t.status).toLowerCase() === 'confirmed'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate checkpoints including currentDay so today has an exact node
    const baseDays = [1, 5, 10, 15, 20, 25, totalDaysInMonth];
    const days = Array.from(new Set([...baseDays, currentDay]))
      .filter(d => d <= totalDaysInMonth)
      .sort((a, b) => a - b);

    return days.map(d => {
      const isFuture = d > currentDay;

      const sum = sorted
        .filter(t => {
          const tDay = new Date(t.date).getDate();
          return isNaN(tDay) || tDay <= d;
        })
        .reduce((acc, t) => acc + t.amount, 0);

      const expectedPacing = Math.round((budgetLimit / totalDaysInMonth) * d);

      return {
        day: d === currentDay ? `D${d} (Hoy)` : `D${d}`,
        dayNum: d,
        spent: isFuture ? (null as unknown as number) : Math.round(sum),
        expected: expectedPacing
      };
    });
  }, [transactions, budgetLimit, data, currentDay, totalDaysInMonth]);

  const chartPoints = data || dynamicChartData;

  return (
    <div className="w-full h-48 sm:h-56 pt-2 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717A" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#71717A" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as any;
                const hasSpent = item.spent !== null && item.spent !== undefined;
                return (
                  <div className="bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08] p-2.5 rounded-lg text-xs space-y-1 shadow-lg text-zinc-900 dark:text-zinc-100">
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-mono">{item.day}</p>
                    {hasSpent ? (
                      <p className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        Real: ${item.spent}.00
                      </p>
                    ) : (
                      <p className="text-zinc-400 font-mono text-[11px] italic">Sin proyectar</p>
                    )}
                    <p className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      Pacing: ${item.expected}.00
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="expected" 
            stroke="#71717a" 
            strokeDasharray="3 3"
            strokeWidth={1.5} 
            fillOpacity={1} 
            fill="url(#expectedGradient)" 
          />
          <Area 
            type="monotone" 
            dataKey="spent" 
            stroke="#10B981" 
            strokeWidth={2} 
            connectNulls={false}
            fillOpacity={1} 
            fill="url(#emeraldGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

