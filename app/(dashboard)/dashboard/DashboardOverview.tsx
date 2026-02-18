import {
  Globe,
  BarChart3,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  getSites,
  getDashboardStats,
  getRecentScans,
  getProfile,
  getOverviewScoreHistory,
} from '@/lib/supabase/queries';
import StatCard from '@/components/dashboard/StatCard';
import SiteCard from '@/components/dashboard/SiteCard';
import EmptyState from '@/components/dashboard/EmptyState';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import DashboardCharts from './DashboardCharts';
import { formatDistanceToNow } from 'date-fns';

interface DashboardOverviewProps {
  userId: string;
  greeting: string;
}

function getScoreAccent(score: number | null): 'green' | 'orange' | 'red' | 'default' {
  if (score === null) return 'default';
  if (score >= 80) return 'green';
  if (score >= 50) return 'orange';
  return 'red';
}

export default async function DashboardOverview({
  userId,
  greeting,
}: DashboardOverviewProps) {
  const [profileResult, statsResult, sitesResult, recentScansResult, overviewScoreResult] =
    await Promise.all([
      getProfile(userId),
      getDashboardStats(userId),
      getSites(userId),
      getRecentScans(userId, 5),
      getOverviewScoreHistory(userId, 30),
    ]);

  // Propagate critical errors to the error boundary
  if (profileResult.error || statsResult.error) {
    console.error('[DashboardOverview] Failed to load dashboard data:', {
      profileError: profileResult.error,
      statsError: statsResult.error,
    });
    throw new Error('Failed to load dashboard data');
  }

  const profile = profileResult.data;
  const stats = statsResult.data;
  const sites = sitesResult.data;
  const recentScans = recentScansResult.data;
  const overviewScoreHistory = overviewScoreResult.data;

  const displayName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s an overview of your accessibility compliance.
        </p>
      </div>

      {/* Upgrade banner for free plan users — opens inline plan modal */}
      {profile?.plan === 'free' && <UpgradeBanner />}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sites Monitored"
          value={String(stats?.sitesCount ?? 0)}
          subValue={`/ ${stats?.sitesLimit ?? 1}`}
          icon={Globe}
        />
        <StatCard
          label="Average Score"
          value={stats?.averageScore !== null && stats?.averageScore !== undefined ? String(stats.averageScore) : '—'}
          icon={BarChart3}
          accent={getScoreAccent(stats?.averageScore ?? null)}
        />
        <StatCard
          label="Total Violations"
          value={String(stats?.totalViolations ?? 0)}
          icon={AlertTriangle}
          accent={
            (stats?.totalViolations ?? 0) > 0 ? 'orange' : 'default'
          }
        />
        <StatCard
          label="Critical Issues"
          value={String(stats?.criticalIssues ?? 0)}
          icon={AlertOctagon}
          accent={(stats?.criticalIssues ?? 0) > 0 ? 'red' : 'default'}
        />
      </div>

      {/* Overview charts */}
      {sites.length > 0 && (
        <DashboardCharts
          sites={sites}
          overviewScoreHistory={overviewScoreHistory}
        />
      )}

      {/* Sites section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Sites</h2>
          {sites.length > 0 && (
            <span className="text-sm text-gray-500">
              {sites.length} site{sites.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {sites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {recentScans.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-100">
              {recentScans.map((scan) => (
                <li
                  key={scan.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  {/* Status icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${scan.status === 'completed'
                        ? 'bg-emerald-50'
                        : scan.status === 'failed'
                          ? 'bg-red-50'
                          : 'bg-gray-100'
                      }`}
                  >
                    {scan.status === 'completed' ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                    ) : scan.status === 'failed' ? (
                      <XCircle className="h-4.5 w-4.5 text-red-500" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Scan {scan.status === 'completed' ? 'completed' : scan.status} &mdash;{' '}
                      {scan.site_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {scan.status === 'completed' && scan.score !== null && (
                        <>
                          Score: {scan.score} &middot; {scan.total_violations}{' '}
                          violation{scan.total_violations === 1 ? '' : 's'}{' '}
                          &middot;{' '}
                        </>
                      )}
                      {formatDistanceToNow(new Date(scan.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Score badge (if completed) */}
                  {scan.status === 'completed' && scan.score !== null && (
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${scan.score >= 80
                          ? 'bg-emerald-50 text-emerald-600'
                          : scan.score >= 50
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                    >
                      {scan.score}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
