// Vercel Serverless Function - Native Handler with Direct PostgreSQL, Hostinger MySQL & Supabase Persistence
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import mysql from 'mysql2/promise';

// 1. Direct PostgreSQL Auto-Detection (Injected automatically by Vercel Marketplace Supabase)
const POSTGRES_URL =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  '';

let sqlClient: ReturnType<typeof postgres> | null = null;
if (POSTGRES_URL) {
  try {
    sqlClient = postgres(POSTGRES_URL, {
      ssl: 'require',
      max: 3,
      idle_timeout: 20,
      connect_timeout: 5,
    });
  } catch (err) {
    console.warn('Failed to initialize postgres client:', err);
  }
}

// 2. Hostinger MySQL Auto-Detection (Configured via MYSQL_URL or individual credentials)
const MYSQL_URL = process.env.MYSQL_URL || process.env.DATABASE_URL_MYSQL || '';
const MYSQL_HOST = process.env.MYSQL_HOST || process.env.HOSTINGER_DB_HOST || 'srv861.hstgr.io';
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || process.env.HOSTINGER_DB_NAME || 'u361584540_DeepLinks';
const MYSQL_USER = process.env.MYSQL_USER || process.env.HOSTINGER_DB_USER || 'u361584540_DeepLinks_user';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || process.env.HOSTINGER_DB_PASSWORD || '6p4cQSfEhK3xXCX';

let mysqlPool: mysql.Pool | null = null;
if (MYSQL_URL) {
  try {
    mysqlPool = mysql.createPool({
      uri: MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 4,
      queueLimit: 0,
      connectTimeout: 8000,
    });
  } catch (err) {
    console.warn('Failed to initialize MySQL pool from MYSQL_URL:', err);
  }
} else if (MYSQL_HOST && MYSQL_DATABASE && MYSQL_USER) {
  try {
    mysqlPool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      database: MYSQL_DATABASE,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 4,
      queueLimit: 0,
      connectTimeout: 8000,
    });
  } catch (err) {
    console.warn('Failed to initialize MySQL pool from Hostinger credentials:', err);
  }
}

// 3. Supabase REST SDK Auto-detection (Standard Vercel + Supabase environment variables)
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_REST_URL ||
  '';
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

interface DeepLink {
  id: string;
  slug: string;
  originalUrl: string;
  platform: string;
  targetMode: string;
  title: string;
  folder?: string;
  project?: string;
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
// User-created links cache (Persisted in globalThis across serverless warm invocations)
const globalAny: any = globalThis;
if (!globalAny.__DEEPDIRECT_LINKS__) {
  globalAny.__DEEPDIRECT_LINKS__ = [];
}
const LINKS_CACHE: DeepLink[] = globalAny.__DEEPDIRECT_LINKS__;

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
  let platformName = 'Browser Predefinito';
  let isApp = false;

