import Link from 'next/link';
import { Shield, CheckCircle, BarChart3 } from 'lucide-react';

// Auth pages depend on Supabase server client at action-invocation time;
// skip static prerendering so the build doesn't need runtime secrets.
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-8 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              AccessAudit
            </span>
          </Link>

          {children}
        </div>
      </div>

      {/* Right side — trust signals */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:bg-[#0F172A] lg:px-12 xl:px-20">
        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative mx-auto max-w-md">
          <h2 className="text-2xl font-bold text-white">
            Protect your business from ADA lawsuits
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            AccessAudit scans your website for WCAG 2.1 AA violations and
            explains every issue in plain English — so you can fix problems
            before they become legal risks.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  5,100+ ADA lawsuits filed in 2025
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Web accessibility lawsuits continue rising year over year.
                  Proactive scanning is your best defense.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                <CheckCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Join 100+ businesses monitoring their accessibility
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Agencies, e-commerce brands, and municipalities trust
                  AccessAudit for continuous compliance monitoring.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  0–100 compliance score in seconds
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Get an instant accessibility score with plain-English
                  explanations — no technical expertise required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
