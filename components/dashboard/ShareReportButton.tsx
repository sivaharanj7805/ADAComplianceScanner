'use client';

import { useState, useCallback } from 'react';
import {
  Share2,
  Link2,
  Check,
  Loader2,
  Globe,
  Lock,
} from 'lucide-react';
import { toggleShareToken } from '@/app/(dashboard)/sites/[siteId]/scans/[scanId]/actions';

interface ShareReportButtonProps {
  scanId: string;
  initialShareToken: string | null;
}

export default function ShareReportButton({
  scanId,
  initialShareToken,
}: ShareReportButtonProps) {
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShared = shareToken !== null;

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/report/${shareToken}`
    : null;

  const handleToggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await toggleShareToken(scanId, isShared);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShareToken(result.token);
      if (!result.token) {
        setCopied(false);
      }
    } catch {
      setError('Failed to update sharing settings');
    } finally {
      setLoading(false);
    }
  }, [scanId, isShared]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
      >
        <Share2 className="h-4 w-4" />
        Share Report
      </button>

      {showPanel && (
        <div className="absolute right-0 top-full z-10 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isShared ? (
                <Globe className="h-4 w-4 text-emerald-600" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-900">
                Allow public access
              </span>
            </div>
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 ${
                isShared ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={isShared}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isShared ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
              {loading && (
                <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-gray-500" />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {isShared
              ? 'Anyone with the link can view this scan report.'
              : 'Only you can view this scan report.'}
          </p>

          {/* Share URL */}
          {isShared && shareUrl && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 focus:outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
