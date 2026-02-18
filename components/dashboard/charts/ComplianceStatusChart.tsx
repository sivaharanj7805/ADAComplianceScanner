'use client';

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from 'recharts';

interface ComplianceGroup {
    name: string;
    value: number;
    color: string;
}

interface ComplianceStatusChartProps {
    sites: { current_score: number | null }[];
    height?: number;
}

const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function ComplianceStatusChart({
    sites,
    height = 280,
}: ComplianceStatusChartProps) {
    const good = sites.filter(
        (s) => s.current_score !== null && s.current_score > 70
    ).length;
    const warning = sites.filter(
        (s) => s.current_score !== null && s.current_score >= 40 && s.current_score <= 70
    ).length;
    const critical = sites.filter(
        (s) => s.current_score !== null && s.current_score < 40
    ).length;
    const unscanned = sites.filter((s) => s.current_score === null).length;

    const data: ComplianceGroup[] = [
        { name: 'Good (>70)', value: good, color: '#10B981' },
        { name: 'Warning (40–70)', value: warning, color: '#F59E0B' },
        { name: 'Critical (<40)', value: critical, color: '#EF4444' },
        ...(unscanned > 0
            ? [{ name: 'Not scanned', value: unscanned, color: '#CBD5E1' }]
            : []),
    ].filter((d) => d.value > 0);

    const total = sites.length;

    if (data.length === 0) {
        return (
            <div
                className="flex items-center justify-center text-sm text-gray-400"
                style={{ height }}
            >
                No sites to display
            </div>
        );
    }

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
                            `${value} site${value === 1 ? '' : 's'}`,
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
                        {total === 1 ? 'site' : 'sites'}
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
