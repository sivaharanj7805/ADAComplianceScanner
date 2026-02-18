import type { PlanType, ScanFrequency } from '@/lib/types/database';

export interface PlanConfig {
  name: string;
  price: number; // monthly price in USD (0 for free)
  stripePriceId: string; // set to actual Stripe price IDs in production
  limits: {
    sites: number;
    pagesPerSite: number;
    scanFrequency: ScanFrequency;
  };
  features: string[];
  whiteLabel: boolean;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: '',
    limits: { sites: 1, pagesPerSite: 1, scanFrequency: 'manual' },
    features: [
      'Scan 1 page',
      'Top 10 violations',
      'Compliance score',
      'Manual scans only',
    ],
    whiteLabel: false,
  },
  agency_starter: {
    name: 'Agency Starter',
    price: 149,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY_STARTER ?? '',
    limits: { sites: 10, pagesPerSite: 500, scanFrequency: 'weekly' },
    features: [
      'Up to 10 client sites',
      '500 pages per site',
      'Weekly automated scans',
      'White-label reports',
      'PDF export',
      'Email notifications',
    ],
    whiteLabel: true,
  },
  agency_growth: {
    name: 'Agency Growth',
    price: 299,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY_GROWTH ?? '',
    limits: { sites: 25, pagesPerSite: 500, scanFrequency: 'weekly' },
    features: [
      'Up to 25 client sites',
      '500 pages per site',
      'Weekly automated scans',
      'White-label reports',
      'PDF export',
      'Priority support',
    ],
    whiteLabel: true,
  },
  agency_scale: {
    name: 'Agency Scale',
    price: 599,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY_SCALE ?? '',
    limits: { sites: 50, pagesPerSite: 1000, scanFrequency: 'daily' },
    features: [
      'Up to 50 client sites',
      '1,000 pages per site',
      'Daily automated scans',
      'White-label reports',
      'PDF export',
      'Dedicated support',
      'Custom domain',
    ],
    whiteLabel: true,
  },
  ecom_shield: {
    name: 'E-Commerce Shield',
    price: 79,
    stripePriceId: process.env.STRIPE_PRICE_ECOM_SHIELD ?? '',
    limits: { sites: 1, pagesPerSite: 500, scanFrequency: 'weekly' },
    features: [
      '1 site',
      '500 pages',
      'Weekly automated scans',
      'Compliance score',
      'PDF reports',
      'Accessibility statement',
    ],
    whiteLabel: false,
  },
  ecom_guard: {
    name: 'E-Commerce Guard',
    price: 149,
    stripePriceId: process.env.STRIPE_PRICE_ECOM_GUARD ?? '',
    limits: { sites: 3, pagesPerSite: 2000, scanFrequency: 'weekly' },
    features: [
      'Up to 3 sites',
      '2,000 pages per site',
      'Weekly automated scans',
      'PDF reports',
      'Historical tracking',
      'Priority support',
    ],
    whiteLabel: false,
  },
  ecom_fortress: {
    name: 'E-Commerce Fortress',
    price: 299,
    stripePriceId: process.env.STRIPE_PRICE_ECOM_FORTRESS ?? '',
    limits: { sites: 5, pagesPerSite: 5000, scanFrequency: 'daily' },
    features: [
      'Up to 5 sites',
      '5,000 pages per site',
      'Daily automated scans',
      'PDF reports',
      'Historical tracking',
      'Dedicated support',
    ],
    whiteLabel: false,
  },
  municipal_starter: {
    name: 'Municipal Starter',
    price: 99,
    stripePriceId: process.env.STRIPE_PRICE_MUNICIPAL_STARTER ?? '',
    limits: { sites: 1, pagesPerSite: 500, scanFrequency: 'weekly' },
    features: [
      '1 site',
      '500 pages',
      'Weekly automated scans',
      'Title II compliance tracking',
      'PDF reports',
      'Accessibility statement',
    ],
    whiteLabel: false,
  },
  municipal_pro: {
    name: 'Municipal Pro',
    price: 199,
    stripePriceId: process.env.STRIPE_PRICE_MUNICIPAL_PRO ?? '',
    limits: { sites: 3, pagesPerSite: 2000, scanFrequency: 'weekly' },
    features: [
      'Up to 3 sites',
      '2,000 pages per site',
      'Weekly automated scans',
      'Title II compliance tracking',
      'PDF reports',
      'Priority support',
    ],
    whiteLabel: false,
  },
};

/**
 * Look up plan config by Stripe price ID.
 * Returns the plan type and config, or null if not found.
 */
export function getPlanByStripePriceId(
  priceId: string
): { planType: PlanType; config: PlanConfig } | null {
  for (const [planType, config] of Object.entries(PLAN_CONFIGS)) {
    if (config.stripePriceId && config.stripePriceId === priceId) {
      return { planType: planType as PlanType, config };
    }
  }
  return null;
}
