'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, AlertCircle, Globe } from 'lucide-react';
import type { TranslatedViolation } from '@/lib/scanner';
import ScanResults from './ScanResults';

interface ScanResponse {
  score: number;
  totalViolations: number;
  violations: TranslatedViolation[];
  pageTitle: string;
  scannedAt: string;
}

const statusMessages = [
  'Loading page...',
  'Analyzing accessibility...',
  'Checking WCAG 2.1 AA criteria...',
  'Translating violations...',
  'Generating report...',
];

export default function ScanForm() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [scannedUrl, setScannedUrl] = useState('');

  const handleScan = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      let scanUrl = url.trim();
      if (!scanUrl) return;

      // Auto-prepend https:// if no protocol
      if (!/^https?:\/\//i.test(scanUrl)) {
        scanUrl = `https://${scanUrl}`;
        setUrl(scanUrl);
      }

      setScanning(true);
      setError(null);
      setResult(null);
      setStatusIndex(0);

      // Cycle through status messages while scanning
      const statusTimer = setInterval(() => {
        setStatusIndex((prev) =>
          prev < statusMessages.length - 1 ? prev + 1 : prev
        );
      }, 4000);

      try {
        const res = await fetch('/api/scan/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: scanUrl }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Something went wrong. Please try again.');
          return;
        }

        setResult(data as ScanResponse);
        setScannedUrl(scanUrl);
      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError(
            'Unable to reach our scanning service. Please check your internet connection and try again.'
          );
        } else {
          setError(
            'An unexpected error occurred. Please try again.'
          );
        }
      } finally {
        clearInterval(statusTimer);
        setScanning(false);
      }
    },
    [url]
  );

  return (
    <div className="w-full">
      {/* Scan Form */}
      <form onSubmit={handleScan} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your website URL (e.g., example.com)"
              disabled={scanning}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-orange-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Website URL to scan"
            />
          </div>
          <button
            type="submit"
            disabled={scanning || !url.trim()}
            className="flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 whitespace-nowrap cursor-pointer"
          >
            {scanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Now
              </>
            )}
          </button>
        </div>
      </form>

      {/* Scanning progress */}
      {scanning && (
        <div className="mt-8 text-center animate-fadeIn">
          <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-full px-6 py-3">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            <span className="text-orange-700 font-medium">
              {statusMessages[statusIndex]}
            </span>
          </div>
          <div className="mt-4 max-w-xs mx-auto">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-scanProgress" />
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !scanning && (
        <div className="mt-6 max-w-2xl mx-auto animate-fadeIn">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium text-sm">Scan failed</p>
              <p className="text-red-600 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !scanning && (
        <div className="mt-10">
          <ScanResults
            score={result.score}
            totalViolations={result.totalViolations}
            violations={result.violations}
            pageTitle={result.pageTitle}
            scannedAt={result.scannedAt}
            url={scannedUrl}
          />
        </div>
      )}
    </div>
  );
}