  switch (platform) {
    case 'amazon': {
      platformName = 'Amazon Shopping';
      isApp = true;
      androidIntent = `intent://${hostAndPath}#Intent;package=com.amazon.mShop.android.shopping;scheme=https;end;`;
      iosScheme = `com.amazon.mobile.shopping://${hostAndPath}`;
      break;
    }
    case 'youtube': {
      platformName = 'YouTube';
      isApp = true;
      const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
      if (ytMatch && ytMatch[1]) {
        const videoId = ytMatch[1];
        androidIntent = `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        iosScheme = `vnd.youtube://${videoId}`;
      } else {
        androidIntent = `intent://${hostAndPath}#Intent;package=com.google.android.youtube;scheme=https;end;`;
        iosScheme = `vnd.youtube://${hostAndPath}`;
      }
      break;
    }
    case 'spotify': {
      platformName = 'Spotify';
      isApp = true;
      androidIntent = `intent://${hostAndPath}#Intent;package=com.spotify.music;scheme=https;end;`;
      const spotMatch = cleanUrl.match(/spotify\.com\/(track|album|playlist|artist|episode)\/([a-zA-Z0-9]+)/);
      iosScheme = spotMatch ? `spotify:${spotMatch[1]}:${spotMatch[2]}` : `spotify://${hostAndPath}`;
      break;
    }
    case 'instagram': {
      platformName = 'Instagram';
      isApp = true;
      const cleanPath = cleanUrl.replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, '').replace(/\/$/, '');
      const parts = cleanPath.split(/[/?#]/);
      if (parts[0] === 'p' && parts[1]) {
        iosScheme = `instagram://media?id=${parts[1]}`;
        androidIntent = `intent://instagram.com/p/${parts[1]}#Intent;package=com.instagram.android;scheme=https;end;`;
      } else if (parts[0] === 'reel' && parts[1]) {
        iosScheme = `instagram://reel?shortcode=${parts[1]}`;
        androidIntent = `intent://instagram.com/reel/${parts[1]}#Intent;package=com.instagram.android;scheme=https;end;`;
      } else if (parts[0] && !['explore', 'direct', 'reels'].includes(parts[0].toLowerCase())) {
        iosScheme = `instagram://user?username=${parts[0]}`;
        androidIntent = `intent://instagram.com/_u/${parts[0]}#Intent;package=com.instagram.android;scheme=https;end;`;
      } else {
        iosScheme = `instagram://${hostAndPath}`;
        androidIntent = `intent://${hostAndPath}#Intent;package=com.instagram.android;scheme=https;end;`;
      }
      break;
    }
    case 'tiktok': {
      platformName = 'TikTok';
      isApp = true;
      androidIntent = `intent://${hostAndPath}#Intent;package=com.zhiliaoapp.musically;scheme=https;end;`;
      iosScheme = `snssdk1233://${hostAndPath}`;
      break;
    }
    case 'linkedin': {
      platformName = 'LinkedIn';
      isApp = true;
      androidIntent = `intent://${hostAndPath}#Intent;package=com.linkedin.android;scheme=https;end;`;
      iosScheme = `linkedin://${hostAndPath}`;
      break;
    }
    case 'twitter': {
      platformName = 'X (Twitter)';
      isApp = true;
      androidIntent = `intent://${hostAndPath}#Intent;package=com.twitter.android;scheme=https;end;`;
      iosScheme = `twitter://${hostAndPath}`;
      break;
    }
    default: {
      platformName = 'Browser Predefinito';
      isApp = false;
      androidIntent = androidBrowserIntent;
      iosScheme = cleanUrl;
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
    isApp,
    fallback: cleanUrl,
  };
}

// Cloud KV Persistence Helper (Vercel KV or Upstash Redis REST)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function kvGet(key: string): Promise<any> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.result) return null;
    return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: any): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(typeof value === 'string' ? value : JSON.stringify(value)),
    });
    return true;
  } catch {
    return false;
  }
}

async function kvDel(key: string): Promise<void> {
  if (!KV_URL || !KV_TOKEN) return;
  try {
    await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
  } catch {}
}

