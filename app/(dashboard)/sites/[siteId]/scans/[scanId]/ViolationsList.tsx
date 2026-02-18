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
  Tag,
  CheckCircle2,
} from 'lucide-react';
import type { Violation, ViolationSeverity } from '@/lib/types/database';

export type ComparisonFilter = 'all' | 'new' | 'resolved' | 'persisting';

interface ViolationsListProps {
  violations: Violation[];
  pageUrls: string[];
  wcagCriteria: string[];
  /** Resolved violations from the previous scan (not in current) */
  resolvedViolations?: Violation[];
  /** IDs of violations that are new (not in previous scan) */
  newViolationIds?: Set<string>;
  /** IDs of violations that persisted from the previous scan */
  persistingViolationIds?: Set<string>;
  /** Whether comparison data is available */
  hasComparison?: boolean;
}

type GroupBy = 'none' | 'page' | 'rule';

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

export default function ViolationsList({
  violations,
  pageUrls,
  wcagCriteria,
  resolvedViolations = [],
  newViolationIds,
  persistingViolationIds,
  hasComparison = false,
}: ViolationsListProps) {
  const [severityFilter, setSeverityFilter] = useState<ViolationSeverity | 'all'>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [wcagFilter, setWcagFilter] = useState<string>('all');
  const [comparisonFilter, setComparisonFilter] = useState<ComparisonFilter>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    // When showing resolved, use resolved violations list instead
    if (comparisonFilter === 'resolved') {
      let result = resolvedViolations;
      if (severityFilter !== 'all') {
        result = result.filter((v) => v.severity === severityFilter);
      }
      if (pageFilter !== 'all') {
        result = result.filter((v) => v.page_url === pageFilter);
      }
      if (wcagFilter !== 'all') {
        result = result.filter((v) => v.wcag_criteria.includes(wcagFilter));
      }
      return result.sort(
        (a, b) =>
          SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
      );
    }

    let result = violations;

    // Apply comparison filter
    if (comparisonFilter === 'new' && newViolationIds) {
      result = result.filter((v) => newViolationIds.has(v.id));
    } else if (comparisonFilter === 'persisting' && persistingViolationIds) {
      result = result.filter((v) => persistingViolationIds.has(v.id));
    }

    if (severityFilter !== 'all') {
      result = result.filter((v) => v.severity === severityFilter);
    }
    if (pageFilter !== 'all') {
      result = result.filter((v) => v.page_url === pageFilter);
    }
    if (wcagFilter !== 'all') {
      result = result.filter((v) => v.wcag_criteria.includes(wcagFilter));
    }

    // Sort by severity order
    return result.sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );
  }, [violations, resolvedViolations, severityFilter, pageFilter, wcagFilter, comparisonFilter, newViolationIds, persistingViolationIds]);

  const isShowingResolved = comparisonFilter === 'resolved';
  const totalCount = isShowingResolved
    ? resolvedViolations.length
    : violations.length;

  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups = new Map<string, Violation[]>();
    for (const v of filtered) {
      const key = groupBy === 'page' ? v.page_url : v.rule_id;
      const existing = groups.get(key) ?? [];
      existing.push(v);
      groups.set(key, existing);
    }
    return groups;
  }, [filtered, groupBy]);

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

  function cleanPageUrl(url: string) {
    try {
      return new URL(url).pathname || '/';
    } catch {
      return url;
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Severity filter */}
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

        {/* Page URL filter */}
        {pageUrls.length > 1 && (
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="max-w-[250px] truncate rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All Pages</option>
            {pageUrls.map((url) => (
              <option key={url} value={url}>
                {cleanPageUrl(url)}
              </option>
            ))}
          </select>
        )}

        {/* WCAG filter */}
        {wcagCriteria.length > 0 && (
          <select
            value={wcagFilter}
            onChange={(e) => setWcagFilter(e.target.value)}
            className="max-w-[250px] truncate rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All WCAG Criteria</option>
            {wcagCriteria.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {/* Comparison filter (only when comparison data available) */}
        {hasComparison && (
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
            {([
              ['all', 'All'],
              ['new', 'New'],
              ['resolved', 'Resolved'],
              ['persisting', 'Persisting'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setComparisonFilter(key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  comparisonFilter === key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Group by toggle */}
        <div className="ml-auto flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          {([
            ['none', 'List'],
            ['page', 'By Page'],
            ['rule', 'By Type'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setGroupBy(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                groupBy === key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {totalCount}{' '}
        {isShowingResolved ? 'resolved ' : ''}violation
        {totalCount === 1 ? '' : 's'}
      </p>

      {/* Violations */}
      {grouped ? (
        // Grouped view
        <div className="space-y-6">
          {[...grouped.entries()].map(([groupKey, groupViolations]) => (
            <div key={groupKey}>
              <div className="mb-3 flex items-center gap-2">
                {groupBy === 'page' ? (
                  <Globe className="h-4 w-4 text-gray-400" />
                ) : (
                  <Tag className="h-4 w-4 text-gray-400" />
                )}
                <h3 className="text-sm font-semibold text-gray-700">
                  {groupBy === 'page' ? cleanPageUrl(groupKey) : groupKey}
                </h3>
                <span className="text-xs text-gray-400">
                  ({groupViolations.length})
                </span>
              </div>
              <div className="space-y-3">
                {groupViolations.map((v) => (
                  <ViolationCard
                    key={v.id}
                    violation={v}
                    expanded={expandedIds.has(v.id)}
                    onToggle={() => toggleExpand(v.id)}
                    showPageUrl={groupBy !== 'page'}
                    isResolved={isShowingResolved}
                    isNew={hasComparison && !isShowingResolved && (newViolationIds?.has(v.id) ?? false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list
        <div className="space-y-3">
          {filtered.map((v) => (
            <ViolationCard
              key={v.id}
              violation={v}
              expanded={expandedIds.has(v.id)}
              onToggle={() => toggleExpand(v.id)}
              showPageUrl={true}
              isResolved={isShowingResolved}
              isNew={hasComparison && !isShowingResolved && (newViolationIds?.has(v.id) ?? false)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No violations match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}

function ViolationCard({
  violation,
  expanded,
  onToggle,
  showPageUrl,
  isResolved = false,
  isNew = false,
}: {
  violation: Violation;
  expanded: boolean;
  onToggle: () => void;
  showPageUrl: boolean;
  isResolved?: boolean;
  isNew?: boolean;
}) {
  const config = SEVERITY_CONFIG[violation.severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isResolved ? 'border-emerald-200 bg-emerald-50/30' : config.border
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        {isResolved ? (
          <div className="mt-0.5 rounded-lg bg-emerald-100 p-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        ) : (
          <div className={`mt-0.5 rounded-lg p-1.5 ${config.bg}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isResolved
                  ? 'bg-emerald-100 text-emerald-700'
                  : `${config.bg} ${config.color}`
              }`}
            >
              {isResolved ? 'Resolved' : config.label}
            </span>
            {isNew && (
              <span className="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                New
              </span>
            )}
            {violation.wcag_criteria.length > 0 && (
              <span className="text-[10px] text-gray-400">
                {violation.wcag_criteria.join(', ')}
              </span>
            )}
          </div>
          <h4
            className={`mt-1 text-sm font-semibold ${
              isResolved
                ? 'text-gray-400 line-through'
                : 'text-gray-900'
            }`}
          >
            {violation.description}
          </h4>
          {showPageUrl && (
            <p className="mt-0.5 truncate text-xs text-gray-400">
              {violation.page_url}
            </p>
          )}
        </div>

        {expanded ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Impact */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              <AlertTriangle className="h-3 w-3" />
              Impact
            </div>
            <p className="text-sm text-gray-700">{violation.impact}</p>
          </div>

          {/* How to fix */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              <Wrench className="h-3 w-3" />
              How to Fix
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {violation.help_text}
            </p>
          </div>

          {/* HTML snippet */}
          {violation.html_snippet && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                <Code className="h-3 w-3" />
                HTML Snippet
              </div>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 px-4 py-3 text-xs text-gray-300 font-mono">
                <code>{violation.html_snippet}</code>
              </pre>
            </div>
          )}

          {/* CSS selector */}
          {violation.css_selector && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                CSS Selector
              </div>
              <code className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 font-mono">
                {violation.css_selector}
              </code>
            </div>
          )}

          {/* Page URL */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              <Globe className="h-3 w-3" />
              Found On
            </div>
            <a
              href={violation.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 break-all"
            >
              {violation.page_url}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
