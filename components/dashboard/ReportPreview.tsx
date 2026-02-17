'use client';

interface ReportPreviewProps {
  agencyName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  footerText: string;
}

export default function ReportPreview({
  agencyName,
  primaryColor,
  secondaryColor,
  logoUrl,
  footerText,
}: ReportPreviewProps) {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Mini PDF cover page preview */}
      <div
        className="relative flex flex-col justify-between p-6 min-h-[420px]"
        style={{ backgroundColor: secondaryColor }}
      >
        {/* Top section */}
        <div>
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 mb-6">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Agency logo preview"
                className="h-8 w-8 object-contain rounded bg-white/10 p-0.5"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {agencyName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {agencyName}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-white leading-tight mb-1">
            WCAG 2.1 AA
            <br />
            Compliance Report
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm mb-6">
            Example Website
          </p>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Website
              </p>
              <p className="text-xs text-white/80">example.com</p>
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Scan Date
              </p>
              <p className="text-xs text-white/80">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Pages Scanned
              </p>
              <p className="text-xs text-white/80">12 of 15</p>
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Compliance Score
              </p>
              <p className="text-sm font-bold text-white">78/100</p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex items-end justify-between mt-6">
          <div>
            <div
              className="w-10 h-1 rounded-full mb-2"
              style={{ backgroundColor: primaryColor }}
            />
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Confidential
            </p>
          </div>
          <p
            className="text-[9px]"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Report ID: A1B2C3D4
          </p>
        </div>
      </div>

      {/* Footer preview */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between">
        <p className="text-[10px] text-gray-400 truncate max-w-[70%]">
          {footerText || `${agencyName} — Confidential Compliance Report`}
        </p>
        <p className="text-[10px]" style={{ color: primaryColor }}>
          1 / 6
        </p>
      </div>
    </div>
  );
}
