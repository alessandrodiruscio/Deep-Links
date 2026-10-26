// Vercel Serverless Function - Native Handler (Zero dependencies, 100% stable)

interface DeepLink {
  id: string;
  slug: string;
  originalUrl: string;
  platform: string;
  targetMode: string;
  title: string;
  description: string;
  imageUrl?: string;
  clicks: number;
  stats: {
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
  };
}

// Persistent initial sample links
const LINKS_CACHE: DeepLink[] = [
  {
    id: 'link_1',
    slug: 'mio-ecommerce',
    originalUrl: 'https://alessandrodiruscio.com',
    platform: 'generic',
    targetMode: 'system_browser',
    title: 'Alessandro Di Ruscio - Sito Ufficiale',
    description: 'Bypass automatico WebView Instagram/TikTok per apertura in Safari e Chrome.',
    clicks: 1420,
    stats: {
      iosClicks: 820,
      androidClicks: 490,
      desktopClicks: 110,
      inAppBreaks: { instagram: 640, tiktok: 380, facebook: 190, whatsapp: 100, other: 110 },
      appOpens: 940,
      browserEscapes: 370,
    },
  },
  {
    id: 'link_2',
    slug: 'amazon-tech',
    originalUrl: 'https://www.amazon.it/dp/B08N5WRWNW',
    platform: 'amazon',
    targetMode: 'native_app',
    title: 'Apple MacBook Air - Amazon',
    description: 'Acquista direttamente nell’app Amazon con 1-Click.',
    clicks: 2840,
    stats: {
      iosClicks: 1620,
      androidClicks: 980,
      desktopClicks: 240,
      inAppBreaks: { instagram: 1200, tiktok: 850, facebook: 490, whatsapp: 210, other: 90 },
      appOpens: 2310,
      browserEscapes: 480,
    },
  },
  {
    id: 'link_3',
    slug: 'canale-youtube',
    originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    targetMode: 'native_app',
    title: 'Video YouTube Ufficiale',
    description: 'Guarda in alta definizione nell’app YouTube.',
    clicks: 980,
    stats: {
      iosClicks: 520,
      androidClicks: 380,
      desktopClicks: 80,
      inAppBreaks: { instagram: 420, tiktok: 310, facebook: 150, whatsapp: 60, other: 40 },
      appOpens: 810,
      browserEscapes: 140,
    },
  },
  {
    id: 'link_4',
    slug: 'playlist-focus',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    platform: 'spotify',
    targetMode: 'native_app',
    title: 'Focus Playlist - Spotify',
    description: 'Ascolta nell’app Spotify.',
    clicks: 450,
    stats: {
      iosClicks: 260,
      androidClicks: 160,
      desktopClicks: 30,
      inAppBreaks: { instagram: 210, tiktok: 130, facebook: 60, whatsapp: 30, other: 20 },
      appOpens: 390,
      browserEscapes: 50,
    },
  },
];

function detectPlatform(url: string): string {
  const clean = (url || '').toLowerCase();
  if (clean.includes('amazon.') || clean.includes('amzn.to')) return 'amazon';
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) return 'youtube';
  if (clean.includes('spotify.com') || clean.startsWith('spotify:')) return 'spotify';
  if (clean.includes('instagram.com')) return 'instagram';
  if (clean.includes('tiktok.com')) return 'tiktok';
  if (clean.includes('linkedin.com')) return 'linkedin';
  if (clean.includes('twitter.com') || clean.includes('x.com')) return 'twitter';
  return 'generic';
}

