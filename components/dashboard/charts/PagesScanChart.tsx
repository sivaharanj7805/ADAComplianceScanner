'use client';

import { format } from 'date-fns';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

interface ScanBar {
    date: string;
    pagesScanned: number;
    pagesFailed: number;
}

interface PagesScanChartProps {
    data: ScanBar[];
    height?: number;
}

const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function PagesScanChart({
    data,
    height = 240,
}: PagesScanChartProps) {
    const chartData = data.map((d) => ({
        ...d,
        label: format(new Date(d.date), 'MMM d'),
    }));

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
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
                        formatter={(value: number, name: string) => [
                            value,
                            name === 'pagesScanned' ? 'Pages Scanned' : 'Pages Failed',
                        ]}
                    />
                    <Bar
                        dataKey="pagesScanned"
                        fill="#F97316"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                        name="pagesScanned"
                    />
                    <Bar
                        dataKey="pagesFailed"
                        fill="#FED7AA"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                        name="pagesFailed"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
