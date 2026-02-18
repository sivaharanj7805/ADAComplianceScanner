// TypeScript types matching the Supabase database schema.
// Compatible with Supabase's generated type system.
// IMPORTANT: Row/Insert/Update must be `type` aliases (not `interface`)
// because interfaces lack implicit index signatures needed by
// @supabase/postgrest-js's GenericTable constraint.

// ============================================================================
// Enums
// ============================================================================

export type PlanType =
  | 'free'
  | 'agency_starter'
  | 'agency_growth'
  | 'agency_scale'
  | 'ecom_shield'
  | 'ecom_guard'
  | 'ecom_fortress'
  | 'municipal_starter'
  | 'municipal_pro';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'inactive';

export type ScanFrequency = 'manual' | 'weekly' | 'daily';

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ViolationSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export type ScanPageStatus = 'pending' | 'scanned' | 'failed';

// ============================================================================
// Row types (what you get back from a SELECT)
// ============================================================================

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  plan: PlanType;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  sites_limit: number;
  pages_per_site_limit: number;
  created_at: string;
  updated_at: string;
};

export type Site = {
  id: string;
  user_id: string;
  url: string;
  name: string;
  is_active: boolean;
  scan_frequency: ScanFrequency;
  last_scanned_at: string | null;
  current_score: number | null;
  total_violations: number;
  critical_violations: number;
  created_at: string;
  updated_at: string;
};

export type Scan = {
  id: string;
  site_id: string;
  user_id: string;
  status: ScanStatus;
  score: number | null;
  total_violations: number;
  critical_count: number;
  serious_count: number;
  moderate_count: number;
  minor_count: number;
  pages_scanned: number;
  pages_total: number;
  resolved_count: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type Violation = {
  id: string;
  scan_id: string;
  site_id: string;
  page_url: string;
  rule_id: string;
  severity: ViolationSeverity;
  impact: string;
  description: string;
  help_text: string;
  html_snippet: string | null;
  css_selector: string | null;
  wcag_criteria: string[];
  is_new: boolean;
  created_at: string;
};

export type ScanPage = {
  id: string;
  scan_id: string;
  url: string;
  status: ScanPageStatus;
  violation_count: number;
  score: number | null;
  scanned_at: string | null;
};

export type AgencySettings = {
  id: string;
  user_id: string;
  agency_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  report_footer_text: string | null;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// Insert types (what you pass to an INSERT — omit generated/default columns)
// ============================================================================

export type ProfileInsert = {
  id: string;
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  plan?: PlanType;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: SubscriptionStatus;
  sites_limit?: number;
  pages_per_site_limit?: number;
};

export type SiteInsert = {
  id?: string;
  user_id: string;
  url: string;
  name: string;
  is_active?: boolean;
  scan_frequency?: ScanFrequency;
  last_scanned_at?: string | null;
  current_score?: number | null;
  total_violations?: number;
  critical_violations?: number;
};

export type ScanInsert = {
  id?: string;
  site_id: string;
  user_id: string;
  status?: ScanStatus;
  score?: number | null;
  total_violations?: number;
  critical_count?: number;
  serious_count?: number;
  moderate_count?: number;
  minor_count?: number;
  pages_scanned?: number;
  pages_total?: number;
  resolved_count?: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
};

export type ViolationInsert = {
  id?: string;
  scan_id: string;
  site_id: string;
  page_url: string;
  rule_id: string;
  severity: ViolationSeverity;
  impact: string;
  description: string;
  help_text: string;
  html_snippet?: string | null;
  css_selector?: string | null;
  wcag_criteria?: string[];
  is_new?: boolean;
};

export type ScanPageInsert = {
  id?: string;
  scan_id: string;
  url: string;
  status?: ScanPageStatus;
  violation_count?: number;
  score?: number | null;
  scanned_at?: string | null;
};

export type AgencySettingsInsert = {
  id?: string;
  user_id: string;
  agency_name: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string | null;
  report_footer_text?: string | null;
};

// ============================================================================
// Update types (all fields optional except you can't change id)
// ============================================================================

export type ProfileUpdate = {
  email?: string;
  full_name?: string | null;
  company_name?: string | null;
  plan?: PlanType;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: SubscriptionStatus;
  sites_limit?: number;
  pages_per_site_limit?: number;
};

export type SiteUpdate = {
  user_id?: string;
  url?: string;
  name?: string;
  is_active?: boolean;
  scan_frequency?: ScanFrequency;
  last_scanned_at?: string | null;
  current_score?: number | null;
  total_violations?: number;
  critical_violations?: number;
};

export type ScanUpdate = {
  status?: ScanStatus;
  score?: number | null;
  total_violations?: number;
  critical_count?: number;
  serious_count?: number;
  moderate_count?: number;
  minor_count?: number;
  pages_scanned?: number;
  pages_total?: number;
  resolved_count?: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
};

export type ViolationUpdate = {
  severity?: ViolationSeverity;
  impact?: string;
  description?: string;
  help_text?: string;
  html_snippet?: string | null;
  css_selector?: string | null;
  wcag_criteria?: string[];
  is_new?: boolean;
};

export type ScanPageUpdate = {
  status?: ScanPageStatus;
  violation_count?: number;
  score?: number | null;
  scanned_at?: string | null;
};

export type AgencySettingsUpdate = {
  agency_name?: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string | null;
  report_footer_text?: string | null;
};

// ============================================================================
// Supabase Database type (compatible with createClient<Database>())
// ============================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sites: {
        Row: Site;
        Insert: SiteInsert;
        Update: SiteUpdate;
        Relationships: [
          {
            foreignKeyName: 'sites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      scans: {
        Row: Scan;
        Insert: ScanInsert;
        Update: ScanUpdate;
        Relationships: [
          {
            foreignKeyName: 'scans_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      violations: {
        Row: Violation;
        Insert: ViolationInsert;
        Update: ViolationUpdate;
        Relationships: [
          {
            foreignKeyName: 'violations_scan_id_fkey';
            columns: ['scan_id'];
            isOneToOne: false;
            referencedRelation: 'scans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'violations_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      scan_pages: {
        Row: ScanPage;
        Insert: ScanPageInsert;
        Update: ScanPageUpdate;
        Relationships: [
          {
            foreignKeyName: 'scan_pages_scan_id_fkey';
            columns: ['scan_id'];
            isOneToOne: false;
            referencedRelation: 'scans';
            referencedColumns: ['id'];
          },
        ];
      };
      agency_settings: {
        Row: AgencySettings;
        Insert: AgencySettingsInsert;
        Update: AgencySettingsUpdate;
        Relationships: [
          {
            foreignKeyName: 'agency_settings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_type: PlanType;
      subscription_status: SubscriptionStatus;
      scan_frequency: ScanFrequency;
      scan_status: ScanStatus;
      violation_severity: ViolationSeverity;
      scan_page_status: ScanPageStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
