import React from 'react';
import {
  TrendingUp,
  Smartphone,
  Compass,
  Zap,
  DollarSign,
  PiggyBank,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { DeepLink } from '../types/deepLink';
import { getPlatformName } from '../lib/deepLinkEngine';

interface AnalyticsViewProps {
  links: DeepLink[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ links }) => {
  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);
  const totalAppOpens = links.reduce((acc, l) => acc + l.stats.appOpens, 0);
  const totalBrowserEscapes = links.reduce((acc, l) => acc + l.stats.browserEscapes, 0);
  const totalIos = links.reduce((acc, l) => acc + l.stats.iosClicks, 0);
  const totalAndroid = links.reduce((acc, l) => acc + l.stats.androidClicks, 0);
  const totalDesktop = links.reduce((acc, l) => acc + l.stats.desktopClicks, 0);

  const instagramClicks = links.reduce((acc, l) => acc + (l.stats.inAppBreaks.instagram || 0), 0);
  const tiktokClicks = links.reduce((acc, l) => acc + (l.stats.inAppBreaks.tiktok || 0), 0);
  const facebookClicks = links.reduce((acc, l) => acc + (l.stats.inAppBreaks.facebook || 0), 0);
  const whatsappClicks = links.reduce((acc, l) => acc + (l.stats.inAppBreaks.whatsapp || 0), 0);
  const otherClicks = links.reduce((acc, l) => acc + (l.stats.inAppBreaks.other || 0), 0);

  const totalInApp =
    instagramClicks + tiktokClicks + facebookClicks + whatsappClicks + otherClicks || 1;

  // Comparison savings calculation:
  // URLGenius and OpenInApp typically charge:
  // Starter: $29/mo (up to 2,000 clicks)
  // Pro: $49/mo (up to 5,000 clicks)
  // Enterprise: $99/mo (10,000+ clicks)
  const monthlySavings = totalClicks > 5000 ? 99 : totalClicks > 2000 ? 49 : 29;
  const annualSavings = monthlySavings * 12;

  const breakoutRate =
    totalClicks > 0
      ? Math.round(((totalAppOpens + totalBrowserEscapes) / totalClicks) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Statistiche di Traffico e Risparmio
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitora quanti utenti hanno abbandonato il webview di Instagram/TikTok per aprire i tuoi link
            nelle app native o nel browser di sistema, e calcola quanto stai risparmiando!
          </p>
        </div>

        {/* Savings Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
          <PiggyBank className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">Risparmio Stimato</div>
            <div className="text-sm font-bold text-white font-mono">
              ~{annualSavings} € <span className="text-[11px] text-emerald-300 font-normal">/ anno</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Click Totali Tracciati</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalClicks.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Attraverso {links.length} deep link attivi</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Aperture in App Nativa</span>
            <Smartphone className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">
            {totalAppOpens.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Amazon, YouTube, Spotify, ecc.</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Bypass su Safari/Chrome</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            {totalBrowserEscapes.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Usciti dal webview di Instagram/TikTok</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Tasso di Successo Bypass</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {breakoutRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Utenti non persi nel webview</p>
        </div>
      </div>

      {/* Traffic Origin & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In-App Browser Sources */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Sorgenti WebView In-App</span>
            <span className="text-xs text-slate-500 font-normal">Origine dei clic</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">📸 Instagram (Bio, Storie, DM)</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {instagramClicks} ({Math.round((instagramClicks / totalInApp) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${(instagramClicks / totalInApp) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">🎵 TikTok (Bio Link & Video)</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {tiktokClicks} ({Math.round((tiktokClicks / totalInApp) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(tiktokClicks / totalInApp) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">📘 Facebook Mobile</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {facebookClicks} ({Math.round((facebookClicks / totalInApp) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(facebookClicks / totalInApp) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">💬 WhatsApp Web/App</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {whatsappClicks} ({Math.round((whatsappClicks / totalInApp) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(whatsappClicks / totalInApp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Systems */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Sistemi Operativi</span>
            <span className="text-xs text-slate-500 font-normal">Dispositivi utenti</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  🍏 Apple iOS (iPhone / iPad)
                </span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {totalIos} ({totalClicks > 0 ? Math.round((totalIos / totalClicks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${totalClicks > 0 ? (totalIos / totalClicks) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Apre URL Schemes nativi o attiva la guida visuale verso Safari.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  🤖 Google Android
                </span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {totalAndroid} ({totalClicks > 0 ? Math.round((totalAndroid / totalClicks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${totalClicks > 0 ? (totalAndroid / totalClicks) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Esegue Intent Chrome automatico: 0 clic per uscire dal webview!
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">💻 Desktop / Mac / PC</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {totalDesktop} ({totalClicks > 0 ? Math.round((totalDesktop / totalClicks) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full"
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
    </div>
  );
};
