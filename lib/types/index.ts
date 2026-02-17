// Re-export all database types
export type {
  // Enums
  PlanType,
  SubscriptionStatus,
  ScanFrequency,
  ScanStatus,
  ViolationSeverity,
  ScanPageStatus,
  // Row types
  Profile,
  Site,
  Scan,
  Violation,
  ScanPage,
  AgencySettings,
  // Insert types
  ProfileInsert,
  SiteInsert,
  ScanInsert,
  ViolationInsert,
  ScanPageInsert,
  AgencySettingsInsert,
  // Update types
  ProfileUpdate,
  SiteUpdate,
  ScanUpdate,
  ViolationUpdate,
  ScanPageUpdate,
  AgencySettingsUpdate,
  // Database root type
  Database,
} from './database';

// ============================================================================
// Utility types
// ============================================================================

/** Extract the Row type for a given table name */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Extract the Insert type for a given table name */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Extract the Update type for a given table name */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/** All table names in the public schema */
export type TableName = keyof Database['public']['Tables'];

/** All enum names in the public schema */
export type EnumName = keyof Database['public']['Enums'];

// Need to import Database for the utility types to resolve
import type { Database } from './database';

// ============================================================================
// Domain-specific utility types
// ============================================================================

/** A scan with its related violations (common join result) */
export interface ScanWithViolations {
  scan: import('./database').Scan;
  violations: import('./database').Violation[];
}

/** A site with its latest scan (common dashboard view) */
export interface SiteWithLatestScan {
  site: import('./database').Site;
  latest_scan: import('./database').Scan | null;
}

/** Violation counts grouped by severity */
export interface ViolationCounts {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  total: number;
}

/** Compliance score breakdown for reports */
export interface ComplianceReport {
  score: number;
  total_rules: number;
  passing_rules: number;
  violation_counts: ViolationCounts;
  pages_scanned: number;
  scan_date: string;
}

/** Typed API error response */
export interface ApiError {
  error: string;
  code?: string;
  status: number;
}

/** Typed API success response */
export interface ApiSuccess<T> {
  data: T;
  status: number;
}

/** Union type for API responses */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Type guard to check if an API response is an error */
export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return 'error' in response;
}
