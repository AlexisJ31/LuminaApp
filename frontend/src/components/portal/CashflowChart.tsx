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

  const dynamicChartData = useMemo(() => {
    if (data && data.length > 0) return data;

    const sorted = [...transactions]
      .filter(t => t.type === 'EXPENSE' && (String(t.status).toLowerCase() === 'confirmed'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const days = [1, 5, 10, 15, 20, 25, 30];
    return days.map(d => {
      const sum = sorted
        .filter(t => {
          const tDay = new Date(t.date).getDate();
          return isNaN(tDay) || tDay <= d;
        })
        .reduce((acc, t) => acc + t.amount, 0);

      const expectedPacing = Math.round((budgetLimit / 30) * d);
      return {
        day: `Día ${d}`,
        spent: Math.round(sum),
        expected: expectedPacing
      };
    });
  }, [transactions, budgetLimit, data]);

  const chartPoints = data || dynamicChartData;
  return (
    <div className="w-full h-48 sm:h-56 pt-2 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ChartDataPoint;
                return (
                  <div className="bg-white/95 dark:bg-[#080A0F]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs space-y-1 shadow-xl text-slate-900 dark:text-white">
                    <p className="text-slate-500 dark:text-white/40 text-[10px] font-semibold">{item.day}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Gasto Real: ${item.spent}.00</p>
                    <p className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">Proyectado: ${item.expected}.00</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="expected" 
            stroke="#3B82F6" 
            strokeDasharray="4 4"
            strokeWidth={1.5} 
            fillOpacity={1} 
            fill="url(#expectedGradient)" 
          />
          <Area 
            type="monotone" 
            dataKey="spent" 
            stroke="#10B981" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#emeraldGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
