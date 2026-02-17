'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  FileText,
  Download,
  Check,
  Info,
} from 'lucide-react';
import type { Site, Scan, Violation, Profile } from '@/lib/types/database';
import {
  generateAccessibilityStatement,
  statementToPlainText,
} from '@/lib/reports/generate-statement';
import type { StatementOptions } from '@/lib/reports/generate-statement';

interface StatementContentProps {
  site: Site;
  latestScan: Scan | null;
  violations: Violation[];
  profile: Profile;
}

type CopiedState = 'idle' | 'html' | 'text';

export default function StatementContent({
  site,
  latestScan,
  violations,
  profile,
}: StatementContentProps) {
  const [companyName, setCompanyName] = useState(
    profile.company_name || site.name
  );
  const [contactEmail, setContactEmail] = useState('');
  const [additionalCommitment, setAdditionalCommitment] = useState('');
  const [copied, setCopied] = useState<CopiedState>('idle');

  const options: StatementOptions = useMemo(
    () => ({
      companyName,
      contactEmail,
      additionalCommitment,
    }),
    [companyName, contactEmail, additionalCommitment]
  );

  const statementHtml = useMemo(
    () =>
      generateAccessibilityStatement(
        site,
        latestScan,
        violations,
        profile,
        options
      ),
    [site, latestScan, violations, profile, options]
  );

  const statementPlainText = useMemo(
    () => statementToPlainText(statementHtml),
    [statementHtml]
  );

  const copyToClipboard = useCallback(
    async (type: 'html' | 'text') => {
      const content = type === 'html' ? statementHtml : statementPlainText;
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied('idle'), 2000);
    },
    [statementHtml, statementPlainText]
  );

  const downloadHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Accessibility Statement - ${companyName}</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1 { color: #111; font-size: 1.75rem; margin-bottom: 1.5rem; }
  h2 { color: #222; font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; }
  p { margin-bottom: 1rem; }
  ul { margin-bottom: 1rem; padding-left: 1.5rem; }
  li { margin-bottom: 0.5rem; }
  a { color: #2563eb; }
  strong { font-weight: 600; }
</style>
</head>
<body>
${statementHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-statement-${site.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [statementHtml, companyName, site.name]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/sites/${site.id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {site.name}
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Accessibility Statement
        </h1>
        <p className="text-sm text-gray-500">
          Generate a customized accessibility statement based on your scan data.
          Add this to your website&apos;s footer or a dedicated Accessibility page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Customization */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customization card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Customize
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Accessibility Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="accessibility@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="additionalCommitment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Commitment Text
                </label>
                <textarea
                  id="additionalCommitment"
                  value={additionalCommitment}
                  onChange={(e) => setAdditionalCommitment(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Add any additional commitment or context about your accessibility efforts..."
                />
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Export
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard('html')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                {copied === 'html' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied HTML
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy HTML
                  </>
                )}
              </button>
              <button
                onClick={() => copyToClipboard('text')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {copied === 'text' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied Plain Text
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Copy Plain Text
                  </>
                )}
              </button>
              <button
                onClick={downloadHtml}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download as HTML File
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-xs text-blue-700">
              This statement auto-updates when your scan data changes. Re-export
              it after each scan to keep it current.
            </p>
          </div>
        </div>

        {/* Right column: Preview */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-medium text-gray-500">Preview</h2>
            </div>
            <div
              className="statement-preview p-6"
              dangerouslySetInnerHTML={{ __html: statementHtml }}
            />
          </div>
        </div>
      </div>

      {/* Preview styles */}
      <style>{`
        .statement-preview h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.25rem;
          line-height: 1.3;
        }
        .statement-preview h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.75rem;
          margin-bottom: 0.625rem;
          line-height: 1.4;
        }
        .statement-preview p {
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 0.875rem;
        }
        .statement-preview ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .statement-preview li {
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 0.375rem;
          list-style-type: disc;
        }
        .statement-preview a {
          color: #2563eb;
          text-decoration: underline;
        }
        .statement-preview strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
