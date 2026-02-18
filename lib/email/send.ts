import { getResend, EMAIL_FROM, APP_URL } from './client';
import { WelcomeEmail } from './templates/welcome';
import { ScanCompleteEmail } from './templates/scan-complete';
import { NewViolationsEmail } from './templates/new-violations';
import { ScoreImprovedEmail } from './templates/score-improved';
import { WeeklyDigestEmail } from './templates/weekly-digest';
import { TrialEndingEmail } from './templates/trial-ending';
import type { Profile, Scan, Site, Violation } from '@/lib/types/database';

// ============================================================================
// Types
// ============================================================================

interface EmailResult {
  data: { id: string } | null;
  error: string | null;
}

interface SiteSummary {
  name: string;
  url: string;
  score: number | null;
  previousScore: number | null;
  totalViolations: number;
  newViolations: number;
  resolvedViolations: number;
}

// ============================================================================
// Welcome Email
// ============================================================================

export async function sendWelcomeEmail(
  user: Pick<Profile, 'email' | 'full_name'>
): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to AccessAudit',
      react: WelcomeEmail({
        userName: user.full_name ?? '',
        addSiteUrl: `${APP_URL}/dashboard/sites/new`,
      }),
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data ? { id: data.id } : null, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to send welcome email';
    return { data: null, error: message };
  }
}

// ============================================================================
// Scan Complete Email
// ============================================================================

export async function sendScanCompleteEmail(
  user: Pick<Profile, 'email' | 'full_name'>,
  scan: Pick<
    Scan,
    | 'id'
    | 'score'
    | 'total_violations'
    | 'critical_count'
    | 'serious_count'
    | 'pages_scanned'
  >,
  site: Pick<Site, 'name' | 'url'>,
  violations: Pick<Violation, 'description' | 'help_text' | 'severity' | 'rule_id'>[]
): Promise<EmailResult> {
  try {
    const topViolations = violations.slice(0, 3).map((v) => ({
      title: v.help_text,
      severity: v.severity,
      description: v.description,
    }));

    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Scan Complete: ${site.name} scored ${scan.score ?? 0}/100`,
      react: ScanCompleteEmail({
        userName: user.full_name ?? '',
        siteName: site.name,
        siteUrl: site.url,
        score: scan.score ?? 0,
        totalViolations: scan.total_violations,
        criticalCount: scan.critical_count,
        seriousCount: scan.serious_count,
        pagesScanned: scan.pages_scanned,
        topViolations,
        reportUrl: `${APP_URL}/dashboard/scans/${scan.id}`,
      }),
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data ? { id: data.id } : null, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to send scan complete email';
    return { data: null, error: message };
  }
}

// ============================================================================
// New Violations Email
// ============================================================================

export async function sendNewViolationsEmail(
  user: Pick<Profile, 'email' | 'full_name'>,
  site: Pick<Site, 'id' | 'name' | 'url'>,
  newViolations: Pick<
    Violation,
    'description' | 'help_text' | 'severity' | 'page_url'
  >[]
): Promise<EmailResult> {
  try {
    const violationItems = newViolations.map((v) => ({
      title: v.help_text,
      severity: v.severity,
      description: v.description,
      pageUrl: v.page_url,
    }));

    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `New Violations Detected on ${site.name}`,
      react: NewViolationsEmail({
        userName: user.full_name ?? '',
        siteName: site.name,
        siteUrl: site.url,
        newViolations: violationItems,
        dashboardUrl: `${APP_URL}/dashboard/sites/${site.id}`,
      }),
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data ? { id: data.id } : null, error: null };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to send new violations email';
    return { data: null, error: message };
  }
}

// ============================================================================
// Score Improved Email
// ============================================================================

export async function sendScoreImprovedEmail(
  user: Pick<Profile, 'email' | 'full_name'>,
  site: Pick<Site, 'id' | 'name' | 'url'>,
  oldScore: number,
  newScore: number
): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Your Compliance Score Improved! ${site.name}: ${oldScore} → ${newScore}`,
      react: ScoreImprovedEmail({
        userName: user.full_name ?? '',
        siteName: site.name,
        siteUrl: site.url,
        oldScore,
        newScore,
        dashboardUrl: `${APP_URL}/dashboard/sites/${site.id}`,
      }),
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data ? { id: data.id } : null, error: null };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to send score improved email';
    return { data: null, error: message };
  }
}

// ============================================================================
// Weekly Digest Email
// ============================================================================

export async function sendWeeklyDigest(
  user: Pick<Profile, 'email' | 'full_name'>,
  sites: SiteSummary[],
  weekStart: string,
  weekEnd: string
): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Your Weekly Accessibility Report (${weekStart} — ${weekEnd})`,
      react: WeeklyDigestEmail({
        userName: user.full_name ?? '',
        sites,
        weekStart,
        weekEnd,
        dashboardUrl: `${APP_URL}/dashboard`,
      }),
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data ? { id: data.id } : null, error: null };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to send weekly digest email';
    return { data: null, error: message };
  }
}

// ============================================================================
// Trial Ending Email
// ============================================================================

export async function sendTrialEndingEmail(
  user: Pick<Profile, 'email' | 'full_name'>,
  daysLeft: number,
  sitesCount: number,
  averageScore: number | null
): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Your Trial Ends in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}`,
      react: TrialEndingEmail({
        userName: user.full_name ?? '',
        daysLeft,
        sitesCount,
        averageScore,
        upgradeUrl: `${APP_URL}/dashboard/settings/billing`,
      }),
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data ? { id: data.id } : null, error: null };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to send trial ending email';
    return { data: null, error: message };
  }
}
