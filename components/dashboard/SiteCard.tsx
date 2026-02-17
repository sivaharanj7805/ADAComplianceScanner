import Link from 'next/link';
import { ExternalLink, Play, FileText } from 'lucide-react';
import type { Site } from '@/lib/types/database';
import { formatDistanceToNow } from 'date-fns';

interface SiteCardProps {
  site: Site;
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

function getStatusDot(site: Site): { color: string; label: string } {
  if (site.critical_violations > 0) {
    return { color: 'bg-red-500', label: 'Critical issues' };
  }
  if (site.total_violations > 0) {
    return { color: 'bg-amber-400', label: 'Some issues' };
  }
  if (site.current_score !== null) {
    return { color: 'bg-emerald-500', label: 'Good' };
  }
  return { color: 'bg-gray-300', label: 'Not scanned' };
}

export default function SiteCard({ site }: SiteCardProps) {
  const status = getStatusDot(site);
  const displayUrl = site.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.color}`}
              title={status.label}
            />
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {site.name}
            </h3>
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            {displayUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Score badge */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getScoreBg(
            site.current_score
          )}`}
        >
          <span
            className={`text-lg font-bold ${getScoreColor(site.current_score)}`}
          >
            {site.current_score ?? '—'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div>
          <span className="font-medium text-gray-700">
            {site.total_violations}
          </span>{' '}
          violations
        </div>
        <div className="h-3 w-px bg-gray-200" />
        <div>
          <span
            className={`font-medium ${
              site.critical_violations > 0 ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {site.critical_violations}
          </span>{' '}
          critical
        </div>
        <div className="h-3 w-px bg-gray-200" />
        <div>
          {site.last_scanned_at
            ? formatDistanceToNow(new Date(site.last_scanned_at), {
                addSuffix: true,
              })
            : 'Never scanned'}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
        <Link
          href={`/dashboard/sites/${site.id}/scan`}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Play className="h-3 w-3" />
          Scan Now
        </Link>
        <Link
          href={`/dashboard/sites/${site.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <FileText className="h-3 w-3" />
          View Report
        </Link>
      </div>
    </div>
  );
}

export function SiteCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-56 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-12 rounded-lg bg-gray-200" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
        <div className="h-7 w-20 rounded-lg bg-gray-200" />
        <div className="h-7 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
