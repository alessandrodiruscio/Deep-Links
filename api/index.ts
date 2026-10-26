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
        iosScheme = `com.amazon.mobile.shopping.web://${hostAndPath}`;
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
    const isInApp = /Instagram|TikTok|FBAN|FBAV|Twitter|Line/i.test(ua);

    link.clicks = (link.clicks || 0) + 1;
    const { androidIntent, iosScheme } = computeProtocols(link.originalUrl, link.platform, link.targetMode);

    // Desktop: direct redirect
    if (!isIOS && !isAndroid) {
      res.writeHead(302, { Location: link.originalUrl });
      return res.end();
    }

    // Mobile Gateway HTML
    const protocols = computeProtocols(link.originalUrl, link.platform, link.targetMode);
    const sanitizedTitle = (link.title || 'Reindirizzamento...').replace(/"/g, '&quot;');
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
      --accent: #38bdf8;
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
      top: 14px;
      right: 14px;
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
      color: #fbbf24;
      line-height: 1.2;
    }
    .insta-guide-text span {
      font-size: 10px;
      color: #cbd5e1;
    }
    .insta-guide-arrow {
      font-size: 18px;
      font-weight: 900;
      color: #fbbf24;
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
      padding: 32px 24px;
      max-width: 420px;
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
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    .success-ring {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    p.desc { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 22px; word-break: break-word; }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 20px;
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
    .btn-copy {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn-copy:active { background: rgba(255,255,255,0.1); }
    .btn-subtle {
      display: inline-block;
      margin-top: 14px;
      font-size: 13px;
      color: #64748b;
      text-decoration: none;
    }
    .guide-box {
      margin-top: 22px;
      background: rgba(251, 191, 36, 0.08);
      border: 1px dashed rgba(251, 191, 36, 0.3);
      border-radius: 12px;
      padding: 14px;
      text-align: left;
    }
    .guide-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: #fbbf24;
      margin-bottom: 6px;
    }
    .guide-desc {
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  ${
    isInApp && isIOS
      ? `<div class="insta-guide-banner">
          <div class="insta-guide-content">
            <div class="insta-guide-text">
              <strong>Tocca i 3 puntini (···) in alto</strong>
              <span>per aprire in Safari</span>
            </div>
            <div class="insta-guide-arrow">↗</div>
          </div>
        </div>`
      : ''
  }

  <div class="card">
    <div class="badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      ${protocols.platformName}
    </div>

    <div id="loadingBlock">
      <div class="spinner"></div>
      <h2>Apertura in corso...</h2>
      <p class="desc">${sanitizedTitle}</p>
    </div>

    <div id="actionBlock" style="display: none;">
      <div class="success-ring">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2>${isInApp ? 'Continua fuori da Instagram' : 'Pronto per l’apertura'}</h2>
      <p class="desc">${sanitizedTitle}</p>
    </div>

    <button id="primaryBtn" class="btn btn-primary">
      ${
        isAndroid
          ? (link.targetMode === 'native_app' && link.platform !== 'generic' ? '🚀 Apri nell’App Ufficiale' : '🚀 Apri in Google Chrome')
          : (link.targetMode === 'native_app' && link.platform !== 'generic' ? '🚀 Apri nell’App Ufficiale' : '🚀 Apri Subito')
      }
    </button>

    <button id="copyBtn" class="btn btn-copy">
      📋 Copia Link per Safari
    </button>

    <a href="${protocols.fallback}" class="btn-subtle">
      Continua nel browser interno di Instagram
    </a>

    ${
      isInApp
        ? `<div class="guide-box">
            <div class="guide-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Come aprire nel browser esterno:
            </div>
            <p class="guide-desc">
              ${
                isIOS
                  ? 'Tocca i <strong>3 puntini (···)</strong> in alto a destra su Instagram e premi <strong>"Apri nel browser"</strong> o <strong>"Apri in Safari"</strong>.'
                  : 'Se la pagina non si apre automaticamente, tocca il pulsante blu in alto per aprire Google Chrome.'
              }
            </p>
          </div>`
        : ''
    }
  </div>

  <script>
    (function() {
      var isAndroid = ${isAndroid};
      var isIOS = ${isIOS};
      var isInApp = ${isInApp};
      var platform = ${JSON.stringify(link.platform)};
      var targetMode = ${JSON.stringify(link.targetMode)};
      var androidIntent = ${JSON.stringify(protocols.androidIntent)};
      var androidBrowserIntent = ${JSON.stringify(protocols.androidBrowserIntent)};
      var iosScheme = ${JSON.stringify(protocols.iosScheme)};
      var fallback = ${JSON.stringify(protocols.fallback)};

      var loadingBlock = document.getElementById('loadingBlock');
      var actionBlock = document.getElementById('actionBlock');
      var primaryBtn = document.getElementById('primaryBtn');
      var copyBtn = document.getElementById('copyBtn');

      function performRedirect() {
        if (isAndroid) {
          window.location.href = androidIntent;
        } else if (isIOS && platform !== 'generic' && targetMode !== 'system_browser') {
          window.location.href = iosScheme;
        }
      }

      // 1. Initial attempt
      performRedirect();

      // 2. STOP SPINNER AFTER 1.1 SECONDS:
      // Eliminates the infinite loading screen loop
      setTimeout(function() {
        if (loadingBlock) loadingBlock.style.display = 'none';
        if (actionBlock) actionBlock.style.display = 'block';
      }, 1100);

      // 3. Primary Button Click: breakout to Chrome or App
      primaryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (isAndroid) {
          window.location.href = androidIntent;
          setTimeout(function() {
            window.location.href = androidBrowserIntent;
          }, 600);
        } else if (isIOS) {
          if (platform !== 'generic' && targetMode !== 'system_browser') {
            window.location.href = iosScheme;
          } else {
            window.location.href = fallback;
          }
        } else {
          window.location.href = fallback;
        }
      });

      // 4. Clipboard Copy Button
      copyBtn.addEventListener('click', function() {
        function onCopied() {
          copyBtn.style.background = '#059669';
          copyBtn.style.borderColor = '#10b981';
          copyBtn.innerHTML = '✓ Link Copiato! Incollalo in Safari';
          setTimeout(function() {
            copyBtn.style.background = '';
            copyBtn.style.borderColor = '';
            copyBtn.innerHTML = '📋 Copia Link per Safari';
          }, 3500);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fallback).then(onCopied).catch(fallbackExecCopy);
        } else {
          fallbackExecCopy();
        }

        function fallbackExecCopy() {
          var input = document.createElement('input');
          input.setAttribute('value', fallback);
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          onCopied();
        }
      });
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
