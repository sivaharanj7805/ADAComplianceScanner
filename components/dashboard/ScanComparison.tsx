'use client';

import {
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import type { ScanComparison } from '@/lib/scanner/compare';

interface ScanComparisonProps {
  comparison: ScanComparison;
  previousScanDate: string;
}

export default function ScanComparisonBanner({
  comparison,
  previousScanDate,
}: ScanComparisonProps) {
  const { scoreChange, newViolations, resolvedViolations, persistingViolations } =
    comparison;

  const formattedDate = new Date(previousScanDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
        <p className="text-sm font-medium text-gray-600">
          Compared to previous scan
          <span className="ml-1 text-gray-400">({formattedDate})</span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
        {/* Score change */}
        <div className="bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Score Change</p>
          <div className="mt-1 flex items-center gap-1.5">
            {scoreChange !== null ? (
              <>
                {scoreChange > 0 ? (
                  <ArrowUp className="h-5 w-5 text-emerald-500" />
                ) : scoreChange < 0 ? (
                  <ArrowDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-400" />
                )}
                <span
                  className={`text-xl font-bold ${
                    scoreChange > 0
                      ? 'text-emerald-600'
                      : scoreChange < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {scoreChange > 0 ? '+' : ''}
                  {scoreChange} {scoreChange !== 0 ? 'pts' : ''}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-400">--</span>
            )}
          </div>
        </div>

        {/* New violations */}
        <div className="bg-white p-4">
          <p className="text-xs font-medium text-gray-500">New Violations</p>
          <div className="mt-1 flex items-center gap-1.5">
            <AlertCircle
              className={`h-5 w-5 ${
                newViolations.length > 0 ? 'text-red-500' : 'text-gray-300'
              }`}
            />
            <span
              className={`text-xl font-bold ${
                newViolations.length > 0 ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {newViolations.length}
            </span>
          </div>
        </div>

        {/* Resolved violations */}
        <div className="bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Resolved</p>
          <div className="mt-1 flex items-center gap-1.5">
            <CheckCircle2
              className={`h-5 w-5 ${
                resolvedViolations.length > 0
                  ? 'text-emerald-500'
                  : 'text-gray-300'
              }`}
            />
            <span
              className={`text-xl font-bold ${
                resolvedViolations.length > 0
                  ? 'text-emerald-600'
                  : 'text-gray-600'
              }`}
            >
              {resolvedViolations.length}
            </span>
          </div>
        </div>

        {/* Remaining violations */}
        <div className="bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Remaining</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-xl font-bold text-gray-600">
              {persistingViolations.length}
            </span>
          </div>
        </div>
      </div>

      {/* Positive reinforcement message */}
      {resolvedViolations.length > 0 && (
        <div className="border-t border-gray-100 bg-emerald-50 px-5 py-3">
          <p className="text-sm font-medium text-emerald-700">
            You resolved {resolvedViolations.length} violation
            {resolvedViolations.length === 1 ? '' : 's'} since your last scan
            — great progress!
          </p>
        </div>
      )}
      {newViolations.length > 0 && resolvedViolations.length === 0 && (
        <div className="border-t border-gray-100 bg-amber-50 px-5 py-3">
          <p className="text-sm font-medium text-amber-700">
            {newViolations.length} new violation
            {newViolations.length === 1 ? '' : 's'} appeared since your last
            scan — monitoring is catching issues early.
          </p>
        </div>
      )}
    </div>
  );
}