// -------------------------------------------------------------
// Supabase Database Helpers
// -------------------------------------------------------------
let tableEnsured = false;
async function ensureTableExists(): Promise<boolean> {
  if (tableEnsured) return true;
  if (!sqlClient) return false;
  try {
    await sqlClient`
      CREATE TABLE IF NOT EXISTS public.deep_links (
        slug TEXT PRIMARY KEY,
        id TEXT,
        original_url TEXT NOT NULL,
        platform TEXT DEFAULT 'generic',
        target_mode TEXT DEFAULT 'smart',
        title TEXT,
        folder TEXT,
        description TEXT,
        image_url TEXT,
        clicks BIGINT DEFAULT 0,
        stats JSONB DEFAULT '{"iosClicks":0,"androidClicks":0,"desktopClicks":0,"inAppBreaks":{"instagram":0,"tiktok":0,"facebook":0,"whatsapp":0,"other":0},"appOpens":0,"browserEscapes":0}'::jsonb,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    try {
      await sqlClient`ALTER TABLE public.deep_links ENABLE ROW LEVEL SECURITY;`;
      await sqlClient`DROP POLICY IF EXISTS "Public access to deep_links" ON public.deep_links;`;
      await sqlClient`CREATE POLICY "Public access to deep_links" ON public.deep_links FOR ALL USING (true) WITH CHECK (true);`;
    } catch {}
    tableEnsured = true;
    return true;
  } catch (err) {
    console.warn('Auto table creation failed:', err);
    return false;
  }
}

let mysqlTableEnsured = false;
async function ensureMySQLTableExists(): Promise<boolean> {
  if (mysqlTableEnsured) return true;
  if (!mysqlPool) return false;
  try {
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS deep_links (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        platform VARCHAR(32) NOT NULL DEFAULT 'generic',
        target_mode VARCHAR(32) NOT NULL DEFAULT 'smart',
        title VARCHAR(255) NOT NULL DEFAULT '',
        folder VARCHAR(128) DEFAULT '',
        project VARCHAR(128) DEFAULT '',
        description TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        clicks INT DEFAULT 0,
        stats JSON DEFAULT NULL,
        data JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    mysqlTableEnsured = true;
    return true;
  } catch (err) {
    console.warn('ensureMySQLTableExists error:', err);
    throw err;
  }
}

async function getSupabaseLinks(): Promise<DeepLink[] | null> {
  // 1. Try Hostinger MySQL
  if (mysqlPool) {
    try {
      await ensureMySQLTableExists();
      const [rows]: any = await mysqlPool.query(
        'SELECT * FROM deep_links ORDER BY created_at DESC LIMIT 200'
      );
      if (Array.isArray(rows)) {
        return rows.map((r: any) => {
          let parsedStats = r.stats;
          if (typeof parsedStats === 'string') {
            try { parsedStats = JSON.parse(parsedStats); } catch {}
          }
          let parsedData = r.data;
          if (typeof parsedData === 'string') {
            try { parsedData = JSON.parse(parsedData); } catch {}
          }
          if (parsedData && typeof parsedData === 'object') {
            return {
              ...parsedData,
              clicks: typeof r.clicks === 'number' ? r.clicks : Number(r.clicks || 0),
            };
          }
          return {
            id: r.id || `link_${r.slug}`,
            slug: r.slug,
            originalUrl: r.original_url || r.originalUrl || '',
            platform: r.platform || detectPlatform(r.original_url || ''),
            targetMode: r.target_mode || 'smart',
            title: r.title || 'Nuovo Deep Link',
            folder: r.folder || r.project || '',
            project: r.folder || r.project || '',
            description: r.description || '',
            imageUrl: r.image_url || '',
            clicks: Number(r.clicks || 0),
            stats: parsedStats || {
              iosClicks: 0,
              androidClicks: 0,
              desktopClicks: 0,
              inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
              appOpens: 0,
              browserEscapes: 0,
            },
          };
        });
      }
    } catch (err) {
      console.warn('Hostinger MySQL getLinks error:', err);
    }
  }

  // 2. Try Direct PostgreSQL
  if (sqlClient) {
    try {
      await ensureTableExists();
      const rows = await sqlClient`SELECT * FROM public.deep_links ORDER BY created_at DESC LIMIT 200;`;
      if (rows && rows.length > 0) {
        return rows.map((row: any) => {
          if (row.data && typeof row.data === 'object') {
            return {
              ...row.data,
              clicks: typeof row.clicks === 'number' ? row.clicks : Number(row.clicks || 0),
            };
          }
          return {
            id: row.id || `link_${row.slug}`,
            slug: row.slug,
            originalUrl: row.original_url || row.originalUrl || '',
            platform: row.platform || detectPlatform(row.original_url || ''),
            targetMode: row.target_mode || row.targetMode || 'smart',
            title: row.title || 'Deep Link',
            folder: row.folder || '',
            project: row.folder || '',
            description: row.description || '',
            imageUrl: row.image_url || row.imageUrl || '',
            clicks: Number(row.clicks || 0),
            stats: row.stats || {
              iosClicks: 0,
              androidClicks: 0,
              desktopClicks: 0,
              inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
              appOpens: 0,
              browserEscapes: 0,
            },
          };
        });
      }
    } catch (e) {
      console.warn('Postgres getSupabaseLinks exception:', e);
    }
  }

  // 2. Try Supabase REST SDK
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('deep_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => {
          if (row.data && typeof row.data === 'object') {
            return {
              ...row.data,
              clicks: typeof row.clicks === 'number' ? row.clicks : (row.data.clicks || 0),
            };
          }
          return {
            id: row.id || `link_${row.slug}`,
            slug: row.slug,
            originalUrl: row.original_url || row.originalUrl || '',
            platform: row.platform || detectPlatform(row.original_url || ''),
            targetMode: row.target_mode || row.targetMode || 'smart',
            title: row.title || 'Deep Link',
            folder: row.folder || '',
            project: row.folder || '',
            description: row.description || '',
            imageUrl: row.image_url || row.imageUrl || '',
            clicks: Number(row.clicks || 0),
            stats: row.stats || {
              iosClicks: 0,
              androidClicks: 0,
              desktopClicks: 0,
              inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
              appOpens: 0,
              browserEscapes: 0,
            },
          };
        });
      }
    } catch (e) {
      console.warn('Supabase query exception:', e);
    }
  }
  return null;
}

async function getSupabaseLinkBySlug(slug: string): Promise<DeepLink | null> {
  const cleanSlug = slug.trim().toLowerCase();

  // 1. Try Hostinger MySQL
  if (mysqlPool) {
    try {
      await ensureMySQLTableExists();
      const [rows]: any = await mysqlPool.query(
        'SELECT * FROM deep_links WHERE LOWER(slug) = ? LIMIT 1',
        [cleanSlug]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        let parsedStats = r.stats;
        if (typeof parsedStats === 'string') {
          try { parsedStats = JSON.parse(parsedStats); } catch {}
        }
        let parsedData = r.data;
        if (typeof parsedData === 'string') {
          try { parsedData = JSON.parse(parsedData); } catch {}
        }
        if (parsedData && typeof parsedData === 'object') {
          return {
            ...parsedData,
            clicks: typeof r.clicks === 'number' ? r.clicks : Number(r.clicks || 0),
          };
        }
        return {
          id: r.id || `link_${r.slug}`,
          slug: r.slug,
          originalUrl: r.original_url || r.originalUrl || '',
          platform: r.platform || detectPlatform(r.original_url || ''),
          targetMode: r.target_mode || 'smart',
          title: r.title || 'Nuovo Deep Link',
          folder: r.folder || r.project || '',
          project: r.folder || r.project || '',
          description: r.description || '',
          imageUrl: r.image_url || '',
          clicks: Number(r.clicks || 0),
          stats: parsedStats || {
            iosClicks: 0,
            androidClicks: 0,
            desktopClicks: 0,
            inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
            appOpens: 0,
            browserEscapes: 0,
          },
        };
      }
    } catch (err) {
      console.warn('Hostinger MySQL lookup error:', err);
    }
  }

  // 2. Try Direct PostgreSQL
  if (sqlClient) {
    try {
      await ensureTableExists();
      const rows = await sqlClient`
        SELECT * FROM public.deep_links 
        WHERE LOWER(slug) = ${cleanSlug} 
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const data = rows[0];
        if (data.data && typeof data.data === 'object') {
          return {
            ...data.data,
            clicks: typeof data.clicks === 'number' ? data.clicks : Number(data.clicks || 0),
          };
        }
        return {
          id: data.id || `link_${data.slug}`,
          slug: data.slug,
          originalUrl: data.original_url || data.originalUrl || '',
          platform: data.platform || detectPlatform(data.original_url || ''),
          targetMode: data.target_mode || data.targetMode || 'smart',
          title: data.title || 'Reindirizzamento...',
          folder: data.folder || '',
          project: data.folder || '',
          description: data.description || '',
          imageUrl: data.image_url || data.imageUrl || '',
          clicks: Number(data.clicks || 0),
          stats: data.stats || {
            iosClicks: 0,
            androidClicks: 0,
            desktopClicks: 0,
            inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
            appOpens: 0,
            browserEscapes: 0,
          },
        };
      }
    } catch (err) {
      console.warn('Direct postgres lookup error:', err);
    }
  }

  // 2. Try Supabase REST SDK
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('deep_links')
        .select('*')
        .ilike('slug', cleanSlug)
        .maybeSingle();

      if (!error && data) {
        if (data.data && typeof data.data === 'object') {
          return {
            ...data.data,
            clicks: typeof data.clicks === 'number' ? data.clicks : (data.data.clicks || 0),
          };
        }
        return {
          id: data.id || `link_${data.slug}`,
          slug: data.slug,
          originalUrl: data.original_url || data.originalUrl || '',
          platform: data.platform || detectPlatform(data.original_url || ''),
          targetMode: data.target_mode || data.targetMode || 'smart',
          title: data.title || 'Reindirizzamento...',
          folder: data.folder || '',
          project: data.folder || '',
          description: data.description || '',
          imageUrl: data.image_url || data.imageUrl || '',
          clicks: Number(data.clicks || 0),
          stats: data.stats || {
            iosClicks: 0,
            androidClicks: 0,
            desktopClicks: 0,
            inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
            appOpens: 0,
            browserEscapes: 0,
          },
        };
      }
    } catch (e) {
      console.warn('Supabase REST query exception:', e);
    }
  }

  return null;
}

