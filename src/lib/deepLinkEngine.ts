import { DeepLinkProtocols, SupportedPlatform, TargetMode } from '../types/deepLink';

/**
 * Detects the target platform from a given URL.
 */
export function detectPlatform(url: string): SupportedPlatform {
  if (!url) return 'generic';
  const cleanUrl = url.toLowerCase().trim();

  if (cleanUrl.includes('amazon.') || cleanUrl.includes('amzn.to') || cleanUrl.includes('amzn.eu')) {
    return 'amazon';
  }
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (cleanUrl.includes('spotify.com') || cleanUrl.startsWith('spotify:')) {
    return 'spotify';
  }
  if (cleanUrl.includes('instagram.com')) {
    return 'instagram';
  }
  if (cleanUrl.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (cleanUrl.includes('linkedin.com')) {
    return 'linkedin';
  }
  if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
    return 'twitter';
  }
  if (cleanUrl.includes('wa.me') || cleanUrl.includes('whatsapp.com')) {
    return 'whatsapp';
  }
  if (cleanUrl.includes('t.me') || cleanUrl.includes('telegram.me')) {
    return 'telegram';
  }

  return 'generic';
}

/**
 * Normalizes input URL ensuring protocol is present
 */
export function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url) && !url.startsWith('spotify:')) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Appends UTM parameters to a URL
 */
