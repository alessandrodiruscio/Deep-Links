/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CloudUpload, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { LinksTable } from './components/LinksTable';
import { DeviceSimulator } from './components/DeviceSimulator';
import { AnalyticsView } from './components/AnalyticsView';
import { HowItWorksGuide } from './components/HowItWorksGuide';
import { DeployGuide } from './components/DeployGuide';
import { LinkGeneratorModal } from './components/LinkGeneratorModal';
import { QrCodeModal } from './components/QrCodeModal';
import { INITIAL_SAMPLE_LINKS } from './lib/sampleLinks';
import { DeepLink } from './types/deepLink';
import { detectPlatform, slugify } from './lib/deepLinkEngine';

const normalizeLink = (l: any): DeepLink => ({
  id: l?.id || `link_${Date.now()}`,
  slug: l?.slug || 'link',
  originalUrl: l?.originalUrl || '',
  platform: l?.platform || detectPlatform(l?.originalUrl || ''),
  targetMode: l?.targetMode || 'smart',
  title: l?.title || 'Deep Link',
  description: l?.description || '',
  imageUrl: l?.imageUrl || '',
  clicks: typeof l?.clicks === 'number' ? l.clicks : 0,
  createdAt: l?.createdAt || new Date().toISOString(),
  updatedAt: l?.updatedAt || new Date().toISOString(),
  stats: {
    iosClicks: l?.stats?.iosClicks ?? 0,
    androidClicks: l?.stats?.androidClicks ?? 0,
    desktopClicks: l?.stats?.desktopClicks ?? 0,
    inAppBreaks: {
      instagram: l?.stats?.inAppBreaks?.instagram ?? 0,
      tiktok: l?.stats?.inAppBreaks?.tiktok ?? 0,
      facebook: l?.stats?.inAppBreaks?.facebook ?? 0,
      whatsapp: l?.stats?.inAppBreaks?.whatsapp ?? 0,
      other: l?.stats?.inAppBreaks?.other ?? 0,
    },
    appOpens: l?.stats?.appOpens ?? 0,
    browserEscapes: l?.stats?.browserEscapes ?? 0,
  },
});

