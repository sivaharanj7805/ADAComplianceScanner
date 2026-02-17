import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  AlertOctagon,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getSite, getScans } from '@/lib/supabase/queries';
import ScoreHistoryChart from './ScoreHistoryChart';
import ViolationBreakdownChart from './ViolationBreakdownChart';
import SiteActions from './SiteActions';

interface SiteDetailContentProps {
  siteId: string;
  userId: string;
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-600';
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-gray-100';
  if (score >= 80) return 'bg-emerald-50';
  if (score >= 50) return 'bg-amber-50';
  return 'bg-red-50';
}

export default async function SiteDetailContent({
  siteId,
  userId,
}: SiteDetailContentProps) {
  const [{ data: site }, { data: scans }] =
    await Promise.all([
      getSite(siteId, userId),
      getScans(siteId, userId, 50),
    ]);

  if (!site) {
    notFound();
  }

  const completedScans = scans.filter((s) => s.status === 'completed');

  // Prepare chart data (score history)
  const scoreHistory = completedScans
    .slice()
    .reverse()
    .map((s) => ({
      date: format(new Date(s.created_at), 'MMM d'),
      score: s.score ?? 0,
      violations: s.total_violations,
    }));

  // Latest scan violation breakdown
  const latestScan = completedScans[0];
  const violationBreakdown = latestScan
    ? [
        { name: 'Critical', value: latestScan.critical_count, color: '#EF4444' },
        { name: 'Serious', value: latestScan.serious_count, color: '#F97316' },
        { name: 'Moderate', value: latestScan.moderate_count, color: '#EAB308' },
        { name: 'Minor', value: latestScan.minor_count, color: '#3B82F6' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/sites"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sites
      </Link>

      {/* Site header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Score circle */}
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${getScoreBg(
              site.current_score
            )}`}
          >
            <span
              className={`text-2xl font-bold ${getScoreColor(
                site.current_score
              )}`}
            >
              {site.current_score ?? '—'}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {site.name}
            </h1>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {site.url}
              <ExternalLink className="h-3 w-3" />
            </a>
            {site.last_scanned_at && (
              <p className="mt-1 text-xs text-gray-400">
                Last scanned{' '}
                {formatDistanceToNow(new Date(site.last_scanned_at), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </div>

        <SiteActions siteId={siteId} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Score</p>
          <p className={`mt-1 text-2xl font-bold ${getScoreColor(site.current_score)}`}>
            {site.current_score ?? '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Violations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {site.total_violations}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Critical</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              site.critical_violations > 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {site.critical_violations}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Scans Run</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {completedScans.length}
          </p>
        </div>
      </div>

      {/* Charts section */}
      {scoreHistory.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Score History
          </h2>
          <ScoreHistoryChart data={scoreHistory} />
        </div>
      )}

      {violationBreakdown.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Violations by Severity
          </h2>
          <ViolationBreakdownChart data={violationBreakdown} />
        </div>
      )}

      {/* Scan history */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Scan History
        </h2>
        {scans.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              No scans yet. Click &quot;Scan Now&quot; to run your first scan.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Score
                  </th>
                  <th className="hidden px-5 py-3 text-left font-medium text-gray-500 sm:table-cell">
                    Violations
                  </th>
                  <th className="hidden px-5 py-3 text-left font-medium text-gray-500 md:table-cell">
                    Pages
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-900">
                      {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-5 py-3">
                      {scan.score !== null ? (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getScoreBg(
                            scan.score
                          )} ${getScoreColor(scan.score)}`}
                        >
                          {scan.score}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">
                          {scan.total_violations}
                        </span>
                        {scan.critical_count > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-red-600">
                            <AlertOctagon className="h-3 w-3" />
                            {scan.critical_count}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-gray-600 md:table-cell">
                      {scan.pages_scanned}/{scan.pages_total}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          scan.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : scan.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : scan.status === 'running'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {scan.status === 'completed' && (
                        <Link
                          href={`/dashboard/sites/${siteId}/scans/${scan.id}`}
                          className="text-xs font-medium text-orange-600 hover:text-orange-700"
                        >
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
