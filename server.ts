import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyUtm, detectPlatform, generateProtocols, slugify } from './src/lib/deepLinkEngine';
import { INITIAL_SAMPLE_LINKS } from './src/lib/sampleLinks';
import { DeepLink } from './src/types/deepLink';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'links.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadLinks(): DeepLink[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading links data:', err);
  }
  // Fallback to sample links
  saveLinks(INITIAL_SAMPLE_LINKS);
  return INITIAL_SAMPLE_LINKS;
}

function saveLinks(links: DeepLink[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving links data:', err);
  }
}

let linksCache: DeepLink[] = loadLinks();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // -------------------------------------------------------------
  // API Endpoints
  // -------------------------------------------------------------

  // List all deep links
  app.get('/api/links', (req: Request, res: Response) => {
    res.json(linksCache);
  });

  // Get single link
  app.get('/api/links/:idOrSlug', (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    const link = linksCache.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
    if (!link) {
      return res.status(404).json({ error: 'Link non trovato' });
    }
    res.json(link);
  });

  // Create deep link
  app.post('/api/links', (req: Request, res: Response) => {
    const { originalUrl, slug: customSlug, targetMode, title, description, imageUrl, utm } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL di destinazione obbligatorio' });
    }

    const platform = detectPlatform(originalUrl);
    let finalSlug = slugify(customSlug || title || platform);
    if (!finalSlug) finalSlug = Math.random().toString(36).substring(2, 8);

    // Ensure slug uniqueness
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
      description:
        description ||
        'Link ottimizzato con bypass automatico di WebView e apertura nell’app nativa o browser di sistema.',
      imageUrl: imageUrl || '',
      utm: utm || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clicks: 0,
      stats: {
        iosClicks: 0,
        androidClicks: 0,
        desktopClicks: 0,
        inAppBreaks: {
          instagram: 0,
          tiktok: 0,
          facebook: 0,
          whatsapp: 0,
          other: 0,
        },
        appOpens: 0,
        browserEscapes: 0,
      },
    };

    linksCache.unshift(newLink);
    saveLinks(linksCache);
    res.status(201).json(newLink);
  });

  // Update deep link
  app.put('/api/links/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = linksCache.findIndex((l) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Link non trovato' });
    }

    const { originalUrl, slug, targetMode, title, description, imageUrl, utm } = req.body;

    const existing = linksCache[index];
    const platform = originalUrl ? detectPlatform(originalUrl) : existing.platform;

    // Check slug collision
    if (slug && slug !== existing.slug) {
      const collision = linksCache.some((l) => l.id !== id && l.slug === slug);
      if (collision) {
        return res.status(400).json({ error: 'Questo slug è già in uso' });
      }
    }

    const updated: DeepLink = {
      ...existing,
      originalUrl: originalUrl || existing.originalUrl,
      slug: slug || existing.slug,
      platform,
      targetMode: targetMode || existing.targetMode,
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      utm: utm !== undefined ? utm : existing.utm,
      updatedAt: new Date().toISOString(),
    };

    linksCache[index] = updated;
    saveLinks(linksCache);
    res.json(updated);
  });

  // Delete deep link
  app.delete('/api/links/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    linksCache = linksCache.filter((l) => l.id !== id);
    saveLinks(linksCache);
    res.json({ success: true });
  });

  // Analytics overview
  app.get('/api/analytics/overview', (req: Request, res: Response) => {
    const totalClicks = linksCache.reduce((acc, l) => acc + l.clicks, 0);
    const totalAppOpens = linksCache.reduce((acc, l) => acc + l.stats.appOpens, 0);
    const totalBrowserEscapes = linksCache.reduce((acc, l) => acc + l.stats.browserEscapes, 0);
    const totalIos = linksCache.reduce((acc, l) => acc + l.stats.iosClicks, 0);
    const totalAndroid = linksCache.reduce((acc, l) => acc + l.stats.androidClicks, 0);
    const totalDesktop = linksCache.reduce((acc, l) => acc + l.stats.desktopClicks, 0);

    const inAppSources = {
      instagram: linksCache.reduce((acc, l) => acc + (l.stats.inAppBreaks.instagram || 0), 0),
      tiktok: linksCache.reduce((acc, l) => acc + (l.stats.inAppBreaks.tiktok || 0), 0),
      facebook: linksCache.reduce((acc, l) => acc + (l.stats.inAppBreaks.facebook || 0), 0),
      whatsapp: linksCache.reduce((acc, l) => acc + (l.stats.inAppBreaks.whatsapp || 0), 0),
      other: linksCache.reduce((acc, l) => acc + (l.stats.inAppBreaks.other || 0), 0),
    };

    const breakoutSuccessRate =
      totalClicks > 0
        ? Math.round(((totalAppOpens + totalBrowserEscapes) / totalClicks) * 100)
        : 100;

    res.json({
      totalLinks: linksCache.length,
      totalClicks,
      totalAppOpens,
      totalBrowserEscapes,
      breakoutSuccessRate,
      devices: {
        ios: totalIos,
        android: totalAndroid,
        desktop: totalDesktop,
      },
      inAppSources,
    });
  });

  // -------------------------------------------------------------
  // THE DEEP LINK REDIRECTOR / GATEWAY: /l/:slug
  // -------------------------------------------------------------
  app.get('/l/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const link = linksCache.find((l) => l.slug === slug);

    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Link non trovato | DeepDirect</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 420px; text-align: center; }
            h1 { font-size: 20px; margin-bottom: 8px; color: #f87171; }
            p { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
            a { display: inline-block; background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Deep Link non trovato</h1>
            <p>Il link richiesto "<strong>${slug}</strong>" non esiste o è stato rimosso.</p>
            <a href="/">Torna alla Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Inspect User-Agent
    const ua = req.headers['user-agent'] || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isTikTok = /TikTok|bytedance/i.test(ua);
    const isFacebook = /FBAN|FBAV/i.test(ua);
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isInApp = isInstagram || isTikTok || isFacebook || isWhatsApp || /Line|Twitter|Snapchat|LinkedIn/i.test(ua);

    // Track analytics
    link.clicks += 1;
    if (isIOS) link.stats.iosClicks += 1;
    else if (isAndroid) link.stats.androidClicks += 1;
    else link.stats.desktopClicks += 1;

    if (isInstagram) link.stats.inAppBreaks.instagram += 1;
    else if (isTikTok) link.stats.inAppBreaks.tiktok += 1;
    else if (isFacebook) link.stats.inAppBreaks.facebook += 1;
    else if (isWhatsApp) link.stats.inAppBreaks.whatsapp += 1;
    else if (isInApp) link.stats.inAppBreaks.other += 1;

    if (link.targetMode === 'native_app' && link.platform !== 'generic') {
      link.stats.appOpens += 1;
    } else {
      link.stats.browserEscapes += 1;
    }
    saveLinks(linksCache);

    const finalTargetUrl = applyUtm(link.originalUrl, link.utm);
    const protocols = generateProtocols(finalTargetUrl, link.targetMode);

    // If opened on Desktop browser, OR on standard mobile browser (not in-app) for generic websites: direct redirect
    if (!isIOS && !isAndroid) {
      return res.redirect(finalTargetUrl);
    }
    if (!isInApp && (link.platform === 'generic' || link.targetMode === 'system_browser')) {
      return res.redirect(finalTargetUrl);
    }

    // Prepare Smart Gateway HTML
    const sanitizedTitle = (link.title || 'Reindirizzamento...').replace(/"/g, '&quot;');
    const sanitizedDesc = (link.description || '').replace(/"/g, '&quot;');
    const sanitizedImg = (link.imageUrl || '').replace(/"/g, '&quot;');
    const isApp = protocols.platform !== 'generic';
    const primaryTarget = isAndroid
      ? protocols.androidIntent
      : (isApp ? protocols.iosScheme : protocols.webFallback);

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta http-equiv="refresh" content="0; url=${primaryTarget}">
  <title>Apertura in corso...</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f1f5f9;
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
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 28px;
      padding: 36px 24px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .icon-container {
      position: relative;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
    }
    .pulse-ring {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid #6366f1;
      opacity: 0.4;
      animation: pulse 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite;
    }
    .icon-box {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      background: #1e1b4b;
      border: 1.5px solid rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #818cf8;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
    }
    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(1.35); opacity: 0; }
    }
    h2 {
      font-size: 21px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    p.desc {
      font-size: 13.5px;
      color: #94a3b8;
      line-height: 1.4;
      margin-bottom: 24px;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #1e293b;
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .progress-fill {
      width: 40%;
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #38bdf8);
      border-radius: 9999px;
      animation: progressAnim 1.2s ease-in-out infinite alternate;
    }
    @keyframes progressAnim {
      0% { transform: translateX(-10%); width: 30%; }
      100% { transform: translateX(200%); width: 60%; }
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 15px 22px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
      transition: all 0.2s ease;
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
      border: none;
    }
    .btn:active {
      transform: scale(0.98);
      background: #4338ca;
    }
    .subtext {
      margin-top: 14px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-container">
      <div class="pulse-ring"></div>
      <div class="icon-box">
        ${
          link.platform === 'youtube'
            ? `<svg width="34" height="34" viewBox="0 0 24 24" fill="#ef4444"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
            : link.platform === 'amazon'
            ? `<svg width="34" height="34" viewBox="0 0 24 24" fill="#f59e0b"><path d="M13.9 14.1c-1.8 1.4-4.3 2.1-6.6 2.1-3.1 0-5.9-1.2-8-3.2-.2-.2-.2-.5 0-.7.3-.2.6-.2.8 0 1.9 1.8 4.4 2.8 7.2 2.8 2 0 4.2-.6 5.8-1.8.3-.2.7-.1.9.2.2.3.1.7-.1.8zm2.4-1c-.2-.3-.5-.4-.8-.2-.3.2-.4.5-.2.8.4.8.6 1.7.6 2.6 0 .4-.3.7-.7.7s-.7-.3-.7-.7c0-1.2-.3-2.3-.9-3.3-.2-.3-.1-.7.2-.9.3-.2.7-.1.9.2.7 1.2 1.1 2.6 1.1 4 0 .9-.7 1.7-1.7 1.7s-1.7-.7-1.7-1.7c0-.8-.2-1.6-.5-2.3z"/></svg>`
            : link.platform === 'spotify'
            ? `<svg width="34" height="34" viewBox="0 0 24 24" fill="#10b981"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`
            : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
        }
      </div>
    </div>

    <h2>Apertura di ${protocols.platformName}...</h2>
    <p class="desc">${sanitizedTitle}</p>

    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>

    <a href="${primaryTarget}" id="launchBtn" class="btn">
      Apri Subito &rarr;
    </a>
    <span class="subtext">Reindirizzamento istantaneo automatico...</span>
  </div>

  <script>
    (function() {
      var targetUrl = ${JSON.stringify(primaryTarget)};
      var fallbackUrl = ${JSON.stringify(protocols.webFallback)};
      var isApp = ${Boolean(isApp)};

      // 1. Immediate trigger via replace & href
      try {
        window.location.replace(targetUrl);
      } catch (e) {
        window.location.href = targetUrl;
      }

      // 2. Programmatic click on button
      var btn = document.getElementById('launchBtn');
      if (btn && typeof btn.click === 'function') {
        try { btn.click(); } catch (e) {}
      }

      // 3. Fallback timer: if app is not installed, transition smoothly to web
      if (isApp) {
        setTimeout(function() {
          try {
            window.location.replace(fallbackUrl);
          } catch (e) {
            window.location.href = fallbackUrl;
          }
        }, 2200);
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev) or Static Serving (Prod)
  // -------------------------------------------------------------
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`DeepDirect Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
