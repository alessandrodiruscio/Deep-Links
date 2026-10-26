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
    const sanitizedTitle = (link.title || 'Reindirizzamento...').replace(/"/g, '&quot;');
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
      background-color: var(--bg);
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

    <a href="${finalTargetUrl}" class="btn-subtle">
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
      var androidBrowserIntent = ${JSON.stringify(protocols.androidBrowserIntent || protocols.androidIntent)};
      var iosScheme = ${JSON.stringify(protocols.iosScheme)};
      var fallback = ${JSON.stringify(finalTargetUrl)};

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
