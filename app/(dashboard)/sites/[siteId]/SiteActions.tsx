'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Trash2, Loader2 } from 'lucide-react';
import { triggerScanAction, deleteSiteAction } from '../actions';
import { useToastContext } from '@/components/ui/ToastProvider';

interface SiteActionsProps {
  siteId: string;
}

export default function SiteActions({
  siteId,
}: SiteActionsProps) {
  const router = useRouter();
  const [scanPending, startScanTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToastContext();

  function handleScan() {
    setError(null);
    startScanTransition(async () => {
      try {
        const result = await triggerScanAction(siteId);
        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success('Scan completed successfully.');
          router.refresh();
        }
      } catch {
        setError('Something went wrong. Please try again.');
        toast.error('Failed to start scan. Please check your connection.');
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      try {
        const result = await deleteSiteAction(siteId);
        if (result?.error) {
          toast.error(result.error);
        }
      } catch {
        // deleteSiteAction redirects on success, so errors here are real failures
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleScan}
          disabled={scanPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Scan Now
            </>
          )}
        </button>

        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deletePending}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deletePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirm Delete'
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletePending}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
