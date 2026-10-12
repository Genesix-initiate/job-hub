import { SubscriptionPlan } from '../types/database';

export interface PlatformAddonPrice {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD' | 'NGN' | 'EUR' | 'GBP';
  billingType: 'one_time' | 'per_post' | 'monthly';
}

const STORAGE_KEY_PLANS = 'jobhub_custom_subscription_plans';
const STORAGE_KEY_ADDONS = 'jobhub_custom_addon_prices';

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Starter / Free',
    description: 'Perfect for small teams and startups testing their hiring pipeline.',
    price: 0,
    currency: 'USD',
    billing_interval: 'month',
    features: [
      'Up to 2 active published jobs',
      'Basic candidate resume search',
      '1 administrator seat',
      'Email notifications on application',
    ],
    max_active_jobs: 2,
    max_applications: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-basic',
    name: 'Growth',
    description: 'Designed for fast-growing businesses and expanding engineering teams.',
    price: 99,
    currency: 'USD',
    billing_interval: 'month',
    features: [
      'Up to 10 active published jobs',
      'Full candidate resume database access',
      '3 team hiring seats',
      'Custom screening questions & tests',
      'Priority applicant email alerts',
      'Standard customer support',
    ],
    max_active_jobs: 10,
    max_applications: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    description: 'Full-suite recruitment infrastructure with advanced screening and video interviews.',
    price: 249,
    currency: 'USD',
    billing_interval: 'month',
    features: [
      'Unlimited active published jobs',
      'Technical assessment integrations',
      'Unlimited recruiting team members',
      'Video interview scheduling',
      'Custom company employer branding',
      'Advanced recruitment pipeline analytics',
    ],
    max_active_jobs: 100,
    max_applications: 5000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    description: 'Bespoke hiring compliance, dedicated talent partner, and SLA guarantees.',
    price: 799,
    currency: 'USD',
    billing_interval: 'month',
    features: [
      'Dedicated Nigeria & Global talent advisor',
      'Custom ATS webhook & API integrations',
      'SSO & SAML security audit logs',
      'Multi-subsidiary billing management',
      'Guaranteed hiring SLA & candidate replacement',
    ],
    max_active_jobs: 999,
    max_applications: 99999,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_ADDON_PRICES: PlatformAddonPrice[] = [
  {
    id: 'addon-featured-job',
    name: 'Featured Job Post Boost',
    description: 'Pin job to top of search results and homepage for 30 days',
    price: 49,
    currency: 'USD',
    billingType: 'per_post',
  },
  {
    id: 'addon-urgent-badge',
    name: 'Urgent Hiring Ribbon',
    description: 'Highlight role as urgent to attract immediate engineering candidates',
    price: 29,
    currency: 'USD',
    billingType: 'per_post',
  },
  {
    id: 'addon-candidate-vetting',
    name: 'Technical Skill Vetting Pass',
    description: 'Full automated coding challenge and proctored technical vetting',
    price: 79,
    currency: 'USD',
    billingType: 'one_time',
  },
];

export const billingPricingService = {
  /**
   * Retrieves current subscription plans (customized by Admin or default)
   */
  getPlans(): SubscriptionPlan[] {
    if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION_PLANS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PLANS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(DEFAULT_SUBSCRIPTION_PLANS));
        return DEFAULT_SUBSCRIPTION_PLANS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SUBSCRIPTION_PLANS;
    }
  },

  /**
   * Updates an existing subscription plan's pricing, features, or details
   */
  updatePlan(planId: string, updates: Partial<SubscriptionPlan>): SubscriptionPlan {
    const plans = this.getPlans();
    let updatedPlan: SubscriptionPlan | null = null;

    const newPlans = plans.map((p) => {
      if (p.id === planId) {
        updatedPlan = {
          ...p,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return updatedPlan;
      }
      return p;
    });

    if (!updatedPlan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(newPlans));
    this.broadcastUpdate();
    return updatedPlan;
  },

  /**
   * Creates a new custom subscription plan
   */
  createPlan(newPlanData: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): SubscriptionPlan {
    const plans = this.getPlans();
    const newPlan: SubscriptionPlan = {
      ...newPlanData,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...plans, newPlan];
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updated));
    this.broadcastUpdate();
    return newPlan;
  },

  /**
   * Deletes / archives a plan
   */
  deletePlan(planId: string): void {
    const plans = this.getPlans();
    const updated = plans.filter((p) => p.id !== planId);
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updated));
    this.broadcastUpdate();
  },

  /**
   * Resets all plans to factory platform defaults
   */
  resetToDefaults(): SubscriptionPlan[] {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(DEFAULT_SUBSCRIPTION_PLANS));
    this.broadcastUpdate();
    return DEFAULT_SUBSCRIPTION_PLANS;
  },

  /**
   * Addon prices
   */
  getAddons(): PlatformAddonPrice[] {
    if (typeof window === 'undefined') return DEFAULT_ADDON_PRICES;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ADDONS);
      if (!raw) return DEFAULT_ADDON_PRICES;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ADDON_PRICES;
    }
  },

  updateAddon(addonId: string, price: number, currency?: 'USD' | 'NGN' | 'EUR' | 'GBP'): void {
    const addons = this.getAddons();
    const updated = addons.map((a) => {
      if (a.id === addonId) {
        return {
          ...a,
          price,
          currency: currency || a.currency,
        };
      }
      return a;
    });
    localStorage.setItem(STORAGE_KEY_ADDONS, JSON.stringify(updated));
    this.broadcastUpdate();
  },

  broadcastUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_pricing_updated'));
    }
  },
};
