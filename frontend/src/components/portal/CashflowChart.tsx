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
  const { transactions } = useFinance();

  const dynamicChartData = useMemo(() => {
    if (data && data.length > 0) return data;

    const sorted = [...transactions]
      .filter(t => t.type === 'EXPENSE' && (String(t.status).toLowerCase() === 'confirmed'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const days = [1, 3, 5, 7, 9, 11, 13, 15];
    return days.map(d => {
      const sum = sorted
        .filter(t => {
          const tDay = new Date(t.date).getDate();
          return isNaN(tDay) || tDay <= d;
        })
        .reduce((acc, t) => acc + t.amount, 0);

      const expectedPacing = Math.round((2000 / 30) * d);
      return {
        day: `Dia ${d}`,
        spent: Math.round(sum),
        expected: expectedPacing
      };
    });
  }, [transactions]);

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
            tick={{ fill: '#ffffff40', fontSize: 10 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff40', fontSize: 10 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ChartDataPoint;
                return (
                  <div className="bg-[#080A0F]/90 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-xs space-y-1 shadow-xl">
                    <p className="text-white/40 text-[10px] font-semibold">{item.day}</p>
                    <p className="text-emerald-400 font-mono font-bold">Gasto Real: ${item.spent}.00</p>
                    <p className="text-blue-400 font-mono text-[11px]">Proyectado: ${item.expected}.00</p>
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