async function saveSupabaseLink(link: DeepLink): Promise<boolean> {
  let saved = false;

  // 1. Save via Hostinger MySQL
  if (mysqlPool) {
    try {
      await ensureMySQLTableExists();
      await mysqlPool.query(
        `INSERT INTO deep_links (
          id, slug, original_url, platform, target_mode, title, folder, project, description, image_url, clicks, stats, data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          original_url = VALUES(original_url),
          platform = VALUES(platform),
          target_mode = VALUES(target_mode),
          title = VALUES(title),
          folder = VALUES(folder),
          project = VALUES(project),
          description = VALUES(description),
          image_url = VALUES(image_url),
          stats = VALUES(stats),
          data = VALUES(data),
          updated_at = CURRENT_TIMESTAMP`,
        [
          link.id,
          link.slug.toLowerCase(),
          link.originalUrl,
          link.platform,
          link.targetMode,
          link.title,
          link.folder || link.project || '',
          link.folder || link.project || '',
          link.description || '',
          link.imageUrl || '',
          link.clicks || 0,
          JSON.stringify(link.stats || {}),
          JSON.stringify(link),
        ]
      );
      saved = true;
    } catch (err) {
      console.warn('Hostinger MySQL saveLink error:', err);
    }
  }

  // 2. Save via Direct PostgreSQL (auto-creates table if needed)
  if (sqlClient) {
    try {
      await ensureTableExists();
      await sqlClient`
        INSERT INTO public.deep_links (
          slug, id, original_url, platform, target_mode, title, folder, description, image_url, clicks, stats, data, updated_at
        ) VALUES (
          ${link.slug.toLowerCase()},
          ${link.id},
          ${link.originalUrl},
          ${link.platform},
          ${link.targetMode},
          ${link.title},
          ${link.folder || link.project || ''},
          ${link.description || ''},
          ${link.imageUrl || ''},
          ${link.clicks || 0},
          ${JSON.stringify(link.stats)},
          ${JSON.stringify(link)},
          NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          original_url = EXCLUDED.original_url,
          platform = EXCLUDED.platform,
          target_mode = EXCLUDED.target_mode,
          title = EXCLUDED.title,
          folder = EXCLUDED.folder,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          data = EXCLUDED.data,
          updated_at = NOW();
      `;
      saved = true;
    } catch (err) {
      console.warn('Direct postgres upsert failed:', err);
    }
  }

  // 3. Save via Supabase REST SDK
  if (supabase) {
    try {
      const { error } = await supabase.from('deep_links').upsert(
        {
          slug: link.slug.toLowerCase(),
          id: link.id,
          original_url: link.originalUrl,
          platform: link.platform,
          target_mode: link.targetMode,
          title: link.title,
          folder: link.folder || link.project || '',
          description: link.description || '',
          image_url: link.imageUrl || '',
          clicks: link.clicks || 0,
          stats: link.stats,
          data: link,
        },
        { onConflict: 'slug' }
      );
      if (!error) {
        saved = true;
      } else {
        console.warn('Supabase REST upsert error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase REST upsert exception:', e);
    }
  }

  return saved;
}

async function deleteSupabaseLink(idOrSlug: string): Promise<void> {
  const clean = idOrSlug.trim().toLowerCase();
  if (mysqlPool) {
    try {
      await mysqlPool.query('DELETE FROM deep_links WHERE LOWER(slug) = ? OR id = ?', [clean, idOrSlug]);
    } catch (err) {
      console.warn('Hostinger MySQL delete error:', err);
    }
  }
  if (sqlClient) {
    try {
      await sqlClient`DELETE FROM public.deep_links WHERE LOWER(slug) = ${clean} OR id = ${idOrSlug};`;
    } catch {}
  }
  if (supabase) {
    try {
      await supabase.from('deep_links').delete().or(`id.eq.${idOrSlug},slug.eq.${clean}`);
    } catch {}
  }
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.url || '';
  const query = req.query || {};
  const apiRoute = (Array.isArray(query.apiRoute) ? query.apiRoute.join('/') : (query.apiRoute as string)) || '';
  const xMatchedPath = (req.headers['x-matched-path'] as string) || '';
  const xInvokePath = (req.headers['x-invoke-path'] as string) || '';
  const requestPath = `${rawUrl} ${apiRoute} ${xMatchedPath} ${xInvokePath}`.toLowerCase();

  // Route Flags
  const isDatabaseStatus = requestPath.includes('database-status');
  const isSync = requestPath.includes('sync') || (req.method === 'POST' && Array.isArray(req.body));
  const isCreateLink = req.method === 'POST' && !isSync && (requestPath.includes('links') || (req.body && req.body.originalUrl));
  const isDeleteLink = req.method === 'DELETE';
  const isListLinks = req.method === 'GET' && !query.slug && !requestPath.includes('/l/') && (requestPath.includes('links') || rawUrl === '/api' || rawUrl === '/api/' || apiRoute === 'links');

  // Handle API route: GET /api/database-status
  if (isDatabaseStatus) {
    res.setHeader('Content-Type', 'application/json');

    // Hostinger MySQL
    if (mysqlPool) {
      try {
        const tableReady = await ensureMySQLTableExists();
        return res.status(200).json({
          hasDatabase: true,
          hasMySQL: true,
          hasSupabase: false,
          hasPostgres: false,
          hasKv: false,
          tableReady,
          message: tableReady
            ? 'Database Hostinger MySQL connesso e tabella deep_links attiva! I link sono salvati in modo permanente.'
            : 'Connessione a Hostinger MySQL stabilita. Configurazione tabella in corso...',
        });
      } catch (err: any) {
        return res.status(200).json({
          hasDatabase: true,
          hasMySQL: true,
          hasSupabase: false,
          hasPostgres: false,
          hasKv: false,
          tableReady: false,
          error: err.message,
          message: 'Errore durante la connessione a Hostinger MySQL: verifica host, utente, password e di aver abilitato Remote MySQL su hPanel.',
        });
      }
    }

    if (!sqlClient && !supabase) {
      return res.status(200).json({
        hasDatabase: false,
        hasMySQL: false,
        hasSupabase: false,
        hasPostgres: false,
        hasKv: !!(KV_URL && KV_TOKEN),
        tableReady: false,
        message: 'Nessuna variabile per Hostinger MySQL (MYSQL_URL/MYSQL_HOST) o Supabase (POSTGRES_URL) configurata.',
      });
    }

    // Direct PostgreSQL auto-provisioning
    if (sqlClient) {
      try {
        const tableReady = await ensureTableExists();
        return res.status(200).json({
          hasDatabase: true,
          hasMySQL: false,
          hasSupabase: true,
          hasPostgres: true,
          hasKv: !!(KV_URL && KV_TOKEN),
          tableReady,
          message: tableReady
            ? 'Database Supabase/PostgreSQL connesso e tabella deep_links attiva! I link sono salvati in modo permanente.'
            : 'Connessione al database stabilita. Configurazione tabella in corso...',
        });
      } catch (err: any) {
        console.warn('Database status check postgres error:', err);
      }
    }

    try {
      const { data, error } = await supabase!.from('deep_links').select('slug').limit(1);
      if (error) {
        return res.status(200).json({
          hasDatabase: true,
          hasMySQL: false,
          hasSupabase: true,
          hasPostgres: false,
          hasKv: !!(KV_URL && KV_TOKEN),
          tableReady: false,
          error: error.message,
          code: error.code,
          message: 'Supabase REST collegato! Serve eseguire lo script SQL per creare la tabella deep_links.',
        });
      }
      return res.status(200).json({
        hasDatabase: true,
        hasMySQL: false,
        hasSupabase: true,
        hasPostgres: false,
        hasKv: !!(KV_URL && KV_TOKEN),
        tableReady: true,
        message: 'Supabase è attivo e la tabella deep_links è pronta per il salvataggio permanente.',
      });
    } catch (err: any) {
      return res.status(200).json({
        hasDatabase: true,
        hasMySQL: false,
        hasSupabase: true,
        hasPostgres: false,
        hasKv: !!(KV_URL && KV_TOKEN),
        tableReady: false,
        error: err.message,
      });
    }
  }

  // Extract slug robustly
  let rawSlug = '';
  if (Array.isArray(query.slug)) {
    rawSlug = query.slug.join('/');
  } else if (typeof query.slug === 'string') {
    rawSlug = query.slug;
  }
  if (!rawSlug) {
    const match = rawUrl.match(/\/l\/([^\/?#]+)/i);
    if (match) rawSlug = match[1];
  }
  let slug = rawSlug
    .replace(/^\/?l\//i, '')
    .replace(/^\/+/, '')
    .split('?')[0]
    .split('#')[0]
    .trim();

  if (['api', 'links', 'database-status', 'favicon.ico'].includes(slug.toLowerCase())) {
    slug = '';
  }

  // Handle API route: GET /api/links
  if (isListLinks) {
    res.setHeader('Content-Type', 'application/json');

    const SAMPLE_SLUGS = new Set(['mio-ecommerce', 'amazon-tech', 'canale-youtube', 'playlist-focus']);

    // 1. Try PostgreSQL, Supabase or Hostinger MySQL
    if (sqlClient || supabase || mysqlPool) {
      const supaLinks = await getSupabaseLinks();
      if (supaLinks) {
        const cleanSupaLinks = supaLinks.filter(
          (l) => !SAMPLE_SLUGS.has((l.slug || '').toLowerCase())
        );
        return res.status(200).json(cleanSupaLinks);
      }
    }

    // 2. Try KV
    if (KV_URL && KV_TOKEN) {
      try {
        const storedSlugs: string[] = (await kvGet('deepdirect:slugs_index')) || [];
        const kvLinks: DeepLink[] = [];
        for (const s of storedSlugs) {
          if (SAMPLE_SLUGS.has(s.toLowerCase())) continue;
          const l = await kvGet(`deepdirect:slug:${s}`);
          if (l) kvLinks.push(l);
        }
        return res.status(200).json(kvLinks);
      } catch (err) {
        console.warn('Failed reading KV:', err);
      }
    }
    return res.status(200).json(LINKS_CACHE.filter((l) => !SAMPLE_SLUGS.has((l.slug || '').toLowerCase())));
  }

  // Handle API route: POST /api/links/sync (Bulk sync from localStorage to Database)
  if (isSync) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body || {};
    const linksToSync = Array.isArray(body) ? body : (body.links || []);
    const syncedSlugs: string[] = [];

    for (const item of linksToSync) {
      if (!item.slug || !item.originalUrl) continue;
      const cleanSlug = item.slug.trim();
      const norm: DeepLink = {
        id: item.id || `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slug: cleanSlug,
        originalUrl: item.originalUrl.trim(),
        platform: item.platform || detectPlatform(item.originalUrl),
        targetMode: item.targetMode || 'smart',
        title: item.title || 'Deep Link',
        folder: item.folder || item.project || '',
        project: item.folder || item.project || '',
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        clicks: Number(item.clicks || 0),
        stats: item.stats || {
          iosClicks: 0,
          androidClicks: 0,
          desktopClicks: 0,
          inAppBreaks: { instagram: 0, tiktok: 0, facebook: 0, whatsapp: 0, other: 0 },
          appOpens: 0,
          browserEscapes: 0,
        },
      };

      // Add to memory cache
      const idx = LINKS_CACHE.findIndex((l) => l.slug.toLowerCase() === cleanSlug.toLowerCase());
      if (idx !== -1) {
        LINKS_CACHE[idx] = { ...LINKS_CACHE[idx], ...norm };
      } else {
        LINKS_CACHE.unshift(norm);
      }

      // Save to Database (Hostinger MySQL, PostgreSQL, Supabase)
      if (sqlClient || supabase || mysqlPool) {
        await saveSupabaseLink(norm);
      }

      // Save to KV if configured
      if (KV_URL && KV_TOKEN) {
        try {
          await kvSet(`deepdirect:slug:${cleanSlug.toLowerCase()}`, norm);
          await kvSet(`deepdirect:id:${norm.id}`, norm);
        } catch {}
      }

      syncedSlugs.push(cleanSlug);
    }

    return res.status(200).json({ success: true, count: syncedSlugs.length, slugs: syncedSlugs });
  }

  // Handle API route: POST /api/links
  if (isCreateLink) {
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
      folder: body.folder || body.project || '',
      project: body.folder || body.project || '',
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

    // Save to Database (Hostinger MySQL, PostgreSQL, Supabase)
    if (sqlClient || supabase || mysqlPool) {
      await saveSupabaseLink(newLink);
    }

    // Save to persistent KV if configured
    if (KV_URL && KV_TOKEN) {
      try {
        await kvSet(`deepdirect:slug:${finalSlug.toLowerCase()}`, newLink);
        await kvSet(`deepdirect:id:${newLink.id}`, newLink);
        const storedSlugs: string[] = (await kvGet('deepdirect:slugs_index')) || [];
        if (!storedSlugs.includes(finalSlug.toLowerCase())) {
          storedSlugs.unshift(finalSlug.toLowerCase());
          await kvSet('deepdirect:slugs_index', storedSlugs);
        }
      } catch (e) {
        console.warn('Error saving to KV:', e);
      }
    }

    return res.status(201).json(newLink);
  }

  // Handle API route: DELETE /api/links/:id
  if (isDeleteLink) {
    res.setHeader('Content-Type', 'application/json');
    const id =
      (query.id as string) ||
      (apiRoute.split('links/')[1] || rawUrl.split('/api/links/')[1])?.split('?')[0]?.replace(/^\//, '');

    if (id) {
      // Remove from memory
      const idx = LINKS_CACHE.findIndex((l) => l.id === id || l.slug === id);
      if (idx !== -1) {
        const removed = LINKS_CACHE.splice(idx, 1)[0];
        if (KV_URL && KV_TOKEN && removed) {
          await kvDel(`deepdirect:slug:${removed.slug.toLowerCase()}`);
          await kvDel(`deepdirect:id:${removed.id}`);
          const storedSlugs: string[] = (await kvGet('deepdirect:slugs_index')) || [];
          await kvSet(
            'deepdirect:slugs_index',
            storedSlugs.filter((s) => s !== removed.slug.toLowerCase())
          );
        }
      }

      // Remove from Database (Hostinger MySQL, PostgreSQL, Supabase)
      if (sqlClient || supabase || mysqlPool) {
        await deleteSupabaseLink(id);
      }
    }
    return res.status(200).json({ success: true });
  }

  // If a slug is requested, render the Deep Link Gateway
  if (slug) {
    // 1. Look in memory cache
    let link: DeepLink | null | undefined = LINKS_CACHE.find(
      (l) => l.slug.toLowerCase() === slug.toLowerCase()
    );

    // 2. Look in Hostinger MySQL / Supabase / PostgreSQL database
    if (!link && (sqlClient || supabase || mysqlPool)) {
      const supaLink = await getSupabaseLinkBySlug(slug);
      if (supaLink) {
        link = supaLink;
        if (!LINKS_CACHE.some((l) => l.slug.toLowerCase() === supaLink.slug.toLowerCase())) {
          LINKS_CACHE.unshift(supaLink);
        }
        // Increment clicks asynchronously
        if (mysqlPool) {
          try {
            mysqlPool.query(
              'UPDATE deep_links SET clicks = clicks + 1, updated_at = CURRENT_TIMESTAMP WHERE LOWER(slug) = ?',
              [slug.toLowerCase()]
            ).then(() => {}, () => {});
          } catch {}
        } else if (sqlClient) {
          try {
            sqlClient`UPDATE public.deep_links SET clicks = clicks + 1, updated_at = NOW() WHERE LOWER(slug) = ${slug.toLowerCase()};`.then(() => {}, () => {});
          } catch {}
        } else if (supabase) {
          try {
            supabase
              .from('deep_links')
              .update({ clicks: (supaLink.clicks || 0) + 1 })
              .eq('slug', slug.toLowerCase())
              .then(() => {}, () => {});
          } catch {}
        }
      }
    }

    // 3. Look in persistent KV storage if configured
    if (!link && KV_URL && KV_TOKEN) {
      try {
        link = await kvGet(`deepdirect:slug:${slug.toLowerCase()}`);
      } catch (err) {
        console.warn('Error fetching slug from KV:', err);
      }
    }

    // 4. Look in fallback query parameter ?u=... if passed
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
    const isApp = Boolean(protocols.isApp);

    // Determine target URL for instant launch based on device and context:
    let primaryTarget = protocols.fallback;
    if (isAndroid) {
      primaryTarget = isApp ? protocols.androidIntent : protocols.androidBrowserIntent;
    } else if (isIOS) {
      if (isApp) {
        primaryTarget = protocols.iosScheme;
      } else if (isInstagram) {
        // Break out of Instagram iOS directly into Safari / system default browser
        primaryTarget = `instagram://extbrowser/?url=${encodeURIComponent(protocols.fallback)}`;
      } else if (isFacebook) {
        // Break out of Facebook iOS directly into system default browser
        primaryTarget = `fb://extbrowser/?url=${encodeURIComponent(protocols.fallback)}`;
      } else {
        primaryTarget = protocols.fallback;
      }
    }

    const targetDisplayName = isApp ? protocols.platformName : 'Browser Predefinito';

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

    <h2>Apertura di ${targetDisplayName}...</h2>
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
      var primary = ${JSON.stringify(primaryTarget)};
      var fallback = ${JSON.stringify(protocols.fallback)};
      var isApp = ${Boolean(protocols.isApp)};
      var ua = navigator.userAgent || '';
      var isIOS = /iPhone|iPad|iPod/i.test(ua);
      var isAndroid = /Android/i.test(ua);
      var isInstagram = /Instagram/i.test(ua);
      var isFacebook = /FBAN|FBAV/i.test(ua);

      // Client-side refinement if User-Agent header was modified or masked
      if (!isApp) {
        if (isIOS && isInstagram) {
          primary = 'instagram://extbrowser/?url=' + encodeURIComponent(fallback);
        } else if (isIOS && isFacebook) {
          primary = 'fb://extbrowser/?url=' + encodeURIComponent(fallback);
        } else if (isAndroid) {
          var clean = fallback.replace(/^https?:\\/\\//, '');
          primary = 'intent://' + clean + '#Intent;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;scheme=https;end;';
        }
      }

      // Update button target
      var btn = document.getElementById('launchBtn');
      if (btn) {
        btn.href = primary;
      }

      // 1. Immediate trigger via replace & href
      try {
        window.location.replace(primary);
      } catch (e) {
        window.location.href = primary;
      }

      // 2. Programmatic click on button
      if (btn && typeof btn.click === 'function') {
        try { btn.click(); } catch (e) {}
      }

      // 3. User interaction listener (instant breakout upon any touch/tap on screen)
      function triggerBreakout() {
        try {
          window.location.href = primary;
        } catch (e) {}
      }
      window.addEventListener('touchstart', triggerBreakout, { passive: true, once: true });
      window.addEventListener('click', triggerBreakout, { once: true });

      // 4. Fallback for native apps if not installed
      if (isApp) {
        setTimeout(function() {
          try {
            window.location.replace(fallback);
          } catch (e) {
            window.location.href = fallback;
          }
        }, 2200);
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(html);
  }

  // Default response
  return res.status(200).send('DeepDirect API Online');
}
