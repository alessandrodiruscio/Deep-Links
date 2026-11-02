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
}

export const LinksTable: React.FC<LinksTableProps> = ({
  links,
  customBaseUrl,
  onOpenCreateModal,
  onEditLink,
  onDeleteLink,
  onOpenQrModal,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const effectiveBaseUrl =
    customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  const getShareableUrl = (link: DeepLink) => {
    return `${effectiveBaseUrl}/l/${link.slug}`;
  };

  const handleCopy = (link: DeepLink) => {
    const url = getShareableUrl(link);
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const availableFolders = Array.from(
    new Set(
      links
        .map((l) => l.folder || l.project)
        .filter((f): f is string => Boolean(f && f !== 'No project'))
    )
  );

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
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20';
      case 'youtube':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
      case 'spotify':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
      case 'instagram':
        return 'text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-400/10 border-pink-200 dark:border-pink-400/20';
      case 'tiktok':
        return 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-400/20';
      default:
        return 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 border-indigo-200 dark:border-indigo-400/20';
    }
  };

  return (
    <div className="space-y-6">
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
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-colors"
            />
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'generic', 'amazon', 'youtube', 'spotify', 'instagram', 'tiktok'].map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    platformFilter === p
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
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
              <Folder className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Cartelle:</span>
            </span>
            <button
              onClick={() => setFolderFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                folderFilter === 'all'
                  ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    folderFilter.toLowerCase() === fld.toLowerCase()
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg transition-colors">
        {filteredLinks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Nessun deep link trovato per i filtri selezionati.</p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 cursor-pointer shadow-sm"
            >
              Crea un Nuovo Link
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                        {link.title}
                      </h3>
                      {linkFolder && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                          <Folder className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
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
                      <div className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors truncate max-w-sm">
                        {fullShortUrl}
                      </div>

                      {/* 1-Click Copy Button */}
                      <button
                        onClick={() => handleCopy(link)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                        }`}
                        title="Copia link breve"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copiato!' : 'Copia'}</span>
                      </button>

                      {/* Test link in new tab */}
                      <a
                        href={fullShortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Testa reindirizzamento"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Destination URL */}
                    <div className="text-[11px] text-slate-500 truncate max-w-lg">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Destinazione: </span>
                      {link.originalUrl}
                    </div>
                  </div>

                  {/* Middle: Performance Metrics Chips */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      {/* Total Clicks */}
                      <div className="text-center">
                        <div className="text-base font-bold text-slate-900 dark:text-white leading-tight font-mono">
                          {clicks}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                          Click
                        </div>
                      </div>

                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

                      {/* App opens vs web */}
                      <div className="text-center">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-tight font-mono">
                          {breakoutRate}%
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                          Bypass
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {/* QR Modal */}
                      <button
                        onClick={() => onOpenQrModal(link)}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Visualizza QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditLink(link)}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Modifica link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteLink(link.id)}
                        className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Elimina link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
