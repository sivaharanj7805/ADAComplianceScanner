'use client';

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from 'recharts';

interface SeverityData {
    name: string;
    value: number;
    color: string;
}

interface ViolationSeverityChartProps {
    data: SeverityData[];
    height?: number;
}

const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function ViolationSeverityChart({
    data,
    height = 280,
}: ViolationSeverityChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        strokeWidth={0}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => [
                            `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                            name,
                        ]}
                    />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                            <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>
                        )}
                    />
                    {/* Center label */}
                    <text
                        x="50%"
                        y="48%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontSize: 24, fontWeight: 700, fill: '#1E293B' }}
                    >
                        {total}
                    </text>
                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontSize: 11, fill: '#94A3B8' }}
                    >
                        total
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
