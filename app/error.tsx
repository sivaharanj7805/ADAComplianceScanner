'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
