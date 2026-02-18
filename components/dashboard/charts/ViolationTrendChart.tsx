'use client';

import { format } from 'date-fns';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

interface TrendPoint {
    date: string;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
}

interface ViolationTrendChartProps {
    data: TrendPoint[];
    height?: number;
}

const SEVERITY_COLORS = {
    critical: '#EF4444',
    serious: '#F97316',
    moderate: '#EAB308',
    minor: '#3B82F6',
};

const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function ViolationTrendChart({
    data,
    height = 280,
}: ViolationTrendChartProps) {
    const chartData = data.map((d) => ({
        ...d,
        label: format(new Date(d.date), 'MMM d'),
    }));

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
                            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                            <span style={{ fontSize: 12, color: '#64748B', textTransform: 'capitalize' }}>
                                {value}
                            </span>
                        )}
                    />
                    <Area
                        type="monotone"
                        dataKey="critical"
                        stackId="1"
                        stroke={SEVERITY_COLORS.critical}
                        fill="url(#gradient-critical)"
                        strokeWidth={1.5}
                    />
                    <Area
                        type="monotone"
                        dataKey="serious"
                        stackId="1"
                        stroke={SEVERITY_COLORS.serious}
                        fill="url(#gradient-serious)"
                        strokeWidth={1.5}
                    />
                    <Area
                        type="monotone"
                        dataKey="moderate"
                        stackId="1"
                        stroke={SEVERITY_COLORS.moderate}
                        fill="url(#gradient-moderate)"
                        strokeWidth={1.5}
                    />
                    <Area
                        type="monotone"
                        dataKey="minor"
                        stackId="1"
                        stroke={SEVERITY_COLORS.minor}
                        fill="url(#gradient-minor)"
                        strokeWidth={1.5}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
