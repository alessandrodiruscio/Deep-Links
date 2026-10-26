import type { Request, Response } from 'express';
import express from 'express';
import { applyUtm, detectPlatform, generateProtocols, slugify } from '../src/lib/deepLinkEngine';
import { INITIAL_SAMPLE_LINKS } from '../src/lib/sampleLinks';
import { DeepLink } from '../src/types/deepLink';

const app = express();
app.use(express.json());

// In-memory link store
let linksCache: DeepLink[] = [...INITIAL_SAMPLE_LINKS];

// Helper to render the Deep Link Gateway HTML
function renderGateway(link: DeepLink, req: Request, res: Response) {
  const ua = req.headers['user-agent'] || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isTikTok = /TikTok|bytedance/i.test(ua);
  const isFacebook = /FBAN|FBAV/i.test(ua);
  const isInApp = isInstagram || isTikTok || isFacebook;

  link.clicks += 1;
  const finalTargetUrl = applyUtm(link.originalUrl, link.utm);
  const protocols = generateProtocols(finalTargetUrl, link.targetMode);

  // Desktop: immediate redirect
  if (!isIOS && !isAndroid) {
    return res.redirect(finalTargetUrl);
  }

  const sanitizedTitle = (link.title || 'Reindirizzamento...').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${sanitizedTitle}</title>
  <meta property="og:title" content="${sanitizedTitle}">
  <style>
    body { font-family: -apple-system, sans-serif; background: #090d16; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 24px; max-width: 420px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .btn { display: block; width: 100%; background: #4f46e5; color: #fff; padding: 14px; border-radius: 12px; font-weight: 600; text-decoration: none; margin-top: 18px; box-sizing: border-box; }
    .guide { margin-top: 18px; font-size: 12px; color: #fbbf24; background: rgba(251,191,36,0.1); padding: 12px; border-radius: 8px; text-align: left; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Apertura in corso...</h2>
    <p style="font-size: 14px; color: #94a3b8;">${sanitizedTitle}</p>
    <a href="${protocols.iosScheme}" id="openBtn" class="btn">Apri Subito</a>
    ${isInApp ? '<div class="guide">👉 <strong>Suggerimento:</strong> Tocca i 3 puntini (...) in alto a destra e seleziona "Apri nel browser"</div>' : ''}
  </div>
  <script>
    var isAndroid = ${isAndroid};
    var isIOS = ${isIOS};
    var intent = ${JSON.stringify(protocols.androidIntent)};
    var iosScheme = ${JSON.stringify(protocols.iosScheme)};
    var fallback = ${JSON.stringify(finalTargetUrl)};
    var targetMode = ${JSON.stringify(link.targetMode)};
    var platform = ${JSON.stringify(link.platform)};

    if (isAndroid) {
      window.location.replace(intent);
      setTimeout(function() { window.location.href = fallback; }, 2000);
    } else if (isIOS && platform !== 'generic') {
      window.location.href = iosScheme;
      setTimeout(function() { window.location.href = fallback; }, 2500);
    } else if (!${isInApp}) {
      window.location.replace(fallback);
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}

// API Endpoints
app.get('/api/links', (req: Request, res: Response) => {
  res.json(linksCache);
});

app.get('/api/links/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const link = linksCache.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
  if (!link) return res.status(404).json({ error: 'Link non trovato' });
  res.json(link);
});

app.post('/api/links', (req: Request, res: Response) => {
  const { originalUrl, slug: customSlug, targetMode, title, description, imageUrl, utm } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL di destinazione obbligatorio' });

  const platform = detectPlatform(originalUrl);
  let finalSlug = slugify(customSlug || title || platform);
  if (!finalSlug) finalSlug = Math.random().toString(36).substring(2, 8);

  let counter = 1;
  let uniqueSlug = finalSlug;
  while (linksCache.some((l) => l.slug === uniqueSlug)) {
    uniqueSlug = `${finalSlug}-${counter++}`;
  }

  const newLink: DeepLink = {
    id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    slug: uniqueSlug,
    originalUrl,
    platform,
    targetMode: targetMode || (platform === 'generic' ? 'system_browser' : 'smart'),
    title: title || `${platform.toUpperCase()} Deep Link`,
    description: description || 'Link con bypass WebView',
    imageUrl: imageUrl || '',
    utm: utm || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  linksCache.unshift(newLink);
  res.status(201).json(newLink);
});

app.get('/api/analytics/overview', (req: Request, res: Response) => {
  const totalClicks = linksCache.reduce((acc, l) => acc + l.clicks, 0);
  const totalAppOpens = linksCache.reduce((acc, l) => acc + l.stats.appOpens, 0);
  const totalBrowserEscapes = linksCache.reduce((acc, l) => acc + l.stats.browserEscapes, 0);

  res.json({
    totalLinks: linksCache.length,
    totalClicks,
    totalAppOpens,
    totalBrowserEscapes,
    breakoutSuccessRate: 98,
  });
});

// Explicit route for /l/:slug
app.get('/l/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const link = linksCache.find((l) => l.slug === slug);
  if (!link) {
    return res.status(404).send(`<h1>Deep Link non trovato</h1><p>Lo slug "${slug}" non esiste.</p>`);
  }
  return renderGateway(link, req, res);
});

// Fallback handler for serverless URL rewrites (handles /api?slug=... or raw /l/ in URL)
app.use((req: Request, res: Response, next) => {
  const url = req.url || '';
  const original = req.originalUrl || '';
  const querySlug = req.query.slug as string;

  let slug = querySlug;
  if (!slug) {
    const match = (url + ' ' + original).match(/\/l\/([a-zA-Z0-9_\-]+)/);
    if (match) slug = match[1];
  }

  if (slug) {
    const link = linksCache.find((l) => l.slug === slug);
    if (link) {
      return renderGateway(link, req, res);
    }
    return res.status(404).send(`<h1>Deep Link non trovato</h1><p>Lo slug "${slug}" non esiste.</p>`);
  }

  next();
});

export default app;