export function applyUtm(
  baseUrl: string,
  utm?: { source?: string; medium?: string; campaign?: string }
): string {
  if (!utm || (!utm.source && !utm.medium && !utm.campaign)) {
    return baseUrl;
  }
  try {
    const parsed = new URL(baseUrl);
    if (utm.source) parsed.searchParams.set('utm_source', utm.source);
    if (utm.medium) parsed.searchParams.set('utm_medium', utm.medium);
    if (utm.campaign) parsed.searchParams.set('utm_campaign', utm.campaign);
    return parsed.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Computes deep linking protocols (iOS Scheme, Android Intent, Fallback) for any URL
 */
export function generateProtocols(
  rawUrl: string,
  targetMode: TargetMode = 'smart'
): DeepLinkProtocols {
  const url = normalizeUrl(rawUrl);
  const platform = detectPlatform(url);

  let hostAndPath = '';
  let fullPath = '';
  try {
    const parsed = new URL(url);
    hostAndPath = parsed.host + parsed.pathname + parsed.search;
    fullPath = parsed.pathname + parsed.search;
  } catch {
    hostAndPath = url.replace(/^https?:\/\//, '');
    fullPath = '/' + hostAndPath;
  }

  const androidChromeIntent = `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end;`;
  const androidBrowserIntent = `intent://${hostAndPath}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;`;
  const iosChromeScheme = `googlechrome://${hostAndPath}`;

  // If user explicitly asks for system_browser escape (force Safari/Chrome)
  if (targetMode === 'system_browser' || platform === 'generic') {
    return {
      platform,
      platformName: platform === 'generic' ? 'Pagina Web / E-Commerce' : getPlatformName(platform),
      iosScheme: url,
      iosChromeScheme,
      androidIntent: androidChromeIntent, // Uses Chrome package on Android to break out of Instagram WebView
      androidChromeIntent,
      androidBrowserIntent,
      webFallback: url,
      recommendedMode: 'system_browser',
      explanation:
        'Su Android lancia direttamente Chrome/Browser predefinito bypassando il webview in-app. Su iOS guida l’utente con il bridge ad aprire in Safari.',
    };
  }

  // App-specific configurations
  switch (platform) {
    case 'amazon': {
      return {
        platform: 'amazon',
        platformName: 'Amazon Shopping',
        iosScheme: `com.amazon.mobile.shopping.web://${hostAndPath}`,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation:
          'Apre direttamente l’app Amazon ufficiale con carrello e credenziali 1-Click già salvate!',
      };
    }

    case 'youtube': {
      return {
        platform: 'youtube',
        platformName: 'YouTube',
        iosScheme: `vnd.youtube://${hostAndPath}`,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.google.android.youtube;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation:
          'Apre l’app YouTube con account Google attivo per iscrizioni, like e commenti istantanei.',
      };
    }

    case 'spotify': {
      let spotifyUri = `spotify://${hostAndPath}`;
      // Check if track, album, or playlist
      const match = url.match(/spotify\.com\/(track|album|playlist|artist|episode)\/([a-zA-Z0-9]+)/);
      if (match) {
        spotifyUri = `spotify:${match[1]}:${match[2]}`;
      }
      return {
        platform: 'spotify',
        platformName: 'Spotify',
        iosScheme: spotifyUri,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.spotify.music;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Apre direttamente la traccia o playlist nell’app Spotify senza chiedere login web.',
      };
    }

    case 'instagram': {
      const cleanPath = url.replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, '').replace(/\/$/, '');
      const parts = cleanPath.split(/[/?#]/);
      let iosScheme = `instagram://${hostAndPath}`;

      if (parts[0] === 'p' && parts[1]) {
        iosScheme = `instagram://media?id=${parts[1]}`;
      } else if (parts[0] === 'reel' && parts[1]) {
        iosScheme = `instagram://reel?shortcode=${parts[1]}`;
      } else if (parts[0] === 'stories' && parts[1]) {
        iosScheme = `instagram://story?username=${parts[1]}`;
      } else if (parts[0] && !['explore', 'direct', 'reels', 'tv', 'accounts'].includes(parts[0].toLowerCase())) {
        iosScheme = `instagram://user?username=${parts[0]}`;
      }

      return {
        platform: 'instagram',
        platformName: 'Instagram',
        iosScheme,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.instagram.android;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Apre il profilo o reel direttamente nell’app Instagram per follow con 1 tap.',
      };
    }

    case 'tiktok': {
      return {
        platform: 'tiktok',
        platformName: 'TikTok',
        iosScheme: `snssdk1233://${hostAndPath}`,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.zhiliaoapp.musically;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Lancia TikTok nativo con riproduzione video a schermo intero.',
      };
    }

    case 'linkedin': {
      return {
        platform: 'linkedin',
        platformName: 'LinkedIn',
        iosScheme: `linkedin://${hostAndPath}`,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.linkedin.android;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Apre l’app LinkedIn per collegamenti e candidature con sessione già attiva.',
      };
    }

    case 'twitter': {
      const screenNameMatch = url.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/);
      const screenName = screenNameMatch ? screenNameMatch[1] : '';
      const iosScheme = screenName
        ? `twitter://user?screen_name=${screenName}`
        : `twitter://${hostAndPath}`;

      return {
        platform: 'twitter',
        platformName: 'X (Twitter)',
        iosScheme,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.twitter.android;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Apre il tweet o profilo direttamente nell’app X nativa.',
      };
    }

    case 'whatsapp': {
      return {
        platform: 'whatsapp',
        platformName: 'WhatsApp',
        iosScheme: `whatsapp://send?text=${encodeURIComponent(url)}`,
        androidIntent: `intent://${hostAndPath}#Intent;package=com.whatsapp;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Apre la chat diretta WhatsApp.',
      };
    }

    case 'telegram': {
      const match = url.match(/t\.me\/([a-zA-Z0-9_]+)/);
      const domain = match ? match[1] : '';
      return {
        platform: 'telegram',
        platformName: 'Telegram',
        iosScheme: domain ? `tg://resolve?domain=${domain}` : `tg://${hostAndPath}`,
        androidIntent: `intent://${hostAndPath}#Intent;package=org.telegram.messenger;scheme=https;end;`,
        webFallback: url,
        recommendedMode: 'native_app',
        explanation: 'Apre il canale o gruppo nell’app Telegram nativa.',
      };
    }

    default: {
      return {
        platform: 'generic',
        platformName: 'Pagina Web / E-Commerce',
        iosScheme: url,
        iosChromeScheme,
        androidIntent: androidChromeIntent,
        androidChromeIntent,
        androidBrowserIntent,
        webFallback: url,
        recommendedMode: 'system_browser',
        explanation:
          'Bypassa il webview di Instagram/TikTok: forza Chrome su Android e guida l’apertura in Safari su iPhone.',
      };
    }
  }
}

export function getPlatformName(platform: SupportedPlatform): string {
  switch (platform) {
    case 'amazon':
      return 'Amazon Shopping';
    case 'youtube':
      return 'YouTube';
    case 'spotify':
      return 'Spotify';
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'linkedin':
      return 'LinkedIn';
    case 'twitter':
      return 'X / Twitter';
    case 'whatsapp':
      return 'WhatsApp';
    case 'telegram':
      return 'Telegram';
    case 'generic':
    default:
      return 'Sito Web / Negozio';
  }
}

/**
 * Creates a clean slug from a string (e.g. "Mio Prodotto 2026" -> "mio-prodotto-2026")
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 40);
}

/**
 * Generates a short random slug (e.g. "k8x9q")
 */
export function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
