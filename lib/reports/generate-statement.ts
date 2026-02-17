import type { Site, Scan, Violation, Profile } from '@/lib/types/database';

export interface StatementOptions {
  companyName: string;
  contactEmail: string;
  additionalCommitment: string;
}

interface ViolationSummary {
  description: string;
  count: number;
  severity: 'critical' | 'serious';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getScoreDescription(score: number): string {
  if (score >= 90) return 'a high level of accessibility compliance';
  if (score >= 75) return 'a good level of accessibility compliance with some areas for improvement';
  if (score >= 50) return 'partial accessibility compliance with known areas requiring attention';
  return 'that accessibility improvements are needed, and we are actively working to address identified issues';
}

function getReviewFrequency(scanFrequency: string): string {
  switch (scanFrequency) {
    case 'daily':
      return 'daily';
    case 'weekly':
      return 'weekly';
    default:
      return 'regularly';
  }
}

function summarizeViolations(violations: Violation[]): ViolationSummary[] {
  const critical = violations.filter((v) => v.severity === 'critical');
  const serious = violations.filter((v) => v.severity === 'serious');

  const summaryMap = new Map<string, ViolationSummary>();

  for (const v of [...critical, ...serious]) {
    const key = v.description;
    const existing = summaryMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      summaryMap.set(key, {
        description: v.description,
        count: 1,
        severity: v.severity as 'critical' | 'serious',
      });
    }
  }

  return Array.from(summaryMap.values())
    .sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return b.count - a.count;
    })
    .slice(0, 10);
}

/**
 * Generate a professional accessibility statement in HTML format
 * based on actual scan data from the site.
 */
export function generateAccessibilityStatement(
  site: Site,
  latestScan: Scan | null,
  violations: Violation[],
  profile: Profile,
  options: StatementOptions
): string {
  const companyName = escapeHtml(options.companyName || site.name);
  const scanDate = latestScan?.completed_at
    ? formatDate(latestScan.completed_at)
    : latestScan?.created_at
      ? formatDate(latestScan.created_at)
      : 'N/A';
  const score = latestScan?.score ?? site.current_score;
  const reviewFrequency = getReviewFrequency(site.scan_frequency);

  const criticalAndSerious = violations.filter(
    (v) => v.severity === 'critical' || v.severity === 'serious'
  );
  const knownIssues = summarizeViolations(violations);
  const hasScanData = latestScan !== null && score !== null;

  let html = `<div class="accessibility-statement">
<h1>Accessibility Statement for ${companyName}</h1>

<h2>Our Commitment to Accessibility</h2>
<p>${companyName} is committed to ensuring digital accessibility for people with disabilities. We believe that every user deserves a seamless and inclusive experience when interacting with our website, regardless of ability or the technology used to access it.</p>
`;

  if (options.additionalCommitment) {
    html += `<p>${escapeHtml(options.additionalCommitment)}</p>
`;
  }

  html += `
<h2>Conformance Standards</h2>
<p>We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>. These guidelines define how to make web content more accessible to people with a wide range of disabilities, including visual, auditory, physical, speech, cognitive, language, learning, and neurological disabilities.</p>
`;

  if (hasScanData) {
    html += `
<h2>Current Accessibility Status</h2>
<p>As of ${scanDate}, our website achieves a compliance score of <strong>${score}/100</strong>, indicating ${getScoreDescription(score!)}.</p>
<p>Our most recent assessment scanned ${latestScan.pages_scanned} page${latestScan.pages_scanned !== 1 ? 's' : ''} and identified ${latestScan.total_violations} accessibility finding${latestScan.total_violations !== 1 ? 's' : ''} across ${latestScan.critical_count} critical, ${latestScan.serious_count} serious, ${latestScan.moderate_count} moderate, and ${latestScan.minor_count} minor categories.</p>
`;
  }

  if (knownIssues.length > 0) {
    html += `
<h2>Known Issues</h2>
<p>We are aware of the following accessibility barriers and are actively working to resolve them:</p>
<ul>
`;
    for (const issue of knownIssues) {
      const countNote = issue.count > 1 ? ` (${issue.count} instances)` : '';
      html += `  <li>${escapeHtml(issue.description)}${countNote}</li>
`;
    }
    html += `</ul>
<p>We are prioritizing these issues based on their impact on users and are working to remediate them as quickly as possible.</p>
`;
  } else if (hasScanData && criticalAndSerious.length === 0 && latestScan.total_violations > 0) {
    html += `
<h2>Current Findings</h2>
<p>Our most recent scan did not identify any critical or serious accessibility barriers. We continue to address minor and moderate findings to improve the overall experience for all users.</p>
`;
  } else if (hasScanData && latestScan.total_violations === 0) {
    html += `
<h2>Current Findings</h2>
<p>Our most recent automated scan did not identify any accessibility violations. We recognize that automated testing covers a subset of accessibility requirements and continue to evaluate our site through additional methods.</p>
`;
  }

  html += `
<h2>Measures We Take</h2>
<p>${companyName} takes the following measures to ensure accessibility:</p>
<ul>
  <li>We ${reviewFrequency} monitor our website using automated accessibility scanning tools.</li>
  <li>We review and address accessibility findings on an ongoing basis.</li>
  <li>We evaluate new content and features for accessibility before deployment.</li>
  <li>We are committed to ongoing improvement of our website&rsquo;s accessibility.</li>
</ul>

<h2>Feedback and Contact Information</h2>
<p>We welcome your feedback on the accessibility of our website. If you encounter accessibility barriers or have suggestions for improvement, please contact us:</p>
`;

  if (options.contactEmail) {
    html += `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(options.contactEmail)}">${escapeHtml(options.contactEmail)}</a></p>
`;
  } else {
    html += `<p><strong>Email:</strong> [Please provide your accessibility contact email]</p>
`;
  }

  html += `<p>We aim to respond to accessibility feedback within 5 business days and to propose a solution within 10 business days.</p>

<h2>Date and Review</h2>
<p>This statement was last updated on <strong>${hasScanData ? scanDate : formatDate(new Date().toISOString())}</strong> and is reviewed ${reviewFrequency}.</p>

<h2>Disclaimer</h2>
<p>This accessibility statement is auto-generated based on automated scanning results. Automated tools can identify many common accessibility issues but cannot detect all possible barriers. For a complete accessibility assessment, we recommend consulting a certified accessibility specialist who can perform manual testing, including evaluation with assistive technologies.</p>
<p>This statement is provided for informational purposes and does not constitute legal advice.</p>
</div>`;

  return html;
}

/**
 * Convert HTML accessibility statement to plain text.
 */
export function statementToPlainText(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/g, '$1\n' + '='.repeat(60) + '\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n$1\n' + '-'.repeat(40) + '\n\n')
    .replace(/<strong>(.*?)<\/strong>/g, '$1')
    .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
    .replace(/<li>(.*?)<\/li>/g, '  - $1\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '\n')
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<div[^>]*>/g, '')
    .replace(/<\/div>/g, '')
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
