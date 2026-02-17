'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info, AlertOctagon } from 'lucide-react';
import type { TranslatedViolation } from '@/lib/scanner';

interface ViolationCardProps {
  violation: TranslatedViolation;
  index: number;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: AlertOctagon,
  },
  serious: {
    label: 'Serious',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    icon: AlertTriangle,
  },
  moderate: {
    label: 'Moderate',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
  minor: {
    label: 'Minor',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    icon: Info,
  },
} as const;

export default function ViolationCard({ violation, index }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[violation.severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border ${config.border} ${config.bg} overflow-hidden transition-all duration-200`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/50 transition-colors cursor-pointer"
      >
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </span>
            {violation.instanceCount > 1 && (
              <span className="text-xs text-gray-500 font-medium">
                {violation.instanceCount} instances
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
            {violation.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {violation.description}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200/60 pt-3 space-y-3">
          {/* Impact */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Who is affected
            </h4>
            <p className="text-sm text-gray-700">{violation.impact}</p>
          </div>

          {/* How to fix */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              How to fix
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-line">{violation.fix}</p>
          </div>

          {/* WCAG criteria */}
          {violation.wcagCriteria.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                WCAG Criteria
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {violation.wcagCriteria.map((criteria) => (
                  <span
                    key={criteria}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {criteria}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* HTML snippet */}
          {violation.htmlSnippets.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Affected HTML
              </h4>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-md overflow-x-auto max-h-32">
                <code>{violation.htmlSnippets[0]}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
