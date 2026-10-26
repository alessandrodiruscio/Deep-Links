/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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

export default function App() {
  const [links, setLinks] = useState<DeepLink[]>(INITIAL_SAMPLE_LINKS);
  const [currentTab, setCurrentTab] = useState<'links' | 'simulator' | 'guide' | 'analytics' | 'deploy'>('links');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<DeepLink | null>(null);
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);
  const [simulatedLink, setSimulatedLink] = useState<DeepLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deepdirect_custom_domain') || '';
    }
    return '';
  });

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

  // Load links from backend API
  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLinks(data);
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
          setLinks((prev) => [created, ...prev]);
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
    setQrModalData({
      url: `${origin}/l/${link.slug}`,
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
