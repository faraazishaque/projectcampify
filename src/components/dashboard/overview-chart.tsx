'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { users } from '@/lib/data';

const defaultData = Object.entries(
  users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value }));

const chartConfig = {
  value: {
    label: 'Users',
    color: 'hsl(var(--primary))',
  },
};

interface OverviewChartProps {
    data?: {name: string, value: number}[];
    usePercent?: boolean;
}

export function OverviewChart({ data = defaultData, usePercent = false }: OverviewChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (usePercent ? `${value}%` : `${value}`)}
            domain={usePercent ? [0, 100] : undefined}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent hideLabel indicator='dot' formatter={(value) => `${value}${usePercent ? '%' : ''}`} />} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
