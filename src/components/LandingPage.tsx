import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sliders,
  DollarSign,
  ShieldCheck,
  Flame,
  MousePointerClick,
  Smartphone,
  RefreshCw,
  Copy,
  Sparkles,
  Link2,
  TrendingUp,
  Globe,
  Share2
} from 'lucide-react';
import { UserProfile } from '../types/deepLink';

interface LandingPageProps {
  onGoToDashboard: () => void;
  onOpenCreateModal: () => void;
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
  currentUser: UserProfile | null;
}

// Brand Logos with SVG and official styling for the continuous moving carousel (like openup.to)
interface AppBrand {
  name: string;
  badge: string;
  lightBg: string;
  lightBorder: string;
  darkBg: string;
  darkBorder: string;
  svg: React.ReactNode;
}

const CAROUSEL_APPS: AppBrand[] = [
  {
    name: 'Amazon',
    badge: '1-Click Prime',
    lightBg: 'bg-amber-50/70',
    lightBorder: 'border-amber-200',
    darkBg: 'from-amber-500/20 to-orange-500/10',
    darkBorder: 'border-amber-500/30',
    svg: (
      <svg className="w-6 h-6 text-amber-500 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.958 10.09c0 1.272.059 2.333-.706 3.443-.538.777-1.304 1.258-2.187 1.258-1.216 0-1.921-.92-1.921-2.28 0-2.695 2.42-3.189 4.814-3.189v.768zm3.284 7.508c-.236.197-.58.211-.826.069-1.144-.925-1.35-1.358-1.986-2.261-1.895 1.954-3.238 2.505-5.69 2.505-2.923 0-5.187-1.815-5.187-5.32 0-2.738 1.488-4.606 3.633-5.54 1.865-.813 4.457-.96 6.452-1.19v-.45c0-.825-.069-1.816-.95-2.45-.783-.565-1.864-.693-2.793-.693-1.874 0-3.568.57-4.004 2.59-.059.278-.26.549-.543.559l-3.328-.354c-.27-.052-.489-.317-.417-.638C2.552 4.195 6.084 2 10.375 2c2.196 0 4.28.583 5.679 2.21 1.493 1.706 1.401 3.962 1.401 6.223v4.298c0 1.294.549 1.859 1.07 2.56.197.266.166.599-.07.798l-1.193.999-.02.01z" />
        <path d="M21.737 19.349c-3.179 2.16-7.839 3.298-12.783 3.298-5.748 0-10.923-1.636-15.02-4.382-.395-.265-.043-.728.402-.505 4.343 2.182 9.489 3.497 14.801 3.497 4.708 0 9.458-1.171 12.192-3.04.484-.33.882.35.408 1.132z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    badge: 'Sub & Like',
    lightBg: 'bg-red-50/70',
    lightBorder: 'border-red-200',
    darkBg: 'from-red-500/20 to-rose-500/10',
    darkBorder: 'border-red-500/30',
    svg: (
      <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Spotify',
    badge: 'Play Nativo',
    lightBg: 'bg-emerald-50/70',
    lightBorder: 'border-emerald-200',
    darkBg: 'from-emerald-500/20 to-teal-500/10',
    darkBorder: 'border-emerald-500/30',
    svg: (
      <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306a.753.753 0 0 1-1.034.25c-2.828-1.728-6.388-2.119-10.582-1.16a.755.755 0 0 1-.34-1.472c4.587-1.05 8.528-.609 11.706 1.348a.753.753 0 0 1 .25 1.034zm1.467-3.262a.94.94 0 0 1-1.293.311c-3.237-1.99-8.172-2.565-11.998-1.403a.941.941 0 1 1-.552-1.8c4.375-1.328 9.81-.689 13.532 1.6a.94.94 0 0 1 .311 1.292zm.126-3.41c-3.882-2.305-10.287-2.518-13.992-1.393a1.13 1.13 0 0 1-.664-2.16c4.258-1.293 11.332-1.045 15.807 1.61a1.13 1.13 0 0 1-1.151 1.943z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    badge: 'Reel & Profilo',
    lightBg: 'bg-pink-50/70',
    lightBorder: 'border-pink-200',
    darkBg: 'from-pink-500/20 to-purple-500/10',
    darkBorder: 'border-pink-500/30',
    svg: (
      <svg className="w-6 h-6 text-pink-500 dark:text-pink-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    badge: 'App Sync',
    lightBg: 'bg-cyan-50/70',
    lightBorder: 'border-cyan-200',
    darkBg: 'from-cyan-500/20 to-blue-500/10',
    darkBorder: 'border-cyan-500/30',
    svg: (
      <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    badge: 'Chat Diretta',
    lightBg: 'bg-green-50/70',
    lightBorder: 'border-green-200',
    darkBg: 'from-green-500/20 to-emerald-500/10',
    darkBorder: 'border-green-500/30',
    svg: (
      <svg className="w-6 h-6 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    badge: 'Canali & Bot',
    lightBg: 'bg-sky-50/70',
    lightBorder: 'border-sky-200',
    darkBg: 'from-sky-500/20 to-blue-500/10',
    darkBorder: 'border-sky-500/30',
    svg: (
      <svg className="w-6 h-6 text-sky-500 dark:text-sky-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'Twitch',
    badge: 'Live Stream',
    lightBg: 'bg-purple-50/70',
    lightBorder: 'border-purple-200',
    darkBg: 'from-purple-600/20 to-indigo-600/10',
    darkBorder: 'border-purple-500/30',
    svg: (
      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  },
  {
    name: 'Apple Music',
    badge: 'In-App Audio',
    lightBg: 'bg-rose-50/70',
    lightBorder: 'border-rose-200',
    darkBg: 'from-rose-500/20 to-pink-500/10',
    darkBorder: 'border-rose-500/30',
    svg: (
      <svg className="w-6 h-6 text-rose-500 dark:text-rose-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.994 6.129c-.067-.5-.467-.887-.968-.938L8.74 3.766a1.002 1.002 0 0 0-1.102.993v11.758a4.992 4.992 0 0 0-3.642-1.583C1.788 14.934 0 16.722 0 18.934s1.788 4 4 4 4-1.788 4-4V8.89l14-1.4v6.027a4.993 4.993 0 0 0-3.642-1.583c-2.212 0-4 1.788-4 4s1.788 4 4 4 4-1.788 4-4V7.073c0-.441-.318-.813-.746-.944h-.618z" />
      </svg>
    ),
  },
  {
    name: 'Shopify / Safari',
    badge: 'Apple Pay Ready',
    lightBg: 'bg-rose-50/70',
    lightBorder: 'border-rose-200',
    darkBg: 'from-rose-500/20 to-pink-500/10',
    darkBorder: 'border-rose-500/30',
    svg: (
      <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.447 2.164a3.642 3.642 0 0 0-.85 2.502c.032.222.094.437.185.641a3.527 3.527 0 0 0 2.55-1.31 3.545 3.545 0 0 0 .848-2.457 3.398 3.398 0 0 0-2.733.624zm4.498 7.032c-.068-.052-1.442-.835-1.428-2.477.017-1.954 1.588-2.888 1.66-2.934-.913-1.336-2.336-1.52-2.842-1.542-1.21-.124-2.366.712-2.981.712-.614 0-1.572-.693-2.584-.674-1.332.02-2.56.774-3.244 1.966-1.383 2.399-.353 5.949.99 7.892.659.949 1.441 2.011 2.467 1.972 1-.038 1.378-.633 2.583-.633 1.206 0 1.548.633 2.584.613 1.071-.019 1.748-.962 2.404-1.918.761-1.109 1.074-2.181 1.092-2.237-.024-.01-.301-.12-1.602-.74z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    badge: 'Profili B2B',
    lightBg: 'bg-blue-50/70',
    lightBorder: 'border-blue-200',
    darkBg: 'from-blue-600/20 to-sky-600/10',
    darkBorder: 'border-blue-500/30',
    svg: (
      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'Substack',
    badge: 'Newsletter',
    lightBg: 'bg-orange-50/70',
    lightBorder: 'border-orange-200',
    darkBg: 'from-orange-500/20 to-amber-500/10',
    darkBorder: 'border-orange-500/30',
    svg: (
      <svg className="w-6 h-6 text-orange-500 dark:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    badge: 'Pin & Board',
    lightBg: 'bg-red-50/70',
    lightBorder: 'border-red-200',
    darkBg: 'from-red-500/20 to-rose-600/10',
    darkBorder: 'border-red-500/30',
    svg: (
      <svg className="w-6 h-6 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'Discord',
    badge: 'Community',
    lightBg: 'bg-indigo-50/70',
    lightBorder: 'border-indigo-200',
    darkBg: 'from-indigo-600/20 to-purple-600/10',
    darkBorder: 'border-indigo-500/30',
    svg: (
      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    badge: 'Post & Profilo',
    lightBg: 'bg-slate-100',
    lightBorder: 'border-slate-300',
    darkBg: 'from-slate-700/20 to-slate-800/10',
    darkBorder: 'border-slate-700/40',
    svg: (
      <svg className="w-6 h-6 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToDashboard,
  onOpenCreateModal,
  onOpenAuth,
  onOpenUpgrade,
  currentUser,
}) => {
  // Interactive Quick Demo input (openup.to hero signature)
  const [demoUrl, setDemoUrl] = useState<string>('https://amazon.it/dp/B0CX23V6PT');

  // ROI Calculator state (openup.to / taap.it style)
  const [monthlyClicks, setMonthlyClicks] = useState<number>(5000);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(35); // in €

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isPro = currentUser?.plan === 'pro';

  // Calculator calculations
  const trafficLostPercent = 65; // ~65% of traffic lost in in-app browser
  const lostClicks = Math.round((monthlyClicks * trafficLostPercent) / 100);
  const estimatedConversionRate = 0.038; // 3.8% conversion in native app vs 0.8% in in-app
  const recoveredSales = Math.round(lostClicks * estimatedConversionRate);
  const recoveredRevenue = recoveredSales * avgOrderValue;

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      onOpenCreateModal();
    } else {
      onOpenAuth();
    }
  };

  const faqs = [
    {
      q: "Cos'è la 'Trappola del Browser In-App' di Instagram?",
      a: "Quando un tuo follower clicca su un link nella tua Bio o nelle Storie di Instagram, non si apre il browser di sistema o l'app nativa, ma un visualizzatore interno isolato (WebView). In questo ambiente l'utente NON è autenticato sui suoi account (come Amazon, YouTube o Spotify), non ha Apple Pay o Google Pay e deve digitare password lunghe e complesse. Oltre il 70% degli utenti abbandona all'istante senza comprare o iscriversi."
    },
    {
      q: "Come funziona la tecnologia di smartjump?",
      a: "smartjump rileva istantaneamente il sistema operativo (iOS di Apple o Android) e l'app di provenienza in meno di 200 millisecondi. Tramite protocolli ufficiali di Universal Links e Android Intent, forza lo smartphone ad aprire direttamente l'app nativa ufficiale già installata sul dispositivo, dove l'utente è già loggato e conclude l'acquisto con 1-Click Buy o Apple Pay."
    },
    {
      q: "Cosa succede se il follower non ha l'app installata sul telefono?",
      a: "Nessun errore! smartjump adotta uno Smart Fallback intelligente: se l'app non è presente, forza l'uscita dalla WebView aprendo Safari su iPhone o Chrome su Android, dove l'utente ritrova le sue password memorizzate e il portachiavi iCloud."
    },
    {
      q: "I cookie di affiliazione Amazon Associates e i parametri UTM sono salvi?",
      a: "Sì, al 100%. smartjump trasferisce e preserva integralmente ogni parametro UTM, query string e tag di affiliazione (come tag=tuoid-21 per Amazon). Tutte le commissioni vengono regolarmente accreditate sul tuo conto affiliato."
    },
    {
      q: "È conforme alle regole e alle norme di Meta e Amazon?",
      a: "Assolutamente sì. smartjump si basa sugli standard ufficiali di Apple (Universal Links) e Google (App Links), raccomandati per il routing nativo mobile. Non effettua alcun exploit o scraping e rispetta al 100% le linee guida di Meta e Amazon Associates."
    },
    {
      q: "Posso utilizzare il mio Dominio Personalizzato (es. link.miosito.it)?",
      a: "Certamente! Nel Piano PRO puoi collegare il tuo dominio o sottodominio aziendale (es. go.iltuonome.it o link.brand.com) con un semplice CNAME DNS, garantendo la massima credibilità e CTR tra i tuoi follower."
    },
    {
      q: "Come avviene l'attivazione del Piano PRO tramite SamCart?",
      a: "L'attivazione è istantanea e completamente automatica: completando il pagamento su SamCart, il webhook ufficiale aggiorna il tuo account sbloccando subito link illimitati e tutte le funzioni avanzate, senza alcuna attesa."
    },
    {
      q: "Qual è la differenza esatta tra il Piano Free e il Piano PRO?",
      a: "Il Piano Free è gratuito per sempre e consente di gestire fino a 5 deep link con bypass completo e redirect nativo. Il Piano PRO offre link illimitati, click e traffico illimitati, dominio personalizzato con branding proprietario e supporto prioritario."
    }
  ];

  return (
    <div className="space-y-24 py-4 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* =========================================================================
          HERO SECTION (openup.to aesthetic with Instagram colors)
         ========================================================================= */}
      <section className="relative overflow-hidden pt-6 pb-6">
        {/* Ambient Instagram Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[400px] bg-gradient-to-tr from-[#833ab4]/15 via-[#fd1d1d]/12 to-[#fcb045]/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-500/10 blur-2xl pointer-events-none rounded-full" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 blur-2xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow badge (openup.to style) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span>Smart Deep Linking per Instagram & Social</span>
          </div>

          {/* Main Title with Instagram Gradient */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Fai aprire i tuoi link{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#fd1d1d]">
              direttamente nell'App
            </span>{' '}
            invece che nel browser di Instagram.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bypassa il mini-browser interno che uccide le conversioni. Fai atterrare i tuoi follower direttamente su{' '}
            <strong className="text-slate-900 dark:text-white">Amazon, YouTube, Spotify e TikTok</strong> dove sono già loggati con{' '}
            <strong className="text-slate-900 dark:text-white">Apple Pay e 1-Click Buy</strong>.
          </p>

          {/* Interactive URL Generator Bar (openup.to signature) */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleHeroSubmit}
              className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border-2 border-pink-200 dark:border-pink-500/30 rounded-2xl shadow-xl shadow-pink-500/10 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-2.5 px-3 w-full text-slate-400">
                <Link2 className="w-5 h-5 text-pink-500 shrink-0" />
                <input
                  type="url"
                  required
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="Incolla qui qualsiasi link (Amazon, YouTube, Spotify...)"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Crea Deep Link Gratis</span>
              </button>
            </form>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 text-center">
              Prova subito: incolla qualsiasi link e scopri l'apertura istantanea in-app.
            </p>
          </div>

          {/* Social Proof Mini Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" /> Nessuna carta di credito richiesta
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" /> +310% conversioni medie
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" /> Cookie di affiliazione 100% protetti
            </span>
          </div>
        </div>

        {/* =========================================================================
            CONTINUOUS INFINITE MOVING LOGO CAROUSEL (openup.to style: 1 single row of squircle app cards)
           ========================================================================= */}
        <div className="mt-14 relative w-full overflow-hidden py-4">
          {/* Edge gradient masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 z-10" />

          {/* Single Continuous Track: Moving left */}
          <div className="flex overflow-hidden py-3 select-none">
            <div className="animate-marquee flex items-center gap-4 sm:gap-5">
              {CAROUSEL_APPS.map((app, i) => (
                <div
                  key={`brand-a-${i}`}
                  title={app.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-lg hover:scale-105 transition-all duration-300 shrink-0 cursor-default group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full transition-transform duration-300 group-hover:scale-110">
                    {app.svg}
                  </div>
                </div>
              ))}
              {CAROUSEL_APPS.map((app, i) => (
                <div
                  key={`brand-b-${i}`}
                  title={app.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-lg hover:scale-105 transition-all duration-300 shrink-0 cursor-default group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full transition-transform duration-300 group-hover:scale-110">
                    {app.svg}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BEFORE VS AFTER INTERACTIVE COMPARISON (openup.to Dual Phone Showcase)
         ========================================================================= */}
      <section className="max-w-5xl mx-auto space-y-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Il Problema del Browser di Instagram</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Perché i Link Tradizionali Falliscono
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Guarda la differenza tra cosa vede il tuo follower quando tocca un link normale vs quando utilizzi un Deep Link di smartjump:
          </p>

        </div>

        {/* Dual Video Showcase - OpenUp style full width, no padding, no borders, no titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* VIDEO 1: SENZA SMARTJUMP */}
          <div className="relative w-full aspect-square rounded-3xl bg-black overflow-hidden shadow-xl">
            <iframe
              src="https://livid.com/embed/_a4pId0bN56F?autoplay=1&loop=1&muted=1&background=1"
              title="Senza smartjump"
              className="w-full h-full border-0 select-none bg-black"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="eager"
            />

            {/* Absolute Shield: strictly prevents clicking play, pause, or seeking */}
            <div
              className="absolute inset-0 z-10 cursor-default select-none pointer-events-auto"
              aria-hidden="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>

          {/* VIDEO 2: CON SMARTJUMP */}
          <div className="relative w-full aspect-square rounded-3xl bg-black overflow-hidden shadow-xl">
            <iframe
              src="https://livid.com/embed/ciMQbnr6TMg-?autoplay=1&loop=1&muted=1&background=1"
              title="Con smartjump"
              className="w-full h-full border-0 select-none bg-black"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="eager"
            />

            {/* Absolute Shield: strictly prevents clicking play, pause, or seeking */}
            <div
              className="absolute inset-0 z-10 cursor-default select-none pointer-events-auto"
              aria-hidden="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          OPENUP.TO BENTO GRID OF CORE ADVANTAGES
         ========================================================================= */}
      <section className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tecnologia smartjump di Nuova Generazione</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Tutto ciò che serve per convertire al massimo
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Progettato appositamente per influencer, affiliate marketer, creator e brand che monetizzano su Instagram.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1 */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">1-Click Instant Breakout</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Zero schermate intermedie noiose o bottoni "Premi qui per continuare". smartjump effettua l'apertura in meno di 200ms in modo fluido e trasparente.
            </p>
          </div>

          {/* Bento Item 2 */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tag Affiliazione & Cookie Protetti</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Conserva al 100% i tuoi tag Amazon Associates (es. <code className="text-pink-600">tag=tuoid-21</code>), parametri UTM e codici sconto senza alcuna perdita.
            </p>
          </div>

          {/* Bento Item 3 */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Fallback Automatico</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Se l'utente non ha l'app specifica installata, smartjump non mostra errori ma apre pulito Safari o Chrome, garantendo una navigazione impeccabile.
            </p>
          </div>

          {/* Bento Item 4 */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dominio Personalizzato CNAME</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nel piano PRO puoi utilizzare il tuo brand: <code className="text-purple-600">link.iltuobrand.com</code> o <code className="text-purple-600">go.tuonome.it</code> per aumentare la fiducia al click.
            </p>
          </div>

          {/* Bento Item 5 */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Statistiche & Click in Tempo Reale</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitora quanti follower cliccano dalle Storie, quale percentuale usa iOS vs Android e da quali app provengono le tue conversioni.
            </p>
          </div>

          {/* Bento Item 6 */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 hover:border-pink-300 dark:hover:border-pink-500/40 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Compatibile al 100% con iOS & Android</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Testato e ottimizzato per le ultime versioni di iOS 17/18 e Android 14/15, garantendo l'apertura immediata in qualsiasi scenario.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE REVENUE LOSS CALCULATOR (openup.to / taap.it style)
         ========================================================================= */}
      <section className="max-w-4xl mx-auto p-6 sm:p-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-8 shadow-sm relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Calcolatore di Vendite & Guadagni Recuperati</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quanti Soldi Stai Perdendo a Causa del Browser In-App?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Sposta i cursori per simulare il traffico dei tuoi link e scoprire quante vendite puoi recuperare ogni mese aprendo l'app nativa.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Slider 1: Click Mensili */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Click mensili sui tuoi link Instagram:</span>
              <span className="text-pink-600 dark:text-pink-400 font-bold font-mono text-sm">
                {monthlyClicks.toLocaleString()} click / mese
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={monthlyClicks}
              onChange={(e) => setMonthlyClicks(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>500 click</span>
              <span>25.000 click</span>
              <span>50.000 click</span>
            </div>
          </div>

          {/* Slider 2: Valore Medio Ordine */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Valore medio ordine o carrello:</span>
              <span className="text-pink-600 dark:text-pink-400 font-bold font-mono text-sm">
                {avgOrderValue} €
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={avgOrderValue}
              onChange={(e) => setAvgOrderValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10 €</span>
              <span>75 €</span>
              <span>150 €</span>
            </div>
          </div>
        </div>

        {/* Results Banner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50/70 dark:bg-slate-950/80 border border-red-200 dark:border-red-500/30 rounded-2xl space-y-1 text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400">Click persi nel browser in-app (~65%)</div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
              -{lostClicks.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">follower bloccati al login</div>
          </div>

          <div className="p-4 bg-pink-50/70 dark:bg-slate-950/80 border border-pink-200 dark:border-pink-500/30 rounded-2xl space-y-1 text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400">Ordini extra recuperati con l'app</div>
            <div className="text-2xl font-black text-pink-600 dark:text-pink-400 font-mono">
              +{recoveredSales.toLocaleString()} ordini
            </div>
            <div className="text-[10px] text-slate-500">conclusi con 1-Click Buy</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white border-2 border-pink-400 rounded-2xl space-y-1 text-center shadow-lg shadow-pink-500/20">
            <div className="text-xs text-pink-100 font-semibold">Guadagno stimato recuperato</div>
            <div className="text-2xl font-black text-white font-mono">
              +{recoveredRevenue.toLocaleString()} € <span className="text-xs font-normal text-pink-100">/ mese</span>
            </div>
            <div className="text-[10px] text-pink-100 font-medium">Il servizio si ripaga con 1 solo ordine</div>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onOpenCreateModal}
            className="px-7 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-pink-500/25 cursor-pointer inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Inizia a Recuperare i Tuoi Guadagni Gratis</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          KEY METRICS / STATS COUNTER BAR
         ========================================================================= */}
      <section className="max-w-5xl mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              +310%
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Aumento Conversioni</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">rispetto al browser social</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              &lt; 200ms
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Routing Istantaneo</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">server cloud ultra-rapidi</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-pink-600 dark:text-pink-400">
              100%
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Salvataggio Cookie</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">UTM & commissioni affiliazione</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              0€
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Inizio Gratuito</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">5 deep link inclusi subito</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING SECTION: STRICTLY 2 TIERS (Free vs PRO)
         ========================================================================= */}
      <section className="max-w-4xl mx-auto space-y-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Trasparenza Assoluta</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Due Soli Piani Semplici. Nessun Costo Nascosto.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Inizia gratis con fino a 5 link per sempre, oppure passa alla versione PRO con link illimitati e dominio personalizzato via SamCart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* FREE TIER */}
          <div className="p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Piano Free</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ideale per testare il servizio e per piccoli creator</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  Gratis Sempre
                </span>
              </div>

              <div className="text-3xl font-black text-slate-900 dark:text-white">
                0€ <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ per sempre</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">Fino a 5 deep link attivi</strong> contemporaneamente</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Bypass automatico del browser in-app (Instagram, TikTok, FB)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Smart Redirect iOS Universal Links & Android Intent</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Statistiche di base su click totali e dispositivi</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                  <span className="w-4 h-4 text-slate-300 dark:text-slate-600 font-bold shrink-0">✕</span>
                  <span>Dominio personalizzato CNAME (esclusivo PRO)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors text-center cursor-pointer"
            >
              Inizia Subito Gratis
            </button>
          </div>

          {/* PRO TIER (SamCart Integration) */}
          <div className="relative p-7 bg-white dark:bg-slate-900 border-2 border-pink-500 rounded-3xl space-y-6 shadow-xl shadow-pink-500/10 flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-3.5 py-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs rounded-full shadow-md uppercase tracking-wider">
              Consigliato
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Piano PRO
                    <Zap className="w-4 h-4 text-pink-500 fill-current" />
                  </h3>
                  <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Massima potenza senza alcun limite</p>
                </div>
              </div>

              <div className="text-3xl font-black text-slate-900 dark:text-white">
                Accesso PRO <span className="text-xs font-normal text-slate-500 dark:text-slate-400">tramite SamCart</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">Deep Link ILLIMITATI</strong> (nessun blocco di 5 link)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Click, redirect e visitatori senza limiti di traffico</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Dominio personalizzato (<code className="text-pink-600 font-semibold">link.tuosito.it</code>)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Attivazione immediata automatica con <strong>Webhook SamCart</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>Supporto prioritario e aggiornamenti continui</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenUpgrade}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acquista Piano PRO con SamCart</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION (openup.to style)
         ========================================================================= */}
      <section className="max-w-3xl mx-auto space-y-8 scroll-mt-24">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            Domande Frequenti (FAQ)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tutto ciò che devi sapere sulla tecnologia di DeepDirect e sull'apertura delle app.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-sm hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERSION CTA BANNER (Instagram colors)
         ========================================================================= */}
      <section className="max-w-4xl mx-auto p-8 sm:p-12 bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 text-white rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Pronto a Triplicare le Tue Conversioni da Instagram?
          </h2>
          <p className="text-sm sm:text-base text-pink-100 max-w-xl mx-auto leading-relaxed">
            Unisciti ai creator, affiliati ed e-commerce che utilizzano smartjump per far atterrare i follower direttamente nelle app native.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenCreateModal}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-sm rounded-xl shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current text-pink-600" />
              <span>Inizia Subito Gratis (Fino a 5 Link)</span>
            </button>
            <button
              onClick={currentUser ? onGoToDashboard : onOpenAuth}
              className="w-full sm:w-auto px-6 py-4 bg-slate-950/40 hover:bg-slate-950/60 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              {currentUser ? 'Vai alla Tua Dashboard' : 'Accedi al Tuo Account'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
