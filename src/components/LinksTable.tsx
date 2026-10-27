import React, { useState } from 'react';
import {
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Edit2,
  Trash2,
  Smartphone,
  Search,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Globe,
  Folder,
} from 'lucide-react';
import { DeepLink, SupportedPlatform } from '../types/deepLink';
import { getPlatformName } from '../lib/deepLinkEngine';

interface LinksTableProps {
  links: DeepLink[];
  customBaseUrl?: string;
  onOpenCreateModal: () => void;
  onEditLink: (link: DeepLink) => void;
  onDeleteLink: (id: string) => void;
  onOpenQrModal: (link: DeepLink) => void;
  onOpenSimulator: (link: DeepLink) => void;
  onQuickCreate: (url: string) => void;
  onNavigateToDeploy?: () => void;
}

export const LinksTable: React.FC<LinksTableProps> = ({
  links,
  customBaseUrl,
  onOpenCreateModal,
  onEditLink,
  onDeleteLink,
  onOpenQrModal,
  onOpenSimulator,
  onQuickCreate,
  onNavigateToDeploy,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [quickUrl, setQuickUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableFolders = Array.from(
    new Set(links.map((l) => l.folder || l.project).filter(Boolean) as string[])
  );

  const rawBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const effectiveBaseUrl = customBaseUrl || rawBaseUrl;

  const getShareableUrl = (link: DeepLink) => {
    return `${effectiveBaseUrl}/l/${link.slug}`;
  };

  const handleCopy = (link: DeepLink) => {
    const fullShortUrl = getShareableUrl(link);
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      onQuickCreate(quickUrl.trim());
      setQuickUrl('');
    }
  };

  const filteredLinks = links.filter((l) => {
    const title = l?.title || '';
    const slug = l?.slug || '';
    const originalUrl = l?.originalUrl || '';
    const linkFolder = l?.folder || l?.project || '';
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      slug.toLowerCase().includes(search.toLowerCase()) ||
      originalUrl.toLowerCase().includes(search.toLowerCase()) ||
      linkFolder.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || l.platform === platformFilter;
    const matchesFolder =
      folderFilter === 'all' ||
      (folderFilter === '__none__' ? !linkFolder : linkFolder.toLowerCase() === folderFilter.toLowerCase());
    return matchesSearch && matchesPlatform && matchesFolder;
  });

  const getPlatformBadgeColor = (p: SupportedPlatform) => {
    switch (p) {
      case 'amazon':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'youtube':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'spotify':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'instagram':
        return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
      case 'tiktok':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      default:
        return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice about Testing on Instagram & ais-dev security cookie */}
      <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">
              Hai visto l'avviso "Action required to load your app" su Instagram?
            </span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              È normale: l'URL temporaneo <code className="text-amber-200 font-mono">ais-dev-...</code> richiede
              il login Google per sicurezza dello sviluppo. Per i link pubblici nella tua bio Instagram, usa un tuo
              dominio (es. <code className="text-indigo-300 font-mono">link.tuosito.it</code>) senza alcun blocco!
            </p>
          </div>
        </div>
        {onNavigateToDeploy && (
          <button
            onClick={onNavigateToDeploy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg whitespace-nowrap font-medium transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Configura Dominio (0€)</span>
          </button>
        )}
      </div>

      {/* Quick Creator Box */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl shadow-xl">
        <div className="max-w-3xl">
          <h2 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Crea Deep Link Istantaneo
          </h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Incolla il link del tuo sito web, prodotto Amazon, video YouTube o traccia Spotify. Il motore
            creerà immediatamente il link con bypass per Instagram, TikTok e Facebook.
          </p>

          <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Incolla qui il tuo link (es. https://miosito.it/landing o link Amazon)..."
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-md whitespace-nowrap"
            >
              Genera Deep Link
            </button>
          </form>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cerca per titolo, cartella, slug o url..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'generic', 'amazon', 'youtube', 'spotify', 'instagram', 'tiktok'].map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    platformFilter === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {p === 'all'
                    ? 'Tutte le Piattaforme'
                    : p === 'generic'
                    ? 'Siti Web'
                    : getPlatformName(p as SupportedPlatform)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Folder / Project Filter Bar */}
        {availableFolders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1 shrink-0">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cartelle:</span>
            </span>
            <button
              onClick={() => setFolderFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                folderFilter === 'all'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Tutte ({links.length})
            </button>
            {availableFolders.map((fld) => {
              const count = links.filter((l) => (l.folder || l.project) === fld).length;
              return (
                <button
                  key={fld}
                  onClick={() => setFolderFilter(fld)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                    folderFilter.toLowerCase() === fld.toLowerCase()
                      ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>📁 {fld}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Links List / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredLinks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-400 mb-3">Nessun deep link trovato per i filtri selezionati.</p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              Crea un Nuovo Link
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLinks.map((link) => {
              const fullShortUrl = `${effectiveBaseUrl}/l/${link.slug}`;
              const isCopied = copiedId === link.id;
              const appOpens = link.stats?.appOpens ?? 0;
              const browserEscapes = link.stats?.browserEscapes ?? 0;
              const clicks = link.clicks ?? 0;
              const breakoutRate =
                clicks > 0
                  ? Math.round(((appOpens + browserEscapes) / clicks) * 100)
                  : 100;
              const linkFolder = link.folder || link.project;

              return (
                <div
                  key={link.id}
                  className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate max-w-md">
                        {link.title}
                      </h3>
                      {linkFolder && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-500/30">
                          <Folder className="w-3 h-3 text-indigo-400" />
                          <span>{linkFolder}</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getPlatformBadgeColor(
                          link.platform
                        )}`}
                      >
                        {getPlatformName(link.platform)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {link.targetMode === 'native_app' ? '📱 App Nativa' : '🌐 Browser Safari/Chrome'}
                      </span>
                    </div>

                    {/* Short Deep Link Display */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono font-medium text-indigo-400 hover:text-indigo-300 transition-colors truncate max-w-sm">
                        {fullShortUrl}
                      </div>

                      {/* 1-Click Copy Button */}
                      <button
                        onClick={() => handleCopy(link)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Copia link breve"
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copiato!' : 'Copia'}</span>
                      </button>

                      {/* Direct Test Link */}
                      <a
                        href={`/l/${link.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="Apri nel browser"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Destination URL */}
                    <p className="text-xs text-slate-400 truncate max-w-xl">
                      <span className="text-slate-500">Destinazione: </span>
                      {link.originalUrl}
                    </p>
                  </div>

                  {/* Middle: Stats */}
                  <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0">
                    <div className="text-center">
                      <div className="font-mono text-base font-bold text-white tabular-nums">
                        {link.clicks.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Click Totali
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                        {breakoutRate}%
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Bypass Riuscito
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenSimulator(link)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Testa nel simulatore in-app"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Simula</span>
                    </button>

                    <button
                      onClick={() => onOpenQrModal(link)}
                      className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Visualizza QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditLink(link)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Modifica link"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Elimina link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
