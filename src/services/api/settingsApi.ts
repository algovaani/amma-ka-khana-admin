import apiClient from './client';

export interface OnboardingFees {
  securityDeposit: number;
  certificateFeeExistingFssai: number;
  certificateFeeNeedFssai: number;
}

export interface FeeCase {
  certificateFee: number;
  securityDeposit: number;
  total: number;
}

export interface OnboardingFeesResponse {
  fees: OnboardingFees;
  breakdown: {
    existingFssai: FeeCase;
    needFssai: FeeCase;
  };
}

export interface RouteCookRadiusResponse {
  routeCookRadiusKm: number;
}

export interface MenuPackagePriceResponse {
  menuPackagePrice: number;
}

export interface GeneralPlatformSettings {
  platformName: string;
  supportEmail: string;
  deliveryFee: number;
  platformCommissionPercent: number;
  minOrderAmount: number;
  minWithdrawAmount: number;
  maxWithdrawAmount: number;
  minWalletTopUp: number;
  maxWalletTopUp: number;
}

export interface PaymentLimitsSettings {
  minOrderAmount: number;
  minWithdrawAmount: number;
  maxWithdrawAmount: number;
  minWalletTopUp: number;
  maxWalletTopUp: number;
}

export interface ServerIssueSettings {
  title: string;
  message: string;
  subMessage: string;
  supportEmail: string;
}

export interface AppAccessSettings {
  appsActive: boolean;
  title: string;
  message: string;
  subMessage: string;
  supportEmail: string;
}

export interface CookHomeCardSettings {
  enabled: boolean;
  title: string;
  message: string;
  subMessage: string;
  updatedAt: string | null;
}

export interface PaymentGatewayConfig {
  id: string;
  provider: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
  mode: 'test' | 'live';
  keyId: string;
  keySecret: string;
  merchantId: string;
  webhookSecret: string;
  extraConfig: string;
}

export interface PaymentGatewaysSettings {
  gateways: PaymentGatewayConfig[];
  updatedAt: string | null;
}

export interface ReferralSettings {
  enabled: boolean;
  trigger: 'signup' | 'first_order';
  customerReferrerReward: number;
  customerRefereeReward: number;
  cookReferrerReward: number;
  cookRefereeReward: number;
  title: string;
  subtitle: string;
  shareMessage: string;
  terms: string;
  linkBaseUrl: string;
}

export interface AdminReferralRow {
  id: string;
  referrer: {
    id: string;
    name: string | null;
    phone: string | null;
    role: string | null;
    referralCode: string | null;
  };
  referee: {
    id: string;
    name: string | null;
    phone: string | null;
    role: string | null;
  };
  referrerAmount: number;
  refereeAmount: number;
  trigger: 'signup' | 'first_order';
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt: string | null;
}

export const settingsApi = {
  getOnboardingFees: () =>
    apiClient.get('/admin/settings/onboarding-fees') as Promise<{ data: OnboardingFeesResponse }>,

  updateOnboardingFees: (fees: OnboardingFees) =>
    apiClient.patch('/admin/settings/onboarding-fees', fees) as Promise<{
      data: OnboardingFeesResponse;
      message: string;
    }>,

  getRouteCookRadius: () =>
    apiClient.get('/admin/settings/route-cook-radius') as Promise<{
      data: RouteCookRadiusResponse;
    }>,

  updateRouteCookRadius: (routeCookRadiusKm: number) =>
    apiClient.patch('/admin/settings/route-cook-radius', { routeCookRadiusKm }) as Promise<{
      data: RouteCookRadiusResponse;
      message: string;
    }>,

  getMenuPackagePrice: () =>
    apiClient.get('/admin/settings/menu-package-price') as Promise<{
      data: MenuPackagePriceResponse;
    }>,

  updateMenuPackagePrice: (menuPackagePrice: number) =>
    apiClient.patch('/admin/settings/menu-package-price', { menuPackagePrice }) as Promise<{
      data: MenuPackagePriceResponse;
      message: string;
    }>,

  getGeneralPlatform: () =>
    apiClient.get('/admin/settings/general-platform') as Promise<{ data: GeneralPlatformSettings }>,

  updateGeneralPlatform: (payload: {
    platformName: string;
    supportEmail: string;
    deliveryFee: number;
    platformCommissionPercent: number;
  }) =>
    apiClient.patch('/admin/settings/general-platform', payload) as Promise<{
      data: GeneralPlatformSettings;
      message: string;
    }>,

  getPaymentLimits: () =>
    apiClient.get('/admin/settings/payment-limits') as Promise<{ data: PaymentLimitsSettings }>,

  updatePaymentLimits: (payload: PaymentLimitsSettings) =>
    apiClient.patch('/admin/settings/payment-limits', payload) as Promise<{
      data: PaymentLimitsSettings;
      message: string;
    }>,

  getServerIssue: () =>
    apiClient.get('/admin/settings/server-issue') as Promise<{ data: ServerIssueSettings }>,

  updateServerIssue: (payload: { title: string; message: string; subMessage?: string }) =>
    apiClient.patch('/admin/settings/server-issue', payload) as Promise<{
      data: ServerIssueSettings;
      message: string;
    }>,

  getAppAccess: () =>
    apiClient.get('/admin/settings/app-access') as Promise<{ data: AppAccessSettings }>,

  updateAppAccess: (payload: {
    appsActive: boolean;
    title?: string;
    message?: string;
    subMessage?: string;
  }) =>
    apiClient.patch('/admin/settings/app-access', payload) as Promise<{
      data: AppAccessSettings;
      message: string;
    }>,

  getCookHomeCard: () =>
    apiClient.get('/admin/settings/cook-home-card') as Promise<{ data: CookHomeCardSettings }>,

  updateCookHomeCard: (payload: {
    enabled: boolean;
    title: string;
    message: string;
    subMessage?: string;
  }) =>
    apiClient.patch('/admin/settings/cook-home-card', payload) as Promise<{
      data: CookHomeCardSettings;
      message: string;
    }>,

  getPaymentGateways: () =>
    apiClient.get('/admin/settings/payment-gateways') as Promise<{ data: PaymentGatewaysSettings }>,

  updatePaymentGateways: (payload: { gateways: PaymentGatewayConfig[] }) =>
    apiClient.patch('/admin/settings/payment-gateways', payload) as Promise<{
      data: PaymentGatewaysSettings;
      message: string;
    }>,

  getReferralSettings: () =>
    apiClient.get('/admin/settings/referral') as Promise<{ data: ReferralSettings }>,

  updateReferralSettings: (payload: ReferralSettings) =>
    apiClient.patch('/admin/settings/referral', payload) as Promise<{
      data: ReferralSettings;
      message: string;
    }>,
};
