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

    // If opened on Desktop browser (non-mobile and non-in-app), immediate redirect
    if (!isIOS && !isAndroid) {
      return res.redirect(finalTargetUrl);
    }

    // Prepare Smart Gateway HTML
    const sanitizedTitle = (link.title || 'Reindirizzamento in corso...').replace(/"/g, '&quot;');
    const sanitizedDesc = (link.description || '').replace(/"/g, '&quot;');
    const sanitizedImg = (link.imageUrl || '').replace(/"/g, '&quot;');

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${sanitizedTitle}</title>
  <meta name="description" content="${sanitizedDesc}">
  <meta property="og:title" content="${sanitizedTitle}">
  <meta property="og:description" content="${sanitizedDesc}">
  ${sanitizedImg ? `<meta property="og:image" content="${sanitizedImg}">` : ''}
  <meta property="og:url" content="${finalTargetUrl}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="robots" content="noindex, nofollow">

  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --accent: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      width: 100%;
      max-width: 440px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.7);
      position: relative;
      overflow: hidden;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1.35;
      margin-bottom: 10px;
    }
    p.desc {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 22px;
    }
    .cta-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 14px 20px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s ease;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }
    .cta-button:active {
      transform: scale(0.98);
    }
    .secondary-btn {
      display: block;
      margin-top: 12px;
      font-size: 13px;
      color: var(--text-muted);
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px;
      width: 100%;
      cursor: pointer;
      text-decoration: none;
    }
    .instructions-box {
      margin-top: 24px;
      background: rgba(255,255,255,0.03);
      border: 1px dashed rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 16px;
      text-align: left;
    }
    .instructions-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #fbbf24;
      margin-bottom: 8px;
    }
    .instructions-text {
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    .arrow-pointer {
      position: absolute;
      top: 14px;
      right: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: bounce 1.2s infinite ease-in-out;
      pointer-events: none;
    }
    .arrow-pointer span {
      font-size: 11px;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(0,0,0,0.85);
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .arrow-pointer svg {
      width: 20px;
      height: 20px;
      color: #fbbf24;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .footer-note {
      margin-top: 18px;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  ${
    isInApp && isIOS
      ? `
    <div class="arrow-pointer">
      <span>Tocca i 3 puntini (...)</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </div>
  `
      : ''
  }

  <div class="container">
    <div class="badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      ${protocols.platformName}
    </div>

    <div class="spinner"></div>

    <h1>Apertura in corso...</h1>
    <p class="desc">${sanitizedTitle}</p>

    <a id="openButton" href="${protocols.iosScheme}" class="cta-button">
      ${
        link.targetMode === 'native_app' && link.platform !== 'generic'
          ? 'Apri nell’App Ufficiale'
          : 'Apri nel Browser di Sistema (Safari/Chrome)'
      }
    </a>

    <a id="fallbackButton" href="${finalTargetUrl}" class="secondary-btn">
      Continua nel browser web
    </a>

    ${
      isInApp
        ? `
      <div class="instructions-box">
        <div class="instructions-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Per la migliore esperienza:
        </div>
        <p class="instructions-text">
          ${
            isIOS
              ? 'Tocca i <strong>3 puntini (...)</strong> in alto a destra su Instagram/Facebook e seleziona <strong>"Apri nel browser"</strong> o <strong>"Apri in Safari"</strong>.'
              : 'Se la pagina non si apre da sola, tocca il pulsante blu in alto per forzare l’apertura in Chrome.'
          }
        </p>
      </div>
    `
        : ''
    }

    <p class="footer-note">Deep link generato con DeepDirect</p>
  </div>

  <script>
    (function() {
      var isIOS = ${isIOS};
      var isAndroid = ${isAndroid};
      var isInApp = ${isInApp};
      var androidIntent = ${JSON.stringify(protocols.androidIntent)};
      var iosScheme = ${JSON.stringify(protocols.iosScheme)};
      var webFallback = ${JSON.stringify(finalTargetUrl)};
      var targetMode = ${JSON.stringify(link.targetMode)};
      var platform = ${JSON.stringify(link.platform)};

      var btn = document.getElementById('openButton');

      function triggerRedirect() {
        if (isAndroid) {
          // On Android, directly invoke the Android Intent
          // This breaks out of Instagram/TikTok/Facebook WebView into Chrome or the native app!
          window.location.replace(androidIntent);
          setTimeout(function() {
            window.location.href = webFallback;
          }, 2000);
        } else if (isIOS) {
          if (platform !== 'generic' && targetMode !== 'system_browser') {
            // Native app scheme on iOS (e.g. YouTube, Amazon, Spotify)
            window.location.href = iosScheme;
            setTimeout(function() {
              window.location.href = webFallback;
            }, 2500);
          } else {
            // For generic websites, if not in-app browser, redirect directly
            if (!isInApp) {
              window.location.replace(webFallback);
            }
          }
        } else {
          window.location.replace(webFallback);
        }
      }

      // Automatically execute deep link breakout after 150ms
      setTimeout(triggerRedirect, 150);

      // Handle button click manually
      btn.addEventListener('click', function(e) {
        if (isAndroid) {
          e.preventDefault();
          window.location.href = androidIntent;
        } else if (isIOS && platform !== 'generic') {
          e.preventDefault();
          window.location.href = iosScheme;
        }
      });
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
