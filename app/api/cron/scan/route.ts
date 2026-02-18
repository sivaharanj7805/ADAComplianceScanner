import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { remoteScanSite } from '@/lib/scanner/remote-scan';
import {
    sendScanCompleteEmail,
    sendNewViolationsEmail,
    sendScoreImprovedEmail,
} from '@/lib/email/send';
import type {
    ViolationInsert,
    ScanPageInsert,
    Site,
    Profile,
} from '@/lib/types/database';

// ============================================================================
// Configuration
// ============================================================================

/** Maximum sites to process per cron invocation (avoids Vercel timeout) */
const MAX_SITES_PER_RUN = 50;

/** Threshold in milliseconds — 23 hours for 'daily' */
const DAILY_THRESHOLD_MS = 23 * 60 * 60 * 1000;

/** Threshold in milliseconds — 6 days for 'weekly' */
const WEEKLY_THRESHOLD_MS = 6 * 24 * 60 * 60 * 1000;

// ============================================================================
// Route handler
// ============================================================================

export async function GET(request: NextRequest) {
    // ── Authorize: only Vercel Cron (or requests with the CRON_SECRET) ──
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error('[CRON /api/cron/scan] CRON_SECRET not configured');
        return NextResponse.json(
            { error: 'Cron secret not configured' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const results: ScanResult[] = [];

    try {
        const supabase = createAdminClient();
        const now = new Date();

        // ── Query all active sites on paid plans that are due for a scan ──
        // Join sites → profiles so we can filter on plan + subscription_status
        const { data: rows, error: queryError } = await supabase
            .from('sites')
            .select('*, profiles!inner(id, email, full_name, plan, subscription_status, pages_per_site_limit)')
            .eq('is_active', true)
            .in('scan_frequency', ['daily', 'weekly'])
            .neq('profiles.plan', 'free')
            .in('profiles.subscription_status', ['active', 'trialing'])
            .order('last_scanned_at', { ascending: true, nullsFirst: true })
            .limit(MAX_SITES_PER_RUN);

        if (queryError) {
            console.error('[CRON /api/cron/scan] Query error:', queryError);
            return NextResponse.json(
                { error: 'Failed to query sites due for scanning' },
                { status: 500 }
            );
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({
                message: 'No sites due for scanning',
                scanned: 0,
                durationMs: Date.now() - startTime,
            });
        }

        // ── Filter by scan frequency thresholds ──
        const dueSites = rows.filter((row) => {
            const site = row as unknown as Site & {
                profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'plan' | 'subscription_status' | 'pages_per_site_limit'>;
            };

            if (!site.last_scanned_at) return true; // Never scanned → due

            const elapsed = now.getTime() - new Date(site.last_scanned_at).getTime();

            if (site.scan_frequency === 'daily') return elapsed >= DAILY_THRESHOLD_MS;
            if (site.scan_frequency === 'weekly') return elapsed >= WEEKLY_THRESHOLD_MS;
            return false;
        });

        if (dueSites.length === 0) {
            return NextResponse.json({
                message: 'No sites past their scan threshold',
                scanned: 0,
                durationMs: Date.now() - startTime,
            });
        }

        // ── Process each due site sequentially ──
        for (const row of dueSites) {
            const site = row as unknown as Site & {
                profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'plan' | 'subscription_status' | 'pages_per_site_limit'>;
            };

            const profile = site.profiles;
            const result = await processSiteScan(supabase, site, profile);
            results.push(result);
        }

        const succeeded = results.filter((r) => r.status === 'completed').length;
        const failed = results.filter((r) => r.status === 'failed').length;

        console.log(
            `[CRON /api/cron/scan] Finished: ${succeeded} succeeded, ${failed} failed, ${Date.now() - startTime}ms`
        );

        return NextResponse.json({
            message: `Processed ${results.length} sites`,
            scanned: succeeded,
            failed,
            results,
            durationMs: Date.now() - startTime,
        });
    } catch (err) {
        console.error('[CRON /api/cron/scan] Unhandled error:', err);
        return NextResponse.json(
            { error: 'Cron job failed unexpectedly' },
            { status: 500 }
        );
    }
}

// ============================================================================
// Types
// ============================================================================

interface ScanResult {
    siteId: string;
    siteName: string;
    status: 'completed' | 'failed';
    score?: number;
    totalViolations?: number;
    error?: string;
}

// ============================================================================
// Site scan processing
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = ReturnType<typeof createAdminClient>;

async function processSiteScan(
    supabase: AdminClient,
    site: Site,
    profile: Pick<Profile, 'id' | 'email' | 'full_name' | 'plan' | 'subscription_status' | 'pages_per_site_limit'>
): Promise<ScanResult> {
    const siteResult: ScanResult = {
        siteId: site.id,
        siteName: site.name,
        status: 'failed',
    };

    try {
        // 1. Create scan record
        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .insert({
                site_id: site.id,
                user_id: site.user_id,
                status: 'running' as const,
                started_at: new Date().toISOString(),
                pages_total: 0,
            })
            .select()
            .single();

        if (scanError || !scan) {
            siteResult.error = scanError?.message ?? 'Failed to create scan record';
            console.error(`[CRON] Failed to create scan for site ${site.id}:`, scanError);
            return siteResult;
        }

        try {
            // 2. Call Railway worker
            const maxPages = profile.pages_per_site_limit;
            const remoteScanResult = await remoteScanSite(site.url, maxPages);
            const { pages: pageOutcomes, summary } = remoteScanResult;

            // 3. Process results
            const allViolations: ViolationInsert[] = [];
            const scanPages: ScanPageInsert[] = [];
            let criticalCount = 0;
            let seriousCount = 0;
            let moderateCount = 0;
            let minorCount = 0;

            for (const outcome of pageOutcomes) {
                if (outcome.success) {
                    const url = outcome.result.url;
                    scanPages.push({
                        scan_id: scan.id,
                        url,
                        status: 'scanned',
                        violation_count: outcome.result.violations.length,
                        score: outcome.result.score,
                        scanned_at: new Date().toISOString(),
                    });

                    for (const v of outcome.result.violations) {
                        if (v.severity === 'critical') criticalCount += v.instanceCount;
                        else if (v.severity === 'serious') seriousCount += v.instanceCount;
                        else if (v.severity === 'moderate') moderateCount += v.instanceCount;
                        else if (v.severity === 'minor') minorCount += v.instanceCount;

                        allViolations.push({
                            scan_id: scan.id,
                            site_id: site.id,
                            page_url: url,
                            rule_id: v.ruleId,
                            severity: v.severity,
                            impact: v.impact,
                            description: v.description,
                            help_text: v.fix,
                            html_snippet: v.htmlSnippets[0] ?? null,
                            css_selector: v.cssSelectors[0] ?? null,
                            wcag_criteria: v.wcagCriteria,
                            is_new: true,
                        });
                    }
                } else {
                    scanPages.push({
                        scan_id: scan.id,
                        url: outcome.error.url,
                        status: 'failed',
                        violation_count: 0,
                        score: null,
                        scanned_at: new Date().toISOString(),
                    });
                }
            }

            const overallScore = summary.overallScore;
            const totalViolations = allViolations.length;

            // 4. Store results in database
            if (allViolations.length > 0) {
                await supabase.from('violations').insert(allViolations);
            }
            if (scanPages.length > 0) {
                await supabase.from('scan_pages').insert(scanPages);
            }

            // 5. Update scan record as completed
            await supabase
                .from('scans')
                .update({
                    status: 'completed' as const,
                    score: overallScore,
                    total_violations: totalViolations,
                    critical_count: criticalCount,
                    serious_count: seriousCount,
                    moderate_count: moderateCount,
                    minor_count: minorCount,
                    pages_scanned: summary.pagesScanned,
                    pages_total: summary.totalPages,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', scan.id);

            // 6. Update site stats
            await supabase
                .from('sites')
                .update({
                    current_score: overallScore,
                    total_violations: totalViolations,
                    critical_violations: criticalCount,
                    last_scanned_at: new Date().toISOString(),
                })
                .eq('id', site.id);

            siteResult.status = 'completed';
            siteResult.score = overallScore;
            siteResult.totalViolations = totalViolations;

            // 7. Send notification emails (fire-and-forget)
            sendNotifications(
                supabase,
                site,
                profile,
                scan.id,
                overallScore,
                allViolations,
                summary.pagesScanned,
                criticalCount,
                seriousCount
            ).catch(() => { });

            return siteResult;
        } catch (err) {
            // Mark scan as failed
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error during scan';
            console.error(`[CRON] Scan execution failed for site ${site.id}:`, err);

            await supabase
                .from('scans')
                .update({
                    status: 'failed' as const,
                    error_message: errorMessage,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', scan.id);

            siteResult.error = errorMessage;
            return siteResult;
        }
    } catch (err) {
        siteResult.error =
            err instanceof Error ? err.message : 'Unexpected error';
        console.error(`[CRON] Unexpected error for site ${site.id}:`, err);
        return siteResult;
    }
}

// ============================================================================
// Email notifications
// ============================================================================

async function sendNotifications(
    supabase: AdminClient,
    site: Site,
    profile: Pick<Profile, 'id' | 'email' | 'full_name'>,
    scanId: string,
    overallScore: number,
    allViolations: ViolationInsert[],
    pagesScanned: number,
    criticalCount: number,
    seriousCount: number
): Promise<void> {
    const completedScan = {
        id: scanId,
        score: overallScore,
        total_violations: allViolations.length,
        critical_count: criticalCount,
        serious_count: seriousCount,
        pages_scanned: pagesScanned,
    };

    // Always send scan-complete email
    sendScanCompleteEmail(profile, completedScan, site, allViolations).catch(
        () => { }
    );

    // Compare with previous scan
    try {
        const { data: recentScans } = await supabase
            .from('scans')
            .select('id, score')
            .eq('site_id', site.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(2);

        const prevScan =
            recentScans && recentScans.length > 1 ? recentScans[1] : null;

        if (prevScan) {
            // Fetch previous violations to detect new ones
            const { data: prevViolations } = await supabase
                .from('violations')
                .select('rule_id, page_url')
                .eq('scan_id', prevScan.id);

            if (prevViolations) {
                const prevRuleIds = new Set(
                    prevViolations.map((v) => `${v.rule_id}:${v.page_url}`)
                );
                const newViolations = allViolations.filter(
                    (v) => !prevRuleIds.has(`${v.rule_id}:${v.page_url}`)
                );

                if (newViolations.length > 0) {
                    sendNewViolationsEmail(profile, site, newViolations).catch(() => { });
                }
            }

            // Score improvement notification
            if (prevScan.score !== null && overallScore > prevScan.score) {
                sendScoreImprovedEmail(
                    profile,
                    site,
                    prevScan.score,
                    overallScore
                ).catch(() => { });
            }
        }
    } catch {
        // Silently ignore email comparison failures
    }
}
