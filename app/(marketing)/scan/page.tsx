import type { Metadata } from 'next';
import { Shield, Scale, FileWarning, Gavel, ChevronDown } from 'lucide-react';
import ScanForm from '@/components/marketing/ScanForm';

export const metadata: Metadata = {
  title: 'Free ADA Compliance Scanner | AccessAudit',
  description:
    'Scan your website for ADA and WCAG 2.1 AA accessibility violations in seconds. Free, no signup required. See your compliance score and plain-English fixes.',
  openGraph: {
    title: 'Free ADA Compliance Scanner | AccessAudit',
    description:
      'Is your website ADA compliant? Find out in 30 seconds with our free accessibility scanner.',
  },
};

// ============================================================================
// FAQ data
// ============================================================================

const faqs = [
  {
    question: 'What is ADA web compliance?',
    answer:
      'The Americans with Disabilities Act (ADA) requires businesses to make their websites accessible to people with disabilities. While the ADA doesn\'t specify exact technical standards, courts consistently reference WCAG 2.1 Level AA as the benchmark. This means your website needs to work with screen readers, support keyboard navigation, have sufficient color contrast, provide alt text for images, and more. Our scanner checks your site against these WCAG 2.1 AA criteria and reports violations in plain English.',
  },
  {
    question: 'What happens if my site isn\'t compliant?',
    answer:
      'Non-compliant websites face real legal and financial risk. Over 4,000 ADA web accessibility lawsuits are filed every year, with average settlements ranging from $5,000 to $150,000+. Beyond lawsuits, the DOJ has made clear that websites must be accessible under Title III of the ADA. E-commerce sites and municipal websites are the most frequent targets. Beyond legal risk, an inaccessible site means you\'re losing customers — 1 in 4 US adults has a disability.',
  },
  {
    question: 'How is this different from overlay widgets?',
    answer:
      'Accessibility overlay widgets (like those "accessibility" toolbar buttons) are band-aids that don\'t actually fix your code. Multiple lawsuits have specifically named overlay users as defendants, and the National Federation of the Blind has formally opposed them. Our approach is different: we identify the actual code-level violations on your site and tell you exactly how to fix them. Real compliance means fixing the source code, not adding a layer on top.',
  },
  {
    question: 'How accurate is this free scan?',
    answer:
      'Our scanner uses axe-core, the industry-standard accessibility testing engine trusted by Microsoft, Google, and the US government. It checks against WCAG 2.1 Level AA criteria — the standard referenced in ADA lawsuits. The free scan covers a single page and shows your top 10 violations. For a full-site audit with multi-page crawling, historical tracking, and weekly monitoring, sign up for a paid plan.',
  },
];

// ============================================================================
// FAQ Accordion (server component wrapper for client interactivity)
// ============================================================================

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-gray-200 last:border-0">
      <summary className="flex items-center justify-between cursor-pointer py-5 text-left">
        <h3 className="font-semibold text-gray-900 pr-4">{question}</h3>
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="text-gray-600 pb-5 pr-8 leading-relaxed">{answer}</p>
    </details>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function FreeScanPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency badge */}
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-red-100">
            <Gavel className="w-4 h-4" />
            5,100+ ADA website lawsuits filed in 2025
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            Is Your Website{' '}
            <span className="text-[#F97316]">ADA Compliant?</span>
            <br />
            Find Out in 30 Seconds
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Free accessibility scan — no signup required. See your WCAG
            violations in plain English with actionable fixes.
          </p>

          {/* Scan Form */}
          <ScanForm />

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Powered by axe-core
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>WCAG 2.1 AA standard</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>No signup required</span>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Gavel className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-gray-900">5,100+</span>
              </div>
              <span className="text-sm text-gray-500">ADA lawsuits filed in 2025</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">69%</span>
              </div>
              <span className="text-sm text-gray-500">target e-commerce sites</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <FileWarning className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-gray-900">$150K+</span>
              </div>
              <span className="text-sm text-gray-500">average settlement cost</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            How Our Free Scanner Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Enter Your URL',
                desc: 'Paste any publicly accessible web page URL into the scanner.',
              },
              {
                step: '2',
                title: 'We Scan for Violations',
                desc: 'Our engine loads your page in a real browser and checks against WCAG 2.1 AA criteria.',
              },
              {
                step: '3',
                title: 'Get Plain-English Results',
                desc: 'See your compliance score, violations explained in plain English, and how to fix each one.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-[#F97316] text-white font-bold rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Don&apos;t Wait for a Demand Letter
          </h2>
          <p className="text-gray-400 mb-6">
            Start monitoring your website&apos;s accessibility today. Catch violations
            before they become lawsuits.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-orange-500/25 text-lg"
          >
            Start Free Trial
          </a>
          <p className="text-gray-600 text-sm mt-3">
            No credit card required
          </p>
        </div>
      </section>
    </>
  );
}
