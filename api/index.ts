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
  let hostAndPath = url.replace(/^https?:\/\//, '');

  let androidIntent = `intent://${hostAndPath}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;`;
  let iosScheme = url;

  if (mode !== 'system_browser') {
    switch (platform) {
      case 'amazon':
        androidIntent = `intent://${hostAndPath}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;end;`;
        iosScheme = `com.amazon.mobile.shopping.web://${hostAndPath}`;
        break;
      case 'youtube':
        androidIntent = `intent://${hostAndPath}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        iosScheme = `vnd.youtube://${hostAndPath}`;
        break;
      case 'spotify':
        androidIntent = `intent://${hostAndPath}#Intent;package=com.spotify.music;scheme=https;end;`;
        const spotMatch = url.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
        iosScheme = spotMatch ? `spotify:${spotMatch[1]}:${spotMatch[2]}` : `spotify://${hostAndPath}`;
        break;
      case 'instagram':
        androidIntent = `intent://${hostAndPath}#Intent;package=com.instagram.android;scheme=https;end;`;
        const cleanPath = url.replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, '').replace(/\/$/, '');
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
        androidIntent = `intent://${hostAndPath}#Intent;package=com.zhiliaoapp.musically;scheme=https;end;`;
        iosScheme = `snssdk1233://${hostAndPath}`;
        break;
    }
  }

  return { androidIntent, iosScheme };
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
    return res.status(200).json(LINKS_CACHE);
  }

  // Handle API route: POST /api/links
  if (rawUrl.includes('/api/links') && req.method === 'POST') {
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
      targetMode: body.targetMode || 'smart',
      title: body.title || 'Nuovo Deep Link',
      description: body.description || '',
      clicks: 0,
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
      link = {
        id: 'param',
        slug,
        originalUrl: decodeURIComponent(query.u as string),
        platform: detectPlatform(query.u as string),
        targetMode: 'smart',
        title: (query.title as string) || 'Reindirizzamento...',
        description: '',
        clicks: 0,
      };
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
            .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 24px; max-width: 400px; }
            a { display: inline-block; background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 style="color:#f87171;">Link non trovato</h2>
            <p style="color:#94a3b8; font-size:14px; margin-top:8px;">Lo slug "${slug}" non è stato trovato.</p>
            <a href="/">Apri la Dashboard</a>
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
    const sanitizedTitle = link.title.replace(/"/g, '&quot;');
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${sanitizedTitle}</title>
  <meta property="og:title" content="${sanitizedTitle}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 24px; max-width: 420px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .btn { display: block; width: 100%; background: #4f46e5; color: #fff; padding: 14px; border-radius: 12px; font-weight: 600; text-decoration: none; margin-top: 18px; box-sizing: border-box; }
    .guide { margin-top: 18px; font-size: 12px; color: #fbbf24; background: rgba(251,191,36,0.1); padding: 12px; border-radius: 8px; text-align: left; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Apertura in corso...</h2>
    <p style="font-size: 14px; color: #94a3b8; margin-top: 6px;">${sanitizedTitle}</p>
    <a href="${iosScheme}" id="openBtn" class="btn">Apri Subito</a>
    <a href="${link.originalUrl}" style="display:inline-block; margin-top:12px; font-size:12px; color:#64748b; text-decoration:none;">Continua via web</a>
    ${isInApp ? '<div class="guide">👉 <strong>Suggerimento:</strong> Se la pagina non si apre, tocca i 3 puntini (...) in alto a destra e seleziona "Apri nel browser"</div>' : ''}
  </div>
  <script>
    var isAndroid = ${isAndroid};
    var isIOS = ${isIOS};
    var intent = ${JSON.stringify(androidIntent)};
    var iosScheme = ${JSON.stringify(iosScheme)};
    var fallback = ${JSON.stringify(link.originalUrl)};
    var platform = ${JSON.stringify(link.platform)};

    function doRedirect() {
      if (isAndroid) {
        window.location.replace(intent);
        setTimeout(function() { window.location.href = fallback; }, 2000);
      } else if (isIOS && platform !== 'generic') {
        window.location.href = iosScheme;
        setTimeout(function() { window.location.href = fallback; }, 2500);
      } else if (!${isInApp}) {
        window.location.replace(fallback);
      }
    }
    setTimeout(doRedirect, 150);
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // Default response
  return res.status(200).send('DeepDirect API Online');
}
