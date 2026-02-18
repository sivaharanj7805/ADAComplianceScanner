'use client';

import ScoreHistoryChart from '@/components/dashboard/charts/ScoreHistoryChart';
import ComplianceStatusChart from '@/components/dashboard/charts/ComplianceStatusChart';
import ViolationTrendChart from '@/components/dashboard/charts/ViolationTrendChart';
import type { OverviewScorePoint } from '@/lib/supabase/queries';

interface DashboardChartsProps {
    sites: { current_score: number | null }[];
    overviewScoreHistory: OverviewScorePoint[];
}

export default function DashboardCharts({
    sites,
    overviewScoreHistory,
}: DashboardChartsProps) {
    // Derive a violations trend from the overview score history
    // (we only have totalViolations per day, not per-severity breakdown,
    //  so we show a simple score + violations overview)
    const scoreData = overviewScoreHistory.map((p) => ({
        date: p.date,
        score: p.avgScore,
    }));

    const violationData = overviewScoreHistory.map((p) => ({
        date: p.date,
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: p.totalViolations,
        total: p.totalViolations,
    }));

    const hasScoreData = scoreData.length > 1;
    const hasViolationData = violationData.length > 1;
    const hasSites = sites.length > 0;

    if (!hasScoreData && !hasSites && !hasViolationData) return null;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Average score trend */}
            {hasScoreData && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="mb-4 text-base font-semibold text-gray-900">
                        Average Score (Last 30 Days)
                    </h2>
                    <ScoreHistoryChart data={scoreData} height={240} />
                </div>
            )}

            {/* Sites by compliance status */}
            {hasSites && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-gray-900">
                        Sites by Compliance
                    </h2>
                    <ComplianceStatusChart sites={sites} height={240} />
                </div>
            )}

            {/* Total violations trend */}
            {hasViolationData && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-3">
                    <h2 className="mb-4 text-base font-semibold text-gray-900">
                        Total Violations Trend (Last 30 Days)
                    </h2>
                    <ViolationTrendChart data={violationData} height={220} />
                </div>
            )}
        </div>
    );
}
