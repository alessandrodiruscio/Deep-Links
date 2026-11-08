/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CloudUpload, RefreshCw, CheckCircle2, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { LinksTable } from './components/LinksTable';
import { AnalyticsView } from './components/AnalyticsView';
import { LinkGeneratorModal } from './components/LinkGeneratorModal';
import { QrCodeModal } from './components/QrCodeModal';
import { LinkStatsModal } from './components/LinkStatsModal';
import { AuthModal } from './components/AuthModal';
import { UpgradeProModal } from './components/UpgradeProModal';
import { LandingPage } from './components/LandingPage';
import { PREDEFINED_SAMPLE_SLUGS } from './lib/sampleLinks';
import { DeepLink, UserProfile } from './types/deepLink';
import { detectPlatform, slugify } from './lib/deepLinkEngine';
import { ThemeProvider } from './context/ThemeContext';

const normalizeLink = (l: any): DeepLink => ({
  id: l?.id || `link_${Date.now()}`,
  slug: l?.slug || 'link',
  originalUrl: l?.originalUrl || '',
  platform: l?.platform || detectPlatform(l?.originalUrl || ''),
  targetMode: l?.targetMode || 'smart',
  title: l?.title || 'Deep Link',
  folder: l?.folder || l?.project || '',
  project: l?.folder || l?.project || '',
  description: l?.description || '',
  imageUrl: l?.imageUrl || '',
  userId: l?.userId || '',
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

function AppInner() {
  const [links, setLinks] = useState<DeepLink[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deepdirect_saved_links');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Strictly exclude any predefined sample links
            const userOnly = parsed
              .filter((l: any) => !PREDEFINED_SAMPLE_SLUGS.has((l?.slug || '').toLowerCase()))
              .map(normalizeLink);
            localStorage.setItem('deepdirect_saved_links', JSON.stringify(userOnly));
            return userOnly;
          }
        } catch {}
      }
    }
    return [];
  });

  const [currentTab, setCurrentTab] = useState<'links' | 'analytics'>('links');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<DeepLink | null>(null);
  const [statsModalLink, setStatsModalLink] = useState<DeepLink | null>(null);
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication & Tiers (Free vs Pro)
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deepdirect_token') || null;
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deepdirect_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [dbStatus, setDbStatus] = useState<{
    hasDatabase?: boolean;
    hasMySQL?: boolean;
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

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('deepdirect_user', JSON.stringify(user));
        }
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch {}
  };

  useEffect(() => {
    checkDbStatus();
    if (authToken) {
      fetchProfile(authToken);
    }
  }, [authToken]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deepdirect_saved_links', JSON.stringify(links));
    }
  }, [links]);

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deepdirect_token');
      localStorage.removeItem('deepdirect_user');
    }
    setCurrentTab('links');
    fetchLinks(null);
  };

  const handleAuthSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    setCurrentTab('links');
    fetchLinks(token);
  };

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
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(linksToSync),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.count || linksToSync.length;
        setSyncMessage(`✅ ${count} link sincronizzati con successo nel Database! Ora sono attivi ovunque.`);
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (err) {
      console.warn('Sync exception:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load links from backend API, merge with localStorage and auto-sync missing links
  const fetchLinks = async (overrideToken?: string | null) => {
    const tokenToUse = overrideToken !== undefined ? overrideToken : authToken;
    try {
      const res = await fetch('/api/links', {
        headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
      });
      if (res.ok) {
        const serverLinks = await res.json();
        if (Array.isArray(serverLinks)) {
          setLinks((prevLinks) => {
            // Clean server links by excluding any sample or test links
            const cleanServerLinks = serverLinks
              .filter((s: any) => s && !PREDEFINED_SAMPLE_SLUGS.has((s.slug || '').toLowerCase()))
              .map(normalizeLink);

            // Retain only valid non-sample links locally
            const userCustomLinks = prevLinks.filter(
              (l) => !PREDEFINED_SAMPLE_SLUGS.has((l.slug || '').toLowerCase())
            );

            // Auto-sync ANY user link found in localStorage that is not yet in the server database
            const serverIdSet = new Set(cleanServerLinks.map((s) => s.id));
            const serverSlugSet = new Set(cleanServerLinks.map((s) => (s.slug || '').toLowerCase()));
            const offlineLinksToSync = userCustomLinks.filter(
              (ul) => !serverIdSet.has(ul.id) && !serverSlugSet.has((ul.slug || '').toLowerCase())
            );

            if (offlineLinksToSync.length > 0) {
              syncLinksToDatabase(offlineLinksToSync);
            }

            // Server is the primary source of truth, preserving any pending local links
            const map = new Map<string, DeepLink>();
            for (const item of cleanServerLinks) {
              map.set(item.id, item);
            }
            for (const userLink of userCustomLinks) {
              if (!map.has(userLink.id) && !serverSlugSet.has((userLink.slug || '').toLowerCase())) {
                map.set(userLink.id, userLink);
              }
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
  }, [authToken]);

  const handleSaveLink = async (linkData: Partial<DeepLink>) => {
    const isPro = currentUser?.plan === 'pro';

    // Check Free limit on client side as an early check
    if (currentUser && currentUser.plan === 'free' && !editingLink) {
      const activeCount = links.length;
      if (activeCount >= currentUser.maxLinks) {
        setIsCreateModalOpen(false);
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    if (editingLink) {
      // Update existing
      try {
        const res = await fetch(`/api/links/${editingLink.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(linkData),
        });
        if (res.ok) {
          const updated = await res.json();
          setLinks((prev) => prev.map((l) => (l.id === editingLink.id || l.id === updated.id ? updated : l)));
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
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(linkData),
        });

        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          if (errData.upgradeRequired) {
            setIsCreateModalOpen(false);
            setIsUpgradeModalOpen(true);
            return;
          }
        }

        if (res.ok) {
          const created = await res.json();
          setLinks((prev) => [normalizeLink(created), ...prev]);
          if (currentUser && currentUser.plan === 'free') {
            setCurrentUser((prev) => (prev ? { ...prev, currentLinkCount: (prev.currentLinkCount || 0) + 1 } : null));
          }
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
            userId: currentUser?.id || '',
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
          userId: currentUser?.id || '',
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

  const handleDeleteLink = async (id: string) => {
    try {
      await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
    } catch {
      // ignore
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    if (currentUser && currentUser.plan === 'free') {
      setCurrentUser((prev) => (prev ? { ...prev, currentLinkCount: Math.max(0, (prev.currentLinkCount || 1) - 1) } : null));
    }
  };

  const handleOpenQrModal = (link: DeepLink) => {
    const origin = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const shareableUrl = `${origin}/l/${link.slug}`;

    setQrModalData({
      url: shareableUrl,
      title: link.title,
    });
  };

  const isPro = currentUser?.plan === 'pro';
  const isFreeAtLimit = currentUser && currentUser.plan === 'free' && links.length >= currentUser.maxLinks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCreateModal={() => {
          if (isFreeAtLimit) {
            setIsUpgradeModalOpen(true);
            return;
          }
          setEditingLink(null);
          setIsCreateModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenAuth={(mode?: 'login' | 'register') => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentUser ? (
          /* Home Page Pubblica: Landing Page per visitatori prima del login */
          <LandingPage
            onGoToDashboard={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onOpenCreateModal={() => {
              setAuthModalMode('register');
              setIsAuthModalOpen(true);
            }}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            currentUser={currentUser}
          />
        ) : (
          /* Piattaforma per Utenti Loggati: SOLO I Tuoi Deep Link e Statistiche */
          <>
            {/* Free Plan Limit Alert Banner */}
            {isFreeAtLimit && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:via-slate-900 dark:to-slate-900 border border-amber-300 dark:border-amber-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-md animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Limite del Piano Free Raggiunto ({links.length}/5 link attivi)
                    </div>
                    <div className="text-amber-800 dark:text-amber-300/90 text-xs">
                      Hai raggiunto il limite massimo del piano gratuito. Passa a PRO per creare link illimitati e gestire le tue campagne senza restrizioni!
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Sblocca PRO Illimitato</span>
                </button>
              </div>
            )}

            {syncMessage && (
              <div className="mb-6 px-4 py-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/40 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              </div>
            )}

            {dbStatus?.tableReady && (
              <div className="mb-6 px-4 py-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-300 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong>
                      {dbStatus.hasMySQL ? 'Database Hostinger MySQL Connesso' : 'Database Cloud Connesso'}
                    </strong>
                    : I tuoi link e le statistiche sono memorizzati in modo permanente nel database!
                  </span>
                </div>
                <button
                  onClick={() => syncLinksToDatabase(links)}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold rounded-lg border border-emerald-300 dark:border-emerald-500/30 transition-colors whitespace-nowrap self-start sm:self-auto disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizzazione...' : 'Sincronizza nel Database'}</span>
                </button>
              </div>
            )}

            {currentTab === 'links' && (
              <LinksTable
                links={links}
                customBaseUrl={customBaseUrl}
                onOpenCreateModal={() => {
                  if (isFreeAtLimit) {
                    setIsUpgradeModalOpen(true);
                    return;
                  }
                  setEditingLink(null);
                  setIsCreateModalOpen(true);
                }}
                onEditLink={(link) => {
                  setEditingLink(link);
                  setIsCreateModalOpen(true);
                }}
                onDeleteLink={handleDeleteLink}
                onOpenQrModal={handleOpenQrModal}
                onOpenStatsModal={(link) => setStatsModalLink(link)}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView
                links={links}
                onOpenLinkStats={(link) => setStatsModalLink(link)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">smartjump Engine</span>
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
        existingFolders={Array.from(
          new Set(links.map((l) => l.folder || l.project).filter(Boolean) as string[])
        )}
        customBaseUrl={customBaseUrl}
        onOpenQrModal={handleOpenQrModal}
      />

      <LinkStatsModal
        isOpen={!!statsModalLink}
        link={statsModalLink}
        customBaseUrl={customBaseUrl}
        onClose={() => setStatsModalLink(null)}
        onEditLink={(link) => {
          setEditingLink(link);
          setIsCreateModalOpen(true);
        }}
        onOpenQrModal={handleOpenQrModal}
      />

      {qrModalData && (
        <QrCodeModal
          isOpen={true}
          onClose={() => setQrModalData(null)}
          url={qrModalData.url}
          title={qrModalData.title}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Upgrade to PRO Modal (SamCart Integration) */}
      <UpgradeProModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsUpgradeModalOpen(false);
          setAuthModalMode('register');
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
