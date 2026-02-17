'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Loader2, AlertCircle } from 'lucide-react';
import { createSiteAction, triggerScanAction } from '../actions';

export default function AddSiteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setStatus('Creating site...');

    startTransition(async () => {
      const result = await createSiteAction(formData);

      if (result.error) {
        setError(result.error);
        setStatus(null);
        return;
      }

      if (result.siteId) {
        setStatus('Site created! Starting initial scan...');

        // Trigger initial scan
        const scanResult = await triggerScanAction(result.siteId);

        if (scanResult.error) {
          // Site was created but scan failed — still redirect
          router.push(`/dashboard/sites/${result.siteId}`);
          return;
        }

        router.push(`/dashboard/sites/${result.siteId}`);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* URL input */}
        <div className="space-y-1.5">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            Website URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="url"
              name="url"
              type="text"
              required
              disabled={isPending}
              placeholder="example.com"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <p className="text-xs text-gray-400">
            We&apos;ll auto-add https:// if you don&apos;t include it
          </p>
        </div>

        {/* Site name (optional) */}
        <div className="mt-4 space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Site Name{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            disabled={isPending}
            placeholder="Auto-generated from domain if left blank"
            className="w-full rounded-lg border border-gray-300 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Status */}
        {isPending && status && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            {status}
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Site & Scan'
            )}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
