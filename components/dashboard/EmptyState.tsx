import Link from 'next/link';
import { Globe, Plus, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({
  title = 'Add your first site to start monitoring',
  description = 'Start by adding a website URL. We\'ll scan it for ADA/WCAG compliance issues and give you a detailed report in plain English.',
  ctaLabel = 'Add Your First Site',
  ctaHref = '/dashboard/sites/new',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
        <Globe className="h-7 w-7 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
      >
        <Plus className="h-4 w-4" />
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
