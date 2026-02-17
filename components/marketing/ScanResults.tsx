'use client';

import { Shield, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import type { TranslatedViolation } from '@/lib/scanner';
import ScoreGauge from './ScoreGauge';
import ViolationCard from './ViolationCard';

interface ScanResultsProps {
  score: number;
  totalViolations: number;
  violations: TranslatedViolation[];
  pageTitle: string;
  scannedAt: string;
  url: string;
}

export default function ScanResults({
  score,
  totalViolations,
  violations,
  pageTitle,
  scannedAt,
  url,
}: ScanResultsProps) {
  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const seriousCount = violations.filter((v) => v.severity === 'serious').length;
  const displayedCount = violations.length;
  const remainingCount = totalViolations - displayedCount;

  const formattedDate = new Date(scannedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full mb-4">
          <Shield className="w-4 h-4" />
          <span>Scan completed {formattedDate}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          Results for {pageTitle}
        </h2>
        <p className="text-gray-500 text-sm truncate max-w-md mx-auto">{url}</p>
      </div>

      {/* Score + Summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <ScoreGauge score={score} />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Compliance Score
            </h3>
            <p className="text-gray-600 mb-4">
              We found{' '}
              <span className="font-semibold text-gray-900">
                {totalViolations} violation{totalViolations !== 1 ? 's' : ''}
              </span>{' '}
              on this page
              {criticalCount > 0 && (
                <>
                  , including{' '}
                  <span className="font-semibold text-red-600">
                    {criticalCount} critical issue{criticalCount !== 1 ? 's' : ''}
                  </span>
                </>
              )}
              {criticalCount === 0 && seriousCount > 0 && (
                <>
                  , including{' '}
                  <span className="font-semibold text-orange-600">
                    {seriousCount} serious issue{seriousCount !== 1 ? 's' : ''}
                  </span>
                </>
              )}
              .
            </p>
            {/* Severity breakdown */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {[
                { label: 'Critical', count: criticalCount, cls: 'bg-red-100 text-red-800' },
                { label: 'Serious', count: seriousCount, cls: 'bg-orange-100 text-orange-800' },
                {
                  label: 'Moderate',
                  count: violations.filter((v) => v.severity === 'moderate').length,
                  cls: 'bg-yellow-100 text-yellow-800',
                },
                {
                  label: 'Minor',
                  count: violations.filter((v) => v.severity === 'minor').length,
                  cls: 'bg-blue-100 text-blue-800',
                },
              ].map(
                (item) =>
                  item.count > 0 && (
                    <span
                      key={item.label}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.cls}`}
                    >
                      {item.count} {item.label}
                    </span>
                  )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Violations list */}
      {violations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Violations Found
          </h3>
          <div className="space-y-3">
            {violations.map((violation, i) => (
              <ViolationCard key={violation.ruleId} violation={violation} index={i} />
            ))}
          </div>
        </div>
      )}

      {violations.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            No Violations Detected
          </h3>
          <p className="text-green-700">
            Great news! We didn&apos;t find any WCAG 2.1 AA violations on this page.
            Sign up to monitor your site and catch issues as they appear.
          </p>
        </div>
      )}

      {/* Blurred/locked section for remaining violations */}
      {remainingCount > 0 && (
        <div className="relative mb-8">
          {/* Fake blurred violation cards */}
          <div className="space-y-3 select-none" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 blur-[6px]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-300 rounded" />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <div className="h-5 w-16 bg-gray-300 rounded-full" />
                      <div className="h-5 w-20 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-3/4 bg-gray-300 rounded mb-1" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
            <div className="text-center px-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                +{remainingCount} more violation{remainingCount !== 1 ? 's' : ''} found
              </h4>
              <p className="text-gray-600 text-sm mb-4 max-w-sm">
                Sign up free to see all {totalViolations} violations, get detailed fix
                instructions, and set up weekly monitoring.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md shadow-orange-200"
              >
                Start Monitoring This Site — Free Trial
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section (always show) */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span className="text-orange-400 font-semibold text-sm">
            Don&apos;t wait for a lawsuit
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">
          Get Ongoing ADA Compliance Monitoring
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm sm:text-base">
          Accessibility issues come back every time your site is updated. Continuous
          monitoring catches new violations before they become legal liability.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
        >
          Start Free Trial
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-gray-500 text-xs mt-3">
          No credit card required. Scan up to 5 pages free.
        </p>
      </div>
    </div>
  );
}
