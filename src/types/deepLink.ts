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
  description: string;
  imageUrl?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  createdAt: string;
  updatedAt: string;
  clicks: number;
  stats: DeepLinkStats;
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
