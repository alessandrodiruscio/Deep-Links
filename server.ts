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
    const isGenericWeb = link.platform === 'generic' || link.targetMode === 'system_browser';

    let hostAndPath = '';
    try {
      const parsed = new URL(protocols.webFallback);
      hostAndPath = parsed.host + parsed.pathname + parsed.search;
    } catch {
      hostAndPath = protocols.webFallback.replace(/^https?:\/\//, '');
    }

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
      --primary-hover: #4338ca;
      --accent: #38bdf8;
      --emerald: #10b981;
      --amber: #fbbf24;
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

          <a href="${finalTargetUrl}" class="btn-subtle">
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

          <a href="${finalTargetUrl}" class="btn-subtle">
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

          <a href="${finalTargetUrl}" class="btn-subtle">
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
      var androidBrowserIntent = ${JSON.stringify(protocols.androidBrowserIntent || protocols.androidIntent)};
      var iosScheme = ${JSON.stringify(protocols.iosScheme)};
      var iosChromeScheme = ${JSON.stringify(protocols.iosChromeScheme || '')};
      var fallback = ${JSON.stringify(finalTargetUrl)};
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