export default function App() {
  const [links, setLinks] = useState<DeepLink[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deepdirect_saved_links');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(normalizeLink);
          }
        } catch {}
      }
    }
    return INITIAL_SAMPLE_LINKS.map(normalizeLink);
  });

  const [currentTab, setCurrentTab] = useState<'links' | 'simulator' | 'guide' | 'analytics' | 'deploy'>('links');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<DeepLink | null>(null);
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);
  const [simulatedLink, setSimulatedLink] = useState<DeepLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{
    hasSupabase?: boolean;
    tableReady?: boolean;
    message?: string;
  } | null>(null);
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deepdirect_custom_domain') || '';
    }
    return '';
  });

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/database-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deepdirect_saved_links', JSON.stringify(links));
    }
  }, [links]);

  const handleSaveCustomBaseUrl = (newUrl: string) => {
    setCustomBaseUrl(newUrl);
    if (typeof window !== 'undefined') {
      if (newUrl) {
        localStorage.setItem('deepdirect_custom_domain', newUrl);
      } else {
        localStorage.removeItem('deepdirect_custom_domain');
      }
    }
  };

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncLinksToDatabase = async (linksToSync: DeepLink[]) => {
    if (!linksToSync || linksToSync.length === 0) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/links/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linksToSync),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.count || linksToSync.length;
        setSyncMessage(`✅ ${count} link sincronizzati con successo nel Database Supabase! Ora sono attivi ovunque.`);
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (err) {
      console.warn('Sync exception:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load links from backend API, merge with localStorage and auto-sync missing links
  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const serverLinks = await res.json();
        if (Array.isArray(serverLinks)) {
          setLinks((prevLinks) => {
            const builtInSlugs = new Set(['mio-ecommerce', 'amazon-tech', 'canale-youtube', 'playlist-focus']);

            // Retain any custom user-created link already saved locally
            const userCustomLinks = prevLinks.filter(
              (l) => !builtInSlugs.has((l.slug || '').toLowerCase())
            );

            // Find user links that exist locally in browser but not on server yet
            const serverSlugSet = new Set(
              serverLinks.map((s: any) => (s.slug || '').toLowerCase())
            );
            const missingOnServer = userCustomLinks.filter(
              (ul) => !serverSlugSet.has((ul.slug || '').toLowerCase())
            );

            // Auto-sync them up to the server/database immediately!
            if (missingOnServer.length > 0) {
              syncLinksToDatabase(missingOnServer);
            }

            // Merge map: start with server links, then overlay user's custom links
            const map = new Map<string, DeepLink>();
            for (const item of serverLinks) {
              const norm = normalizeLink(item);
              map.set(norm.slug.toLowerCase(), norm);
            }
            for (const userLink of userCustomLinks) {
              map.set(userLink.slug.toLowerCase(), userLink);
            }

            const merged = Array.from(map.values());
            if (typeof window !== 'undefined') {
              localStorage.setItem('deepdirect_saved_links', JSON.stringify(merged));
            }
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('API links fetch fallback to local cache:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSaveLink = async (linkData: Partial<DeepLink>) => {
    if (editingLink) {
      // Update existing
      try {
        const res = await fetch(`/api/links/${editingLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData),
        });
        if (res.ok) {
          const updated = await res.json();
          setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        } else {
          setLinks((prev) =>
            prev.map((l) => (l.id === editingLink.id ? ({ ...l, ...linkData } as DeepLink) : l))
          );
        }
      } catch {
        setLinks((prev) =>
          prev.map((l) => (l.id === editingLink.id ? ({ ...l, ...linkData } as DeepLink) : l))
        );
      }
      setEditingLink(null);
    } else {
      // Create new
      try {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData),
        });
        if (res.ok) {
          const created = await res.json();
          setLinks((prev) => [normalizeLink(created), ...prev]);
        } else {
          const platform = detectPlatform(linkData.originalUrl || '');
          const newLocalLink: DeepLink = {
            id: `local_${Date.now()}`,
            slug: linkData.slug || slugify(linkData.title || platform),
            originalUrl: linkData.originalUrl || '',
            platform,
            targetMode: linkData.targetMode || (platform === 'generic' ? 'system_browser' : 'smart'),
            title: linkData.title || 'Nuovo Deep Link',
            description: linkData.description || '',
            imageUrl: linkData.imageUrl || '',
            utm: linkData.utm || {},
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
          setLinks((prev) => [newLocalLink, ...prev]);
        }
      } catch {
        const platform = detectPlatform(linkData.originalUrl || '');
        const newLocalLink: DeepLink = {
          id: `local_${Date.now()}`,
          slug: linkData.slug || slugify(linkData.title || platform),
          originalUrl: linkData.originalUrl || '',
          platform,
          targetMode: linkData.targetMode || (platform === 'generic' ? 'system_browser' : 'smart'),
          title: linkData.title || 'Nuovo Deep Link',
          description: linkData.description || '',
          imageUrl: linkData.imageUrl || '',
          utm: linkData.utm || {},
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
        setLinks((prev) => [newLocalLink, ...prev]);
      }
    }
  };

  const handleQuickCreate = async (url: string) => {
    const platform = detectPlatform(url);
    await handleSaveLink({
      originalUrl: url,
      slug: slugify(platform + '-' + Math.random().toString(36).substring(2, 6)),
      targetMode: platform === 'generic' ? 'system_browser' : 'smart',
      title: `${platform.toUpperCase()} Deep Link`,
    });
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await fetch(`/api/links/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleOpenSimulator = (link: DeepLink) => {
    setSimulatedLink(link);
    setCurrentTab('simulator');
  };

  const handleOpenQrModal = (link: DeepLink) => {
    const origin = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const shareableUrl = `${origin}/l/${link.slug}`;

    setQrModalData({
      url: shareableUrl,
      title: link.title,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCreateModal={() => {
          setEditingLink(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supabase Status Banner */}
        {dbStatus?.hasSupabase && !dbStatus.tableReady && (
          <div className="mb-6 p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                <strong>Supabase rilevato su Vercel!</strong> Manca solo un passaggio: esegui lo script SQL nel tuo SQL Editor di Supabase per attivare il salvataggio permanente.
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('deploy')}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg border border-amber-500/40 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Copia Script SQL →
            </button>
          </div>
        )}

        {syncMessage && (
          <div className="mb-6 px-4 py-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-center justify-between text-xs text-indigo-200 shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          </div>
        )}

        {dbStatus?.hasSupabase && dbStatus.tableReady && (
          <div className="mb-6 px-4 py-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong>Database Supabase Connesso</strong>: I tuoi link e le statistiche sono memorizzati in modo permanente nel cloud!
              </span>
            </div>
            <button
              onClick={() => syncLinksToDatabase(links)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold rounded-lg border border-emerald-500/30 transition-colors whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizzazione...' : 'Sincronizza Link nel Database'}</span>
            </button>
          </div>
        )}

        {currentTab === 'links' && (
          <LinksTable
            links={links}
            customBaseUrl={customBaseUrl}
            onOpenCreateModal={() => {
              setEditingLink(null);
              setIsCreateModalOpen(true);
            }}
            onEditLink={(link) => {
              setEditingLink(link);
              setIsCreateModalOpen(true);
            }}
            onDeleteLink={handleDeleteLink}
            onOpenQrModal={handleOpenQrModal}
            onOpenSimulator={handleOpenSimulator}
            onQuickCreate={handleQuickCreate}
            onNavigateToDeploy={() => setCurrentTab('deploy')}
          />
        )}

        {currentTab === 'simulator' && (
          <DeviceSimulator links={links} selectedLink={simulatedLink} />
        )}

        {currentTab === 'deploy' && (
          <DeployGuide
            links={links}
            customBaseUrl={customBaseUrl}
            onSaveCustomBaseUrl={handleSaveCustomBaseUrl}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView links={links} />}

        {currentTab === 'guide' && <HowItWorksGuide />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>DeepDirect Engine</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Bypass WebView & Deep Linking Nativo</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Creato per Alessandro Di Ruscio</span>
          </div>
          <div>
            <span>Nessun costo ricorrente</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Supporto iOS & Android Intent</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LinkGeneratorModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveLink}
        initialData={editingLink}
      />

      {qrModalData && (
        <QrCodeModal
          isOpen={true}
          onClose={() => setQrModalData(null)}
          url={qrModalData.url}
          title={qrModalData.title}
        />
      )}
    </div>
  );
}
