export const PLANS = {
  free: {
    maxBytes: 2 * 1024 * 1024 * 1024,
    defaultExpiryDays: 1,
    maxExpiryDays: 2,
    passwordProtection: false,
    customBranding: false,
    analytics: false
  },
  standard: {
    maxBytes: 20 * 1024 * 1024 * 1024,
    defaultExpiryDays: 5,
    maxExpiryDays: 7,
    passwordProtection: true,
    customBranding: false,
    analytics: true
  },
  enterprise: {
    maxBytes: 100 * 1024 * 1024 * 1024,
    defaultExpiryDays: 5,
    maxExpiryDays: 7,
    passwordProtection: true,
    customBranding: true,
    analytics: true
  }
} as const;

export type PlanId = keyof typeof PLANS;

export type ExpiryPresetId = '1d' | '2d' | '5d' | '7d';

export const EXPIRY_PRESETS: Record<ExpiryPresetId, { label: string; days: number }> = {
  '1d': { label: '1 dag', days: 1 },
  '2d': { label: '2 dagar', days: 2 },
  '5d': { label: '5 dagar', days: 5 },
  '7d': { label: '7 dagar', days: 7 }
};

const DAY_SECONDS = 24 * 60 * 60;

/** Expiry choices shown in the transfer UI per plan */
export const PLAN_EXPIRY_PRESETS: Record<PlanId, ExpiryPresetId[]> = {
  free: ['1d', '2d'],
  standard: ['5d', '7d'],
  enterprise: ['5d', '7d']
};

export function isPaidPlan(plan: PlanId): boolean {
  return plan === 'standard' || plan === 'enterprise';
}

export function getExpiryOptionsForPlan(plan: PlanId): {
  id: ExpiryPresetId;
  label: string;
  seconds: number;
}[] {
  return PLAN_EXPIRY_PRESETS[plan].map((id) => ({
    id,
    label: EXPIRY_PRESETS[id].label,
    seconds: EXPIRY_PRESETS[id].days * DAY_SECONDS
  }));
}

export function defaultExpiryPresetForPlan(plan: PlanId): ExpiryPresetId {
  const days = PLANS[plan].defaultExpiryDays;
  const match = PLAN_EXPIRY_PRESETS[plan].find((id) => EXPIRY_PRESETS[id].days === days);
  return match ?? PLAN_EXPIRY_PRESETS[plan][0];
}

export function expirySecondsForPreset(id: ExpiryPresetId): number {
  return EXPIRY_PRESETS[id].days * DAY_SECONDS;
}

export function isExpiryAllowedForPlan(plan: PlanId, expirySeconds: number): boolean {
  return PLAN_EXPIRY_PRESETS[plan].some((id) => expirySecondsForPreset(id) === expirySeconds);
}

export interface TransferFile {
  id: string;
  name: string;
  size: number;
  mimeType: string | null;
}

export interface TransferPublic {
  token: string;
  title: string | null;
  message: string | null;
  expiresAt: string;
  files: TransferFile[];
  requiresPassword: boolean;
  downloadCount: number;
}

export interface CreateTransferRequest {
  title?: string;
  message?: string;
  recipientEmail?: string;
  senderEmail?: string;
  expiryDays?: number;
  expirySeconds?: number;
  password?: string;
  plan?: PlanId;
}

export interface CreateTransferResponse {
  transferId: string;
  token: string;
  uploadUrl: string;
  expiresAt: string;
  maxBytes: number;
}

export interface TransferNotifyResponse {
  sent: boolean;
  to: string;
  /** Set when Resend sandbox redirects to your account email in dev */
  intendedTo?: string;
}

export type SupportCategory = 'general' | 'billing' | 'technical' | 'enterprise';

export interface SupportRequest {
  name: string;
  email: string;
  category: SupportCategory;
  subject: string;
  message: string;
}

export interface SupportRequestResponse {
  id: string;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  plan: PlanId;
}

export interface UpdateProfileRequest {
  name: string;
}

export const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Gratis',
  standard: 'Standard',
  enterprise: 'Enterprise'
};
