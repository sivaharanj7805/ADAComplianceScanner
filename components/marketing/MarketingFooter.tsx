import Link from 'next/link';
import { Shield } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Free Scanner', href: '/scan' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'For Agencies', href: '/agencies' },
    { label: 'For E-Commerce', href: '/ecommerce' },
    { label: 'For Municipalities', href: '/municipalities' },
  ],
  resources: [
    { label: 'WCAG 2.1 Guide', href: '/resources/wcag-guide' },
    { label: 'ADA Compliance Checklist', href: '/resources/checklist' },
    { label: 'Why Overlays Fail', href: '/blog/why-overlays-dont-work' },
    { label: 'Documentation', href: '/docs' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function MarketingFooter() {
  return (
    <footer className="bg-[#0F172A] text-gray-300">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="w-7 h-7 text-[#F97316]" />
              <span className="text-xl font-bold text-white">
                AccessAudit
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Automated ADA &amp; WCAG 2.1 AA compliance scanning with
              plain-English reports. Stop lawsuits before they start.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-gray-600" />
            <span>
              &copy; {new Date().getFullYear()} AccessAudit. All rights
              reserved.
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Made with care for a more accessible web.
          </p>
        </div>
      </div>
    </footer>
  );
}
