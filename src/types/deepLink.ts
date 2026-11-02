export type SupportedPlatform =
  | 'generic'
  | 'amazon'
  | 'youtube'
  | 'spotify'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'twitter'
  | 'whatsapp'
  | 'telegram';

export type TargetMode = 'smart' | 'native_app' | 'system_browser';

export interface DeepLinkStats {
  iosClicks: number;
  androidClicks: number;
  desktopClicks: number;
  inAppBreaks: {
    instagram: number;
    tiktok: number;
    facebook: number;
    whatsapp: number;
    other: number;
  };
  appOpens: number;
  browserEscapes: number;
}

export interface DeepLink {
  id: string;
  slug: string;
  originalUrl: string;
  platform: SupportedPlatform;
  targetMode: TargetMode;
  title: string;
  folder?: string;
  project?: string;
  description: string;
  imageUrl?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  userId?: string;
  createdAt: string;
  updatedAt: string;
  clicks: number;
  stats: DeepLinkStats;
}

export type UserPlan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  status: 'active' | 'canceled' | 'past_due';
  maxLinks: number;
  currentLinkCount?: number;
  createdAt?: string;
}

export interface DeepLinkProtocols {
  platform: SupportedPlatform;
  platformName: string;
  iosScheme: string;
  iosChromeScheme?: string;
  androidIntent: string;
  androidChromeIntent?: string;
  androidBrowserIntent?: string;
  universalLink?: string;
  webFallback: string;
  recommendedMode: TargetMode;
  explanation: string;
  isApp?: boolean;
}
