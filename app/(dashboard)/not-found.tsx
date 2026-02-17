import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <FileQuestion className="h-7 w-7 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The page, site, or scan you&apos;re looking for doesn&apos;t exist or
          you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
