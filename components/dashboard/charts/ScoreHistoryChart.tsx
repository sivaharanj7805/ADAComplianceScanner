'use client';

import { format } from 'date-fns';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from 'recharts';

interface DataPoint {
    date: string;
    score: number;
}

interface ScoreHistoryChartProps {
    data: DataPoint[];
    height?: number;
}

const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function ScoreHistoryChart({
    data,
    height = 280,
}: ScoreHistoryChartProps) {
    const chartData = data.map((d) => ({
        ...d,
        label: format(new Date(d.date), 'MMM d'),
    }));

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                    />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value: number) => [value, 'Score']}
                    />
                    <ReferenceLine
                        y={80}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        label={{ value: 'Good', position: 'right', fontSize: 11, fill: '#10B981' }}
                    />
                    <ReferenceLine
                        y={50}
                        stroke="#F59E0B"
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#F97316"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#F97316', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
