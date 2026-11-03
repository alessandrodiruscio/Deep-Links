import React, { useState } from 'react';
import {
  TrendingUp,
  Smartphone,
  Compass,
  Zap,
  PiggyBank,
  Users,
  BarChart2,
  Filter,
  ExternalLink,
  Folder,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { DeepLink, SupportedPlatform } from '../types/deepLink';
import { getPlatformName } from '../lib/deepLinkEngine';

interface AnalyticsViewProps {
  links: DeepLink[];
  onOpenLinkStats?: (link: DeepLink) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ links, onOpenLinkStats }) => {
  const [selectedLinkId, setSelectedLinkId] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  const selectedLink = selectedLinkId !== 'all' ? links.find((l) => l.id === selectedLinkId) : null;
  const activeLinks = selectedLink ? [selectedLink] : links;

  const totalClicks = activeLinks.reduce((acc, l) => acc + (l.clicks || 0), 0);
  const totalAppOpens = activeLinks.reduce((acc, l) => acc + (l.stats?.appOpens || 0), 0);
  const totalBrowserEscapes = activeLinks.reduce((acc, l) => acc + (l.stats?.browserEscapes || 0), 0);
  const totalIos = activeLinks.reduce((acc, l) => acc + (l.stats?.iosClicks || 0), 0);
  const totalAndroid = activeLinks.reduce((acc, l) => acc + (l.stats?.androidClicks || 0), 0);
  const totalDesktop = activeLinks.reduce((acc, l) => acc + (l.stats?.desktopClicks || 0), 0);

  const instagramClicks = activeLinks.reduce((acc, l) => acc + (l.stats?.inAppBreaks?.instagram || 0), 0);
  const tiktokClicks = activeLinks.reduce((acc, l) => acc + (l.stats?.inAppBreaks?.tiktok || 0), 0);
  const facebookClicks = activeLinks.reduce((acc, l) => acc + (l.stats?.inAppBreaks?.facebook || 0), 0);
  const whatsappClicks = activeLinks.reduce((acc, l) => acc + (l.stats?.inAppBreaks?.whatsapp || 0), 0);
  const otherClicks = activeLinks.reduce((acc, l) => acc + (l.stats?.inAppBreaks?.other || 0), 0);

  const totalInApp =
    instagramClicks + tiktokClicks + facebookClicks + whatsappClicks + otherClicks || (totalClicks > 0 ? totalClicks : 1);

  const monthlySavings = totalClicks > 5000 ? 99 : totalClicks > 2000 ? 49 : 29;
  const annualSavings = monthlySavings * 12;

  const breakoutRate =
    totalClicks > 0
      ? Math.min(100, Math.round(((totalAppOpens + totalBrowserEscapes) / totalClicks) * 100))
      : 100;

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

  const filteredLinksForTable = links.filter((l) => {
    const t = (l.title || '').toLowerCase();
    const s = (l.slug || '').toLowerCase();
    const f = (l.folder || l.project || '').toLowerCase();
    const q = tableSearch.toLowerCase();
    return t.includes(q) || s.includes(q) || f.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header with Link Selector Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Statistiche di Traffico e Risparmio</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Analizza le metriche globali o filtra per un singolo link per visualizzare click, aperture in app native e tasso di bypass da Instagram e TikTok.
          </p>
        </div>

        {/* Link Filter Selector + Savings Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Per-Link Dropdown Selector */}
          <div className="relative">
            <label htmlFor="link-filter-select" className="sr-only">Seleziona Link</label>
            <select
              id="link-filter-select"
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs max-w-xs truncate"
            >
              <option value="all">📊 Tutti i link ({links.length} totali)</option>
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.clicks || 0} click)
                </option>
              ))}
            </select>
          </div>

          {/* Savings Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
            <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Risparmio</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                ~{annualSavings} € <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-normal">/ anno</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Link Banner (If single link selected) */}
      {selectedLink && (
        <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getPlatformBadgeColor(
                selectedLink.platform
              )}`}
            >
              {getPlatformName(selectedLink.platform)}
            </span>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                {selectedLink.title}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                /l/{selectedLink.slug} · Destinazione: {selectedLink.originalUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLinkStats && (
              <button
                onClick={() => onOpenLinkStats(selectedLink)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Scheda Dettagliata Completa</span>
              </button>
            )}
            <button
              onClick={() => setSelectedLinkId('all')}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Mostra Tutti i Link
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {selectedLink ? 'Click di Questo Link' : 'Click Totali Tracciati'}
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalClicks.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {selectedLink ? `Slug: /l/${selectedLink.slug}` : `Attraverso ${links.length} deep link attivi`}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aperture in App Nativa</span>
            <Smartphone className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {totalAppOpens.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Amazon, YouTube, Spotify, ecc.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bypass su Safari/Chrome</span>
            <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono tabular-nums">
            {totalBrowserEscapes.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Usciti dal webview di Instagram/TikTok</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tasso di Successo Bypass</span>
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {breakoutRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Utenti non persi nel webview</p>
        </div>
      </div>

      {/* Traffic Origin & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In-App Browser Sources */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Sorgenti WebView In-App</span>
            <span className="text-xs text-slate-500 font-normal">
              {selectedLink ? 'Origine di questo link' : 'Origine dei clic globali'}
            </span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">📸 Instagram (Bio, Storie, DM)</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {instagramClicks} ({totalInApp > 0 ? Math.round((instagramClicks / totalInApp) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${totalInApp > 0 ? (instagramClicks / totalInApp) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">🎵 TikTok (Bio Link & Video)</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {tiktokClicks} ({totalInApp > 0 ? Math.round((tiktokClicks / totalInApp) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${totalInApp > 0 ? (tiktokClicks / totalInApp) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">📘 Facebook Mobile</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {facebookClicks} ({totalInApp > 0 ? Math.round((facebookClicks / totalInApp) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${totalInApp > 0 ? (facebookClicks / totalInApp) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">💬 WhatsApp Web/App</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {whatsappClicks} ({totalInApp > 0 ? Math.round((whatsappClicks / totalInApp) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalInApp > 0 ? (whatsappClicks / totalInApp) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">🌐 Altri Webview</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {otherClicks} ({totalInApp > 0 ? Math.round((otherClicks / totalInApp) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${totalInApp > 0 ? (otherClicks / totalInApp) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Systems */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Sistemi Operativi</span>
            <span className="text-xs text-slate-500 font-normal">Dispositivi utenti</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  🍏 Apple iOS (iPhone / iPad)
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {totalIos} ({totalClicks > 0 ? Math.round((totalIos / totalClicks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${totalClicks > 0 ? (totalIos / totalClicks) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Apre URL Schemes nativi o attiva il redirect intelligente verso Safari.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  🤖 Google Android
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {totalAndroid} ({totalClicks > 0 ? Math.round((totalAndroid / totalClicks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalClicks > 0 ? (totalAndroid / totalClicks) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Esegue Intent Chrome automatico: 0 clic per uscire dal webview!
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">💻 Desktop / Mac / PC</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {totalDesktop} ({totalClicks > 0 ? Math.round((totalDesktop / totalClicks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                  style={{ width: `${totalClicks > 0 ? (totalDesktop / totalClicks) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Reindirizzamento HTTP 302 istantaneo a piena velocità.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Link Breakdown Table (Statistiche per ogni singolo link) */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              <span>Statistiche Dettagliate per Singolo Link</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clicca su un link per visualizzare l'analisi completa di click, app nativa, iOS, Android e social.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cerca link o cartella..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Link & Piattaforma</th>
                <th className="py-2.5 px-3 font-semibold text-right">Click Totali</th>
                <th className="py-2.5 px-3 font-semibold text-right">App Nativa</th>
                <th className="py-2.5 px-3 font-semibold text-right">Bypass Webview</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tasso Bypass</th>
                <th className="py-2.5 px-3 font-semibold text-center">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLinksForTable.map((l) => {
                const lClicks = l.clicks || 0;
                const lAppOpens = l.stats?.appOpens || 0;
                const lBrowserEscapes = l.stats?.browserEscapes || 0;
                const lBreakout = lClicks > 0 ? Math.min(100, Math.round(((lAppOpens + lBrowserEscapes) / lClicks) * 100)) : 100;
                const lFolder = l.folder || l.project;

                return (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${getPlatformBadgeColor(
                            l.platform
                          )}`}
                        >
                          {getPlatformName(l.platform)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                            {l.title}
                          </div>
                          <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                            /l/{l.slug}
                            {lFolder && (
                              <span className="text-slate-400 font-sans ml-1.5">
                                · 📁 {lFolder}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {lClicks.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-medium">
                      {lAppOpens.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-medium">
                      {lBrowserEscapes.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        {lBreakout}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (onOpenLinkStats) {
                            onOpenLinkStats(l);
                          } else {
                            setSelectedLinkId(l.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors cursor-pointer"
                        title="Vedi scheda statistiche del link"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Vedi Statistiche</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
