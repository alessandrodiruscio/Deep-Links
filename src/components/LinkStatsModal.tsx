import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Edit2,
  Smartphone,
  Compass,
  Zap,
  TrendingUp,
  Folder,
  Calendar,
  Layers,
  ArrowUpRight,
  Globe,
  Radio,
  Tag,
} from 'lucide-react';
import { DeepLink, SupportedPlatform } from '../types/deepLink';
import { getPlatformName, generateProtocols } from '../lib/deepLinkEngine';

interface LinkStatsModalProps {
  isOpen: boolean;
  link: DeepLink | null;
  customBaseUrl?: string;
  onClose: () => void;
  onEditLink?: (link: DeepLink) => void;
  onOpenQrModal?: (link: DeepLink) => void;
}

export const LinkStatsModal: React.FC<LinkStatsModalProps> = ({
  isOpen,
  link,
  customBaseUrl,
  onClose,
  onEditLink,
  onOpenQrModal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !link) return null;

  const effectiveBaseUrl =
    customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const shortUrl = `${effectiveBaseUrl}/l/${link.slug}`;

  const clicks = link.clicks ?? 0;
  const appOpens = link.stats?.appOpens ?? 0;
  const browserEscapes = link.stats?.browserEscapes ?? 0;
  const iosClicks = link.stats?.iosClicks ?? 0;
  const androidClicks = link.stats?.androidClicks ?? 0;
  const desktopClicks = link.stats?.desktopClicks ?? 0;

  const instagramClicks = link.stats?.inAppBreaks?.instagram ?? 0;
  const tiktokClicks = link.stats?.inAppBreaks?.tiktok ?? 0;
  const facebookClicks = link.stats?.inAppBreaks?.facebook ?? 0;
  const whatsappClicks = link.stats?.inAppBreaks?.whatsapp ?? 0;
  const otherClicks = link.stats?.inAppBreaks?.other ?? 0;

  const totalInApp =
    instagramClicks + tiktokClicks + facebookClicks + whatsappClicks + otherClicks || (clicks > 0 ? clicks : 1);

  const breakoutRate =
    clicks > 0
      ? Math.min(100, Math.round(((appOpens + browserEscapes) / clicks) * 100))
      : 100;

  const protocols = generateProtocols(link.originalUrl, link.targetMode);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Recente';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const linkFolder = link.folder || link.project;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getPlatformBadgeColor(
                    link.platform
                  )}`}
                >
                  {getPlatformName(link.platform)}
                </span>
                {linkFolder && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    <Folder className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>{linkFolder}</span>
                  </span>
                )}
                <span>·</span>
                <span>{link.targetMode === 'native_app' ? '📱 App Nativa' : '🌐 Browser Safari/Chrome'}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Creato {formatDate(link.createdAt)}</span>
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {link.title}
              </h2>

              {/* Short Link Bar */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-md">
                  <span>{shortUrl}</span>
                </div>

                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                  title="Copia link breve"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiato!' : 'Copia'}</span>
                </button>

                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                  title="Testa link nel browser"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Destination URL */}
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate pt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Destinazione: </span>
                <span className="font-mono text-[11px]">{link.originalUrl}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          {/* Key Metrics 4-Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Metriche Chiave di Performance</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Clicks */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Click Totali
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {clicks.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Visite complessive
                </span>
              </div>

              {/* Native App Opens */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 rounded-xl">
                <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 flex items-center justify-between mb-1">
                  <span>In App Nativa</span>
                  <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  {appOpens.toLocaleString()}
                </div>
                <span className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 mt-1 block">
                  {clicks > 0 ? Math.round((appOpens / clicks) * 100) : 0}% del totale
                </span>
              </div>

              {/* Browser Escapes */}
              <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-800/40 rounded-xl">
                <span className="text-[11px] font-medium text-cyan-700 dark:text-cyan-300 flex items-center justify-between mb-1">
                  <span>Bypass Browser</span>
                  <Compass className="w-3.5 h-3.5 text-cyan-500" />
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-cyan-600 dark:text-cyan-400">
                  {browserEscapes.toLocaleString()}
                </div>
                <span className="text-[10px] text-cyan-700/80 dark:text-cyan-300/80 mt-1 block">
                  {clicks > 0 ? Math.round((browserEscapes / clicks) * 100) : 0}% del totale
                </span>
              </div>

              {/* Breakout Rate */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center justify-between mb-1">
                  <span>Tasso Bypass</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {breakoutRate}%
                </div>
                <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 mt-1 block">
                  Usciti dal webview
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown: 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: In-App Browser Sources */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Origine Clic (App Social)</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {totalInApp} in-app
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Instagram */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      📸 Instagram (Bio, Storie, DM)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {instagramClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((instagramClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (instagramClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* TikTok */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      🎵 TikTok (Bio Link & Video)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {tiktokClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((tiktokClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (tiktokClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      📘 Facebook Mobile
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {facebookClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((facebookClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (facebookClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      💬 WhatsApp (Chat & Canali)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {whatsappClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((whatsappClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (whatsappClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Other in-app */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      🌐 Altri Browser In-App
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {otherClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((otherClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (otherClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Operating Systems & Devices */}
            <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Dispositivi & Sistemi Operativi
                </h4>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {clicks} click
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* iOS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                      🍏 Apple iOS (iPhone / iPad)
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {iosClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((iosClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (iosClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Reindirizzamento con URL Scheme iOS ({protocols.iosScheme.slice(0, 32)}...)
                  </p>
                </div>

                {/* Android */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                      🤖 Google Android
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {androidClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((androidClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (androidClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Chrome Intent automatico per bypass completo senza popup
                  </p>
                </div>

                {/* Desktop */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                      💻 Desktop / PC / Mac
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {desktopClicks}{' '}
                      <span className="text-slate-400 font-normal">
                        ({clicks > 0 ? Math.round((desktopClicks / clicks) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-300"
                      style={{ width: `${clicks > 0 ? (desktopClicks / clicks) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Redirect HTTP 302 istantaneo ad altissima velocità
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Deep Link Protocols & UTM Details */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Configurazione Tecnica del Link</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Schema iOS applicato:</span>
                <div className="mt-0.5 font-mono text-[11px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded text-slate-700 dark:text-slate-300 truncate">
                  {protocols.iosScheme}
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Intent Android:</span>
                <div className="mt-0.5 font-mono text-[11px] p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded text-slate-700 dark:text-slate-300 truncate">
                  {protocols.androidIntent}
                </div>
              </div>
            </div>

            {/* UTM Parameters (if defined) */}
            {link.utm && (link.utm.source || link.utm.medium || link.utm.campaign) && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                  <Tag className="w-3 h-3 text-indigo-500" />
                  <span>Tracciamento Campagna UTM:</span>
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {link.utm.source && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                      utm_source={link.utm.source}
                    </span>
                  )}
                  {link.utm.medium && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                      utm_medium={link.utm.medium}
                    </span>
                  )}
                  {link.utm.campaign && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                      utm_campaign={link.utm.campaign}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenQrModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQrModal(link);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            )}

            {onEditLink && (
              <button
                onClick={() => {
                  onClose();
                  onEditLink(link);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modifica Link</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Chiudi Statistiche
          </button>
        </div>
      </div>
    </div>
  );
};
