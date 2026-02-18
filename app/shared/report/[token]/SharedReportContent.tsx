'use client';

import { useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Globe,
  Code,
  Wrench,
} from 'lucide-react';
import type { Scan, Violation, ViolationSeverity } from '@/lib/types/database';

interface SharedReportContentProps {
  scan: Scan;
  violations: Violation[];
  siteName: string;
  siteUrl: string;
}

const SEVERITY_ORDER: ViolationSeverity[] = [
  'critical',
  'serious',
  'moderate',
  'minor',
];

const SEVERITY_CONFIG: Record<
  ViolationSeverity,
  { label: string; color: string; bg: string; border: string; icon: typeof AlertOctagon }
> = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertOctagon,
  },
  serious: {
    label: 'Serious',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: ShieldAlert,
  },
  moderate: {
    label: 'Moderate',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  minor: {
    label: 'Minor',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
  },
};

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-600';
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-gray-100';
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export default function SharedReportContent({
  scan,
  violations,
  siteUrl,
}: SharedReportContentProps) {
  const [severityFilter, setSeverityFilter] = useState<ViolationSeverity | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = violations;
    if (severityFilter !== 'all') {
      result = result.filter((v) => v.severity === severityFilter);
    }
    return result.sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );
  }, [violations, severityFilter]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className={`rounded-xl border p-6 text-center ${getScoreBg(scan.score)}`}>
        <p className="text-sm font-medium text-gray-500">Compliance Score</p>
        <p className={`mt-1 text-5xl font-bold ${getScoreColor(scan.score)}`}>
          {scan.score ?? '—'}
          <span className="text-lg text-gray-400">/100</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {siteUrl}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Violations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scan.total_violations}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Critical</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {scan.critical_count}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Serious</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">
            {scan.serious_count}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Pages Scanned</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scan.pages_scanned}
          </p>
        </div>
      </div>

      {/* Severity summary bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
        {SEVERITY_ORDER.map((severity) => {
          const config = SEVERITY_CONFIG[severity];
          const count =
            severity === 'critical'
              ? scan.critical_count
              : severity === 'serious'
                ? scan.serious_count
                : severity === 'moderate'
                  ? scan.moderate_count
                  : scan.minor_count;
          return (
            <div
              key={severity}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${config.bg} ${config.color} ${config.border}`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  severity === 'critical'
                    ? 'bg-red-500'
                    : severity === 'serious'
                      ? 'bg-orange-500'
                      : severity === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                }`}
              />
              {config.label}: {count}
            </div>
          );
        })}
      </div>

      {/* Violations */}
      {violations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-emerald-600">
            No violations found!
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This scan found no WCAG 2.1 AA accessibility violations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as ViolationSeverity | 'all')
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">All Severities</option>
              {SEVERITY_ORDER.map((s) => (
                <option key={s} value={s}>
                  {SEVERITY_CONFIG[s].label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {violations.length} violation
              {violations.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* Violations list */}
          <div className="space-y-3">
            {filtered.map((v) => {
              const config = SEVERITY_CONFIG[v.severity];
              const Icon = config.icon;
              const expanded = expandedIds.has(v.id);

              return (
                <div
                  key={v.id}
                  className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${config.border}`}
                >
                  <button
                    onClick={() => toggleExpand(v.id)}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left"
                  >
                    <div className={`mt-0.5 rounded-lg p-1.5 ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bg} ${config.color}`}
                        >
                          {config.label}
                        </span>
                        {v.wcag_criteria.length > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {v.wcag_criteria.join(', ')}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-gray-900">
                        {v.description}
                      </h4>
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {v.page_url}
                      </p>
                    </div>
                    {expanded ? (
                      <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          <AlertTriangle className="h-3 w-3" />
                          Impact
                        </div>
                        <p className="text-sm text-gray-700">{v.impact}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          <Wrench className="h-3 w-3" />
                          How to Fix
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {v.help_text}
                        </p>
                      </div>
                      {v.html_snippet && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            <Code className="h-3 w-3" />
                            HTML Snippet
                          </div>
                          <pre className="overflow-x-auto rounded-lg bg-gray-900 px-4 py-3 text-xs text-gray-300 font-mono">
                            <code>{v.html_snippet}</code>
                          </pre>
                        </div>
                      )}
                      {v.css_selector && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            CSS Selector
                          </div>
                          <code className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 font-mono">
                            {v.css_selector}
                          </code>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          <Globe className="h-3 w-3" />
                          Found On
                        </div>
                        <a
                          href={v.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 hover:text-orange-700 break-all"
                        >
                          {v.page_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