function computeProtocols(url: string, platform: string, mode: string) {
  let cleanUrl = (url || '').trim();
  if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith('spotify:')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  let hostAndPath = '';
  try {
    const parsed = new URL(cleanUrl);
    hostAndPath = parsed.host + parsed.pathname + parsed.search;
  } catch {
    hostAndPath = cleanUrl.replace(/^https?:\/\//, '');
  }

  const androidChromeIntent = `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end;`;
  const androidBrowserIntent = `intent://${hostAndPath}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;`;
  const iosChromeScheme = `googlechrome://${hostAndPath}`;

  let androidIntent = androidChromeIntent;
  let iosScheme = cleanUrl;
  let platformName = 'Sito Web';

  if (mode !== 'system_browser') {
    switch (platform) {
      case 'amazon':
        platformName = 'Amazon Shopping';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;end;`;
        iosScheme = `com.amazon.mobile.shopping://${hostAndPath}`;
        break;
      case 'youtube':
        platformName = 'YouTube';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        iosScheme = `vnd.youtube://${hostAndPath}`;
        break;
      case 'spotify':
        platformName = 'Spotify';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.spotify.music;scheme=https;end;`;
        const spotMatch = cleanUrl.match(/spotify\.com\/(track|album|playlist|artist|episode)\/([a-zA-Z0-9]+)/);
        iosScheme = spotMatch ? `spotify:${spotMatch[1]}:${spotMatch[2]}` : `spotify://${hostAndPath}`;
        break;
      case 'instagram':
        platformName = 'Instagram';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.instagram.android;scheme=https;end;`;
        const cleanPath = cleanUrl.replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, '').replace(/\/$/, '');
        const parts = cleanPath.split(/[/?#]/);
        if (parts[0] === 'p' && parts[1]) {
          iosScheme = `instagram://media?id=${parts[1]}`;
        } else if (parts[0] === 'reel' && parts[1]) {
          iosScheme = `instagram://reel?shortcode=${parts[1]}`;
        } else if (parts[0] && !['explore', 'direct', 'reels'].includes(parts[0].toLowerCase())) {
          iosScheme = `instagram://user?username=${parts[0]}`;
        } else {
          iosScheme = `instagram://${hostAndPath}`;
        }
        break;
      case 'tiktok':
        platformName = 'TikTok';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.zhiliaoapp.musically;scheme=https;end;`;
        iosScheme = `snssdk1233://${hostAndPath}`;
        break;
      case 'linkedin':
        platformName = 'LinkedIn';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.linkedin.android;scheme=https;end;`;
        iosScheme = `linkedin://${hostAndPath}`;
        break;
      case 'twitter':
        platformName = 'X (Twitter)';
        androidIntent = `intent://${hostAndPath}#Intent;package=com.twitter.android;scheme=https;end;`;
        iosScheme = `twitter://${hostAndPath}`;
        break;
      default:
        platformName = 'Pagina Web / E-Commerce';
        break;
    }
  }

  return {
    androidIntent,
    androidChromeIntent,
    androidBrowserIntent,
    iosScheme,
    iosChromeScheme,
    platformName,
    fallback: cleanUrl,
  };
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.url || '';
  const query = req.query || {};

  // Extract slug
  let slug = (query.slug as string) || '';
  if (!slug) {
    const match = rawUrl.match(/\/l\/([a-zA-Z0-9_\-]+)/);
    if (match) slug = match[1];
  }

  // Handle API route: GET /api/links
  if (rawUrl.includes('/api/links') && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(LINKS_CACHE);
  }

  // Handle API route: POST /api/links
  if (rawUrl.includes('/api/links') && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body || {};
    const originalUrl = body.originalUrl;
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL mancante' });
    }

    const platform = detectPlatform(originalUrl);
    let finalSlug = body.slug || Math.random().toString(36).substring(2, 8);

    const newLink: DeepLink = {
      id: `link_${Date.now()}`,
      slug: finalSlug,
      originalUrl,
      platform,
      targetMode: body.targetMode || (platform === 'generic' ? 'system_browser' : 'smart'),
      title: body.title || 'Nuovo Deep Link',
      description: body.description || '',
      clicks: 0,
      stats: {
        iosClicks: 0,
        androidClicks: 0,
        desktopClicks: 0,
        inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
        appOpens: 0,
        browserEscapes: 0,
      },
    };

    LINKS_CACHE.unshift(newLink);
    return res.status(201).json(newLink);
  }

  // If a slug is requested, render the Deep Link Gateway
  if (slug) {
    // 1. Look in cache
    let link = LINKS_CACHE.find((l) => l.slug.toLowerCase() === slug.toLowerCase());

    // 2. Look in fallback query parameter ?u=... if passed
    if (!link && query.u) {
      const decodedOriginalUrl = decodeURIComponent(query.u as string);
      link = {
        id: 'param',
        slug,
        originalUrl: decodedOriginalUrl,
        platform: detectPlatform(decodedOriginalUrl),
        targetMode: 'smart',
        title: (query.title as string) || 'Reindirizzamento...',
        description: '',
        clicks: 0,
        stats: {
          iosClicks: 0,
          androidClicks: 0,
          desktopClicks: 0,
          inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
          appOpens: 0,
          browserEscapes: 0,
        },
      };
    }

    // 3. Look if slug encodes a base64 target (e.g. b_... or _)
    if (!link && (slug.startsWith('b_') || slug.startsWith('_'))) {
      try {
        const rawB64 = slug.startsWith('b_') ? slug.slice(2) : slug.slice(1);
        const decodedUrl = Buffer.from(rawB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
        if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
          link = {
            id: 'b64',
            slug,
            originalUrl: decodedUrl,
            platform: detectPlatform(decodedUrl),
            targetMode: 'smart',
            title: (query.title as string) || 'Reindirizzamento...',
            description: '',
            clicks: 0,
            stats: {
              iosClicks: 0,
              androidClicks: 0,
              desktopClicks: 0,
              inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
              appOpens: 0,
              browserEscapes: 0,
            },
          };
        }
      } catch {}
    }

    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Deep Link non trovato</title>
          <style>
            body { font-family: -apple-system, sans-serif; background: #090d16; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 24px; max-width: 440px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            a.btn { display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-top: 18px; font-weight: 600; font-size: 14px; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 style="color:#f87171; margin-bottom: 8px;">Link non trovato</h2>
            <p>Lo slug "<strong>${slug}</strong>" non è stato trovato.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Se hai appena creato questo link, assicurati di copiare l'URL generato dalla Dashboard DeepDirect.</p>
            <a href="/" class="btn">Apri la Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Inspect User-Agent
    const ua = (req.headers['user-agent'] as string) || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isTikTok = /TikTok|bytedance/i.test(ua);
    const isFacebook = /FBAN|FBAV/i.test(ua);
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isInApp = isInstagram || isTikTok || isFacebook || isWhatsApp || /Line|Twitter|Snapchat|LinkedIn/i.test(ua);

    link.clicks = (link.clicks || 0) + 1;
    if (isIOS) link.stats.iosClicks = (link.stats.iosClicks || 0) + 1;
    else if (isAndroid) link.stats.androidClicks = (link.stats.androidClicks || 0) + 1;
    else link.stats.desktopClicks = (link.stats.desktopClicks || 0) + 1;

    if (isInstagram) link.stats.inAppBreaks.instagram = (link.stats.inAppBreaks.instagram || 0) + 1;
    else if (isTikTok) link.stats.inAppBreaks.tiktok = (link.stats.inAppBreaks.tiktok || 0) + 1;
    else if (isFacebook) link.stats.inAppBreaks.facebook = (link.stats.inAppBreaks.facebook || 0) + 1;
    else if (isWhatsApp) link.stats.inAppBreaks.whatsapp = (link.stats.inAppBreaks.whatsapp || 0) + 1;
    else if (isInApp) link.stats.inAppBreaks.other = (link.stats.inAppBreaks.other || 0) + 1;

    // Desktop or standard mobile browser (not in-app) for generic websites: direct 302 redirect
    if (!isIOS && !isAndroid) {
      res.writeHead(302, { Location: link.originalUrl });
      return res.end();
    }
    if (!isInApp && (link.platform === 'generic' || link.targetMode === 'system_browser')) {
      res.writeHead(302, { Location: link.originalUrl });
      return res.end();
    }

    // Compute protocols
    const protocols = computeProtocols(link.originalUrl, link.platform, link.targetMode);
    const sanitizedTitle = (link.title || 'Reindirizzamento...').replace(/"/g, '&quot;');
    const isGenericWeb = link.platform === 'generic' || link.targetMode === 'system_browser';

    let hostAndPath = '';
    try {
      const parsed = new URL(protocols.fallback);
      hostAndPath = parsed.host + parsed.pathname + parsed.search;
    } catch {
      hostAndPath = protocols.fallback.replace(/^https?:\/\//, '');
    }

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${sanitizedTitle}</title>
  <meta property="og:title" content="${sanitizedTitle}">
  <meta property="og:description" content="Tocca per aprire nel browser esterno o nell’app ufficiale.">
  <meta name="robots" content="noindex, nofollow">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #94a3b8;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --accent: #38bdf8;
      --emerald: #10b981;
      --amber: #fbbf24;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px 16px;
      text-align: center;
      -webkit-font-smoothing: antialiased;
    }
    .insta-guide-banner {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      animation: pulseGuide 2s infinite ease-in-out;
    }
    .insta-guide-content {
      background: #1e1b4b;
      border: 1.5px solid #818cf8;
      border-radius: 9999px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 18px rgba(99,102,241,0.4);
    }
    .insta-guide-text {
      text-align: right;
      display: flex;
      flex-direction: column;
    }
    .insta-guide-text strong {
      font-size: 12px;
      color: var(--amber);
      line-height: 1.2;
    }
    .insta-guide-text span {
      font-size: 10px;
      color: #cbd5e1;
    }
    .insta-guide-arrow {
      font-size: 18px;
      font-weight: 900;
      color: var(--amber);
      line-height: 1;
    }
    @keyframes pulseGuide {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 30px 22px;
      max-width: 430px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
      position: relative;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: var(--accent);
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 18px;
    }
    .badge.warn {
      background: rgba(251, 191, 36, 0.12);
      border-color: rgba(251, 191, 36, 0.25);
      color: var(--amber);
    }
    .icon-hero {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: rgba(79, 70, 229, 0.15);
      border: 1.5px solid rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: #818cf8;
    }
    h2 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3; }
    p.desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px; word-break: break-word; }
    
    .steps-container {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 20px;
      text-align: left;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
    }
    .step-item:last-child { margin-bottom: 0; }
    .step-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #4f46e5;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .step-content {
      font-size: 13px;
      color: #e2e8f0;
      line-height: 1.4;
    }
    .step-content strong {
      color: #fbbf24;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 18px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
      transition: all 0.2s ease;
      margin-top: 10px;
      border: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }
    .btn-primary:active { transform: scale(0.98); }
    .btn-emerald {
      background: #059669;
      color: #fff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    .btn-emerald:active { transform: scale(0.98); }
    .btn-chrome {
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.16);
      font-size: 13.5px;
    }
    .btn-chrome:active { background: rgba(255, 255, 255, 0.14); }
    .btn-subtle {
      display: inline-block;
      margin-top: 16px;
      font-size: 12.5px;
      color: #64748b;
      text-decoration: underline;
      cursor: pointer;
      background: none;
      border: none;
    }
    .copy-success-banner {
      display: none;
      margin-top: 12px;
      padding: 10px 14px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 10px;
      font-size: 12px;
      color: #34d399;
      font-weight: 500;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>

  ${
    isInApp && isIOS && isGenericWeb
      ? `<div class="insta-guide-banner">
          <div class="insta-guide-content">
            <div class="insta-guide-text">
              <strong>Tocca i 3 puntini (···) in alto</strong>
              <span>per uscire da Instagram e aprire Safari</span>
            </div>
            <div class="insta-guide-arrow">↗</div>
          </div>
        </div>`
      : ''
  }

  <div class="card">
    <div class="badge ${isInApp ? 'warn' : ''}">
      ${
        isInApp
          ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Browser In-App Instagram Rilevato`
          : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> ${protocols.platformName}`
      }
    </div>

    ${
      isIOS && isInApp && isGenericWeb
        ? `<!-- Dedicato a iOS + In-App per Siti Generici / E-commerce -->
          <div class="icon-hero">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <h2>Apri questo link in Safari</h2>
          <p class="desc">Apple impedisce a Instagram di aprire Safari automaticamente. Per usare le tue password salvate e Apple Pay:</p>

          <div class="steps-container">
            <div class="step-item">
              <div class="step-badge">1</div>
              <div class="step-content">Tocca i <strong>3 puntini (···)</strong> in alto a destra sullo schermo di Instagram.</div>
            </div>
            <div class="step-item">
              <div class="step-badge">2</div>
              <div class="step-content">Seleziona <strong>"Apri nel browser esterno"</strong> o <strong>"Apri in Safari"</strong>.</div>
            </div>
          </div>

          <button id="copyBtn" class="btn btn-emerald">
            📋 Copia Link per Safari
          </button>
          <div id="copySuccess" class="copy-success-banner">
            ✓ Link copiato negli appunti! Ora apri Safari e incolla.
          </div>

          <button id="chromeIosBtn" class="btn btn-chrome">
            🌐 Hai Google Chrome? Tocca per aprire in Chrome
          </button>

          <a href="${protocols.fallback}" class="btn-subtle">
            Oppure continua qui nel browser interno di Instagram &rarr;
          </a>`
        : isAndroid
        ? `<!-- Dedicato ad Android (Supporta Chrome Intent) -->
          <div class="icon-hero">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </div>
          <h2>${isInApp ? 'Apri fuori da Instagram' : 'Pronto per l’apertura'}</h2>
          <p class="desc">${sanitizedTitle}</p>

          <button id="androidPrimaryBtn" class="btn btn-primary">
            ${
              link.targetMode === 'native_app' && link.platform !== 'generic'
                ? `🚀 Apri nell'App Ufficiale (${protocols.platformName})`
                : '🚀 Apri in Google Chrome'
            }
          </button>

          <button id="copyBtn" class="btn btn-chrome">
            📋 Copia Link
          </button>
          <div id="copySuccess" class="copy-success-banner">
            ✓ Link copiato negli appunti!
          </div>

          <a href="${protocols.fallback}" class="btn-subtle">
            Continua nel browser interno &rarr;
          </a>`
        : `<!-- iOS con App Nativa (Amazon, YouTube, Spotify) o Standard Mobile -->
          <div class="icon-hero">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
          <h2>Apri nell’App Ufficiale</h2>
          <p class="desc">${sanitizedTitle}</p>

          <button id="nativeAppBtn" class="btn btn-primary">
            🚀 Apri in ${protocols.platformName}
          </button>

          <button id="copyBtn" class="btn btn-chrome">
            📋 Copia Link
          </button>
          <div id="copySuccess" class="copy-success-banner">
            ✓ Link copiato negli appunti!
          </div>

          <a href="${protocols.fallback}" class="btn-subtle">
            Oppure apri nel browser &rarr;
          </a>`
    }
  </div>

  <script>
    (function() {
      var isAndroid = ${isAndroid};
      var isIOS = ${isIOS};
      var isInApp = ${isInApp};
      var isGenericWeb = ${isGenericWeb};
      var platform = ${JSON.stringify(link.platform)};
      var androidIntent = ${JSON.stringify(protocols.androidIntent)};
      var androidBrowserIntent = ${JSON.stringify(protocols.androidBrowserIntent)};
      var iosScheme = ${JSON.stringify(protocols.iosScheme)};
      var iosChromeScheme = ${JSON.stringify(protocols.iosChromeScheme || '')};
      var fallback = ${JSON.stringify(protocols.fallback)};
      var hostAndPath = ${JSON.stringify(hostAndPath)};

      // 1. Android Breakout Execution
      var androidPrimaryBtn = document.getElementById('androidPrimaryBtn');
      if (androidPrimaryBtn) {
        androidPrimaryBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = androidIntent;
          setTimeout(function() {
            window.location.href = androidBrowserIntent;
          }, 600);
        });

        // If in-app on Android, attempt intent automatically
        if (isInApp) {
          setTimeout(function() {
            window.location.href = androidIntent;
          }, 250);
        }
      }

      // 2. iOS Native App Launcher (Amazon, YouTube, Spotify)
      var nativeAppBtn = document.getElementById('nativeAppBtn');
      if (nativeAppBtn) {
        nativeAppBtn.addEventListener('click', function(e) {
          e.preventDefault();
          if (platform === 'amazon') {
            window.location.href = 'com.amazon.mobile.shopping://' + hostAndPath;
            setTimeout(function() {
              window.location.href = 'amazon://' + hostAndPath;
            }, 300);
          } else {
            window.location.href = iosScheme;
          }
        });
      }

      // 3. iOS Chrome Button
      var chromeIosBtn = document.getElementById('chromeIosBtn');
      if (chromeIosBtn) {
        chromeIosBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = 'googlechromes://' + hostAndPath;
          setTimeout(function() {
            window.location.href = 'googlechrome://' + hostAndPath;
          }, 350);
        });
      }

      // 4. Clipboard Copy Button
      var copyBtn = document.getElementById('copyBtn');
      var copySuccess = document.getElementById('copySuccess');
      if (copyBtn) {
        copyBtn.addEventListener('click', function(e) {
          e.preventDefault();
          function showSuccess() {
            if (copySuccess) copySuccess.style.display = 'block';
            copyBtn.innerHTML = '✓ Link Copiato!';
            setTimeout(function() {
              if (copySuccess) copySuccess.style.display = 'none';
              copyBtn.innerHTML = isIOS && isGenericWeb ? '📋 Copia Link per Safari' : '📋 Copia Link';
            }, 4000);
          }

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fallback).then(showSuccess).catch(fallbackCopy);
          } else {
            fallbackCopy();
          }

          function fallbackCopy() {
            var inp = document.createElement('input');
            inp.setAttribute('value', fallback);
            document.body.appendChild(inp);
            inp.select();
            document.execCommand('copy');
            document.body.removeChild(inp);
            showSuccess();
          }
        });
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // Default response
  return res.status(200).send('DeepDirect API Online');
}
