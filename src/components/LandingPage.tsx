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
  Copy
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
  bgGlow: string;
  borderColor: string;
  svg: React.ReactNode;
}

const CAROUSEL_APPS_ROW1: AppBrand[] = [
  {
    name: 'Amazon',
    badge: '1-Click Prime',
    bgGlow: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    svg: (
      <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.958 10.09c0 1.272.059 2.333-.706 3.443-.538.777-1.304 1.258-2.187 1.258-1.216 0-1.921-.92-1.921-2.28 0-2.695 2.42-3.189 4.814-3.189v.768zm3.284 7.508c-.236.197-.58.211-.826.069-1.144-.925-1.35-1.358-1.986-2.261-1.895 1.954-3.238 2.505-5.69 2.505-2.923 0-5.187-1.815-5.187-5.32 0-2.738 1.488-4.606 3.633-5.54 1.865-.813 4.457-.96 6.452-1.19v-.45c0-.825-.069-1.816-.95-2.45-.783-.565-1.864-.693-2.793-.693-1.874 0-3.568.57-4.004 2.59-.059.278-.26.549-.543.559l-3.328-.354c-.27-.052-.489-.317-.417-.638C2.552 4.195 6.084 2 10.375 2c2.196 0 4.28.583 5.679 2.21 1.493 1.706 1.401 3.962 1.401 6.223v4.298c0 1.294.549 1.859 1.07 2.56.197.266.166.599-.07.798l-1.193.999-.02.01z" />
        <path d="M21.737 19.349c-3.179 2.16-7.839 3.298-12.783 3.298-5.748 0-10.923-1.636-15.02-4.382-.395-.265-.043-.728.402-.505 4.343 2.182 9.489 3.497 14.801 3.497 4.708 0 9.458-1.171 12.192-3.04.484-.33.882.35.408 1.132z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    badge: 'Sub & Like',
    bgGlow: 'from-red-500/20 to-rose-500/10',
    borderColor: 'border-red-500/30',
    svg: (
      <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Spotify',
    badge: 'Play Nativo',
    bgGlow: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    svg: (
      <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306a.753.753 0 0 1-1.034.25c-2.828-1.728-6.388-2.119-10.582-1.16a.755.755 0 0 1-.34-1.472c4.587-1.05 8.528-.609 11.706 1.348a.753.753 0 0 1 .25 1.034zm1.467-3.262a.94.94 0 0 1-1.293.311c-3.237-1.99-8.172-2.565-11.998-1.403a.941.941 0 1 1-.552-1.8c4.375-1.328 9.81-.689 13.532 1.6a.94.94 0 0 1 .311 1.292zm.126-3.41c-3.882-2.305-10.287-2.518-13.992-1.393a1.13 1.13 0 0 1-.664-2.16c4.258-1.293 11.332-1.045 15.807 1.61a1.13 1.13 0 0 1-1.151 1.943z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    badge: 'Reel & Profilo',
    bgGlow: 'from-pink-500/20 to-purple-500/10',
    borderColor: 'border-pink-500/30',
    svg: (
      <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    badge: 'App Sync',
    bgGlow: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'border-cyan-500/30',
    svg: (
      <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    badge: 'Chat Diretta',
    bgGlow: 'from-green-500/20 to-emerald-500/10',
    borderColor: 'border-green-500/30',
    svg: (
      <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    badge: 'Canali & Bot',
    bgGlow: 'from-sky-500/20 to-blue-500/10',
    borderColor: 'border-sky-500/30',
    svg: (
      <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'Twitch',
    badge: 'Live Stream',
    bgGlow: 'from-purple-600/20 to-indigo-600/10',
    borderColor: 'border-purple-500/30',
    svg: (
      <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  },
  {
    name: 'Apple Music',
    badge: 'In-App Audio',
    bgGlow: 'from-rose-500/20 to-pink-500/10',
    borderColor: 'border-rose-500/30',
    svg: (
      <svg className="w-6 h-6 text-rose-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.994 6.129c-.067-.5-.467-.887-.968-.938L8.74 3.766a1.002 1.002 0 0 0-1.102.993v11.758a4.992 4.992 0 0 0-3.642-1.583C1.788 14.934 0 16.722 0 18.934s1.788 4 4 4 4-1.788 4-4V8.89l14-1.4v6.027a4.993 4.993 0 0 0-3.642-1.583c-2.212 0-4 1.788-4 4s1.788 4 4 4 4-1.788 4-4V7.073c0-.441-.318-.813-.746-.944h-.618z" />
      </svg>
    ),
  },
];

const CAROUSEL_APPS_ROW2: AppBrand[] = [
  {
    name: 'Shopify / Safari',
    badge: 'Apple Pay Ready',
    bgGlow: 'from-lime-500/20 to-emerald-500/10',
    borderColor: 'border-lime-500/30',
    svg: (
      <svg className="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.447 2.164a3.642 3.642 0 0 0-.85 2.502c.032.222.094.437.185.641a3.527 3.527 0 0 0 2.55-1.31 3.545 3.545 0 0 0 .848-2.457 3.398 3.398 0 0 0-2.733.624zm4.498 7.032c-.068-.052-1.442-.835-1.428-2.477.017-1.954 1.588-2.888 1.66-2.934-.913-1.336-2.336-1.52-2.842-1.542-1.21-.124-2.366.712-2.981.712-.614 0-1.572-.693-2.584-.674-1.332.02-2.56.774-3.244 1.966-1.383 2.399-.353 5.949.99 7.892.659.949 1.441 2.011 2.467 1.972 1-.038 1.378-.633 2.583-.633 1.206 0 1.548.633 2.584.613 1.071-.019 1.748-.962 2.404-1.918.761-1.109 1.074-2.181 1.092-2.237-.024-.01-.301-.12-1.602-.74z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    badge: 'Profili B2B',
    bgGlow: 'from-blue-600/20 to-sky-600/10',
    borderColor: 'border-blue-500/30',
    svg: (
      <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'Netflix',
    badge: 'Serie TV & Film',
    bgGlow: 'from-red-600/20 to-red-800/10',
    borderColor: 'border-red-600/30',
    svg: (
      <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.398 0v24L9.8 14.733V0H5.398zm8.799 0v9.267L18.6 0h-4.403zm-4.402 14.733L14.197 24h4.405V9.267l-8.804 5.466z" />
      </svg>
    ),
  },
  {
    name: 'Airbnb',
    badge: 'Prenotazioni',
    bgGlow: 'from-rose-500/20 to-pink-600/10',
    borderColor: 'border-rose-500/30',
    svg: (
      <svg className="w-6 h-6 text-rose-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-4.1 0-7.4 3.3-7.4 7.4 0 5.4 6.8 14.4 7.1 14.8.2.2.5.2.7 0 .3-.4 7.1-9.4 7.1-14.8C19.4 3.3 16.1 0 12 0zm0 10.9c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
      </svg>
    ),
  },
  {
    name: 'Substack',
    badge: 'Newsletter',
    bgGlow: 'from-orange-500/20 to-amber-500/10',
    borderColor: 'border-orange-500/30',
    svg: (
      <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    badge: 'Pin & Board',
    bgGlow: 'from-red-500/20 to-rose-600/10',
    borderColor: 'border-red-500/30',
    svg: (
      <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'Discord',
    badge: 'Community',
    bgGlow: 'from-indigo-600/20 to-purple-600/10',
    borderColor: 'border-indigo-500/30',
    svg: (
      <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    badge: 'Post & Profilo',
    bgGlow: 'from-slate-700/20 to-slate-800/10',
    borderColor: 'border-slate-700/40',
    svg: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
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
  // Before vs After interactive phone comparison state
  const [activeComparisonTab, setActiveComparisonTab] = useState<'both' | 'without' | 'with'>('both');

  // ROI Calculator state (taap.it style)
  const [monthlyClicks, setMonthlyClicks] = useState<number>(5000);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(30); // in €

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isPro = currentUser?.plan === 'pro';

  // Calculator calculations
  const trafficLostPercent = 65; // ~65% of traffic lost in in-app browser
  const lostClicks = Math.round((monthlyClicks * trafficLostPercent) / 100);
  const estimatedConversionRate = 0.035; // 3.5% conversion in native app vs 0.8% in in-app
  const recoveredSales = Math.round(lostClicks * estimatedConversionRate);
  const recoveredRevenue = recoveredSales * avgOrderValue;

  const faqs = [
    {
      q: "Cos'è la 'Trappola del Browser In-App' (In-App WebView) di Instagram e TikTok?",
      a: "Quando un utente tocca un link inserito nella tua Bio, nelle Storie o nei post di Instagram, TikTok o Facebook, l'applicazione non apre Safari o Chrome, ma un mini-browser interno (denominato WebView). In questo ambiente isolato l'utente NON è autenticato con il suo account Amazon, YouTube o Google, non ha memorizzato Apple Pay o le carte di credito e deve inserire password complesse. Risultato? Oltre il 65-75% degli utenti abbandona la pagina senza acquistare, iscriversi o interagire."
    },
    {
      q: "Come risolve il problema la tecnologia di DeepDirect?",
      a: "DeepDirect rileva istantaneamente il sistema operativo (iOS di Apple o Android di Google) e l'app social di provenienza in meno di 200 millisecondi. Tramite protocolli avanzati di Universal Links e Android Intent, forza il sistema operativo ad aprire direttamente l'app ufficiale già installata sullo smartphone dell'utente. Qui l'utente è già loggato e può concludere l'acquisto con 1-Click Buy o Apple Pay senza alcuna frizione."
    },
    {
      q: "Cosa succede se l'utente non ha l'app specifica installata sul telefono?",
      a: "Nessun errore e nessuna schermata bloccata! DeepDirect include una tecnologia di Smart Fallback intelligente: se l'applicazione non è presente, forza l'uscita dalla WebView aprendo il vero browser di sistema predefinito (Safari su iPhone, Google Chrome su Android). In questo modo le credenziali salvate nel portachiavi e Apple Pay restano perfettamente accessibili."
    },
    {
      q: "I cookie di affiliazione (es. Amazon Associates) e i parametri UTM vengono conservati?",
      a: "Sì, al 100%. DeepDirect preserva integralmente ogni parametro UTM, tag di affiliazione (come tag=tuoid-21 per Amazon), query string e parametri di tracking per le campagne pubblicitarie Meta Ads o Google Ads. Non perderai mai più una commissione di vendita."
    },
    {
      q: "È conforme alle regole e linee guida di Instagram, TikTok e Amazon?",
      a: "Assolutamente sì. DeepDirect sfrutta i protocolli standard ufficiali raccomandati da Apple (Universal Links) e Google (App Links & Intents) per il routing delle applicazioni su smartphone. Non effettua alcun hacking o scraping illecito ed è conforme al 100% con le norme di Meta e Amazon Associates."
    },
    {
      q: "Posso utilizzare il mio Dominio Personalizzato (es. link.miosito.it)?",
      a: "Certamente! Nel piano PRO puoi collegare il tuo sottodominio aziendale (es. link.iltuobrand.com o go.iltuonome.it) aggiungendo un semplice record CNAME nel pannello DNS del tuo hosting. In questo modo rafforzi l'autorevolezza del tuo marchio e aumenti la fiducia dei tuoi follower al click."
    },
    {
      q: "Come funziona l'attivazione del Piano PRO tramite SamCart?",
      a: "L'attivazione è completamente istantanea e automatizzata. Cliccando su 'Passa a PRO' verrai indirizzato alla checkout page sicura su SamCart. Non appena il pagamento va a buon fine, il webhook ufficiale di SamCart aggiorna il tuo account sbloccando all'istante link e click illimitati, senza alcun intervento manuale."
    },
    {
      q: "Qual è la differenza esatta tra Piano Free e Piano PRO?",
      a: "Il Piano Free è gratuito per sempre e ti permette di gestire fino a 5 Deep Link attivi contemporaneamente con tutte le funzioni di bypass e redirect. Il Piano PRO sblocca l'accesso illimitato: infiniti link, click illimitati senza quote mensili, dominio personalizzato con branding proprietario e assistenza prioritaria."
    }
  ];

  return (
    <div className="space-y-28 py-4 text-slate-100">
      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative overflow-hidden pt-4 pb-4">
        {/* Ambient atmospheric radial glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/15 to-indigo-600/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-10 right-10 w-80 h-80 bg-emerald-500/10 blur-2xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>La Piattaforma #1 di Smart Deep Linking per Creator & Affiliati</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Fai aprire i tuoi link{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              direttamente nell'App
            </span>{' '}
            invece che nel browser dei social.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bypassa il mini-browser interno di <strong>Instagram, TikTok e Facebook</strong>.
            Fai atterrare i tuoi follower nell'app ufficiale (Amazon, YouTube, Spotify) dove sono già loggati con il loro account e <strong>Apple Pay a 1 tocco</strong>.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenCreateModal}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Crea il Tuo Primo Link Gratis</span>
            </button>

            {!isPro ? (
              <button
                onClick={onOpenUpgrade}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Passa a PRO Illimitato (SamCart)</span>
                <ExternalLink className="w-4 h-4 text-emerald-400" />
              </button>
            ) : (
              <button
                onClick={onGoToDashboard}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-sm rounded-xl border border-emerald-500/40 transition-colors flex items-center justify-center gap-2"
              >
                <span>Accedi alla Dashboard PRO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Social Proof Mini Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Nessuna carta richiesta per iniziare
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Compatibile iOS 17/18 & Android
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Cookie di affiliazione 100% salvi
            </span>
          </div>
        </div>

        {/* =========================================================================
            CONTINUOUS INFINITE MOVING LOGO CAROUSEL (Like openup.to)
           ========================================================================= */}
        <div className="mt-14 relative w-full overflow-hidden py-4">
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              Supporto Nativo per Oltre 20+ Applicazioni & Qualsiasi Store
            </p>
          </div>

          {/* Gradient fade masks on left and right for seamless edge appearance */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10" />

          {/* Track 1: Moving left continuously */}
          <div className="flex overflow-hidden py-2 select-none">
            <div className="animate-marquee flex items-center gap-4">
              {/* First loop of row 1 */}
              {CAROUSEL_APPS_ROW1.map((app, i) => (
                <div
                  key={`r1-a-${i}`}
                  className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-br ${app.bgGlow} bg-slate-900/90 border ${app.borderColor} rounded-2xl shadow-lg backdrop-blur-md shrink-0 hover:scale-105 transition-transform cursor-default`}
                >
                  <div className="shrink-0">{app.svg}</div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs sm:text-sm">{app.name}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">{app.badge}</div>
                  </div>
                </div>
              ))}
              {/* Duplicate loop of row 1 for seamless infinite looping */}
              {CAROUSEL_APPS_ROW1.map((app, i) => (
                <div
                  key={`r1-b-${i}`}
                  className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-br ${app.bgGlow} bg-slate-900/90 border ${app.borderColor} rounded-2xl shadow-lg backdrop-blur-md shrink-0 hover:scale-105 transition-transform cursor-default`}
                >
                  <div className="shrink-0">{app.svg}</div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs sm:text-sm">{app.name}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">{app.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Moving right continuously (reverse) */}
          <div className="flex overflow-hidden py-2 select-none mt-2">
            <div className="animate-marquee-reverse flex items-center gap-4">
              {/* First loop of row 2 */}
              {CAROUSEL_APPS_ROW2.map((app, i) => (
                <div
                  key={`r2-a-${i}`}
                  className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-br ${app.bgGlow} bg-slate-900/90 border ${app.borderColor} rounded-2xl shadow-lg backdrop-blur-md shrink-0 hover:scale-105 transition-transform cursor-default`}
                >
                  <div className="shrink-0">{app.svg}</div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs sm:text-sm">{app.name}</div>
                    <div className="text-[10px] text-teal-400 font-semibold">{app.badge}</div>
                  </div>
                </div>
              ))}
              {/* Duplicate loop of row 2 for seamless infinite looping */}
              {CAROUSEL_APPS_ROW2.map((app, i) => (
                <div
                  key={`r2-b-${i}`}
                  className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-br ${app.bgGlow} bg-slate-900/90 border ${app.borderColor} rounded-2xl shadow-lg backdrop-blur-md shrink-0 hover:scale-105 transition-transform cursor-default`}
                >
                  <div className="shrink-0">{app.svg}</div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs sm:text-sm">{app.name}</div>
                    <div className="text-[10px] text-teal-400 font-semibold">{app.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (Technical Simplicity in 3 Steps - Inspired by taap.it)
         ========================================================================= */}
      <section id="come-funziona" className="max-w-5xl mx-auto space-y-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Come Funziona la Magia del Bypass in 3 Passaggi
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Nessuna app da scaricare per i tuoi follower e nessuna riga di codice da programmare. Funziona al 100% in cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 relative hover:border-slate-700 transition-colors">
            <span className="text-5xl font-black text-slate-800 absolute top-5 right-5">01</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Copy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Incolla il Tuo Link Originale</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Incolla il link della tua pagina prodotto Amazon, video YouTube, playlist Spotify o e-commerce. DeepDirect genera subito il tuo Smart Deep Link pronto all'uso.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 relative hover:border-slate-700 transition-colors">
            <span className="text-5xl font-black text-slate-800 absolute top-5 right-5">02</span>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Rilevamento Intelligente OS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quando un utente tocca il link da Instagram o TikTok, il nostro server rileva il sistema operativo (iOS o Android) in &lt;200ms e prepara l'Universal Link nativo.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 relative hover:border-slate-700 transition-colors">
            <span className="text-5xl font-black text-slate-800 absolute top-5 right-5">03</span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Apertura Istantanea In-App</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              L'app nativa si apre all'istante sullo smartphone del follower con il suo profilo già loggato. Se non ha l'app, il fallback apre pulito Safari o Chrome.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BEFORE VS AFTER INTERACTIVE COMPARISON (Visual Smartphone Mockups)
         ========================================================================= */}
      <section id="confronto" className="max-w-5xl mx-auto space-y-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Il Dramma del Browser In-App</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Perché i Tuoi Link Normali Stanno Distruggendo le Tue Vendite
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Guarda la differenza tra cosa vede un tuo follower quando tocca un link normale vs quando utilizzi DeepDirect:
          </p>

          {/* Toggle buttons for comparison views */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => setActiveComparisonTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeComparisonTab === 'both' ? 'bg-slate-800 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              Affiancati
            </button>
            <button
              type="button"
              onClick={() => setActiveComparisonTab('without')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeComparisonTab === 'without' ? 'bg-red-500/20 text-red-300 shadow-sm' : 'hover:text-white'
              }`}
            >
              Senza DeepDirect
            </button>
            <button
              type="button"
              onClick={() => setActiveComparisonTab('with')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeComparisonTab === 'with' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'hover:text-white'
              }`}
            >
              Con DeepDirect
            </button>
          </div>
        </div>

        {/* Dual Phone Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* MOCKUP 1: SENZA DEEPDIRECT (Trappola In-App Browser) */}
          {(activeComparisonTab === 'both' || activeComparisonTab === 'without') && (
            <div className="relative p-6 sm:p-7 bg-slate-900/90 border-2 border-red-500/40 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Senza DeepDirect (Link Normale)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[11px] font-bold">
                  -74% Vendite
                </span>
              </div>

              {/* Visual Simulated Phone Frame */}
              <div className="w-full max-w-[320px] mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl p-3 shadow-2xl space-y-3">
                {/* Fake In-App Browser Header */}
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900 rounded-lg text-[10px] text-slate-400">
                  <span className="truncate">instagram.com/inapp-browser</span>
                  <span className="font-bold text-slate-300">✕</span>
                </div>

                {/* Simulated Content with Friction Warning Overlays */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-red-500/30 space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center font-bold text-sm">
                    🔒
                  </div>
                  <div className="text-xs font-bold text-white">Accedi per Continuare</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    "Inserisci email e password per acquistare con il tuo account Amazon Prime"
                  </p>

                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-500 font-mono text-left">
                    Password dimenticata?
                  </div>

                  <div className="p-2 bg-red-950/40 border border-red-500/40 rounded text-[10px] text-red-300 font-semibold">
                    ❌ L'utente chiude il browser (Abbandono)
                  </div>
                </div>

                {/* Status Bar */}
                <div className="text-center text-[10px] text-slate-500">
                  Sessione anonima e isolata
                </div>
              </div>

              {/* Bullet Points of Friction */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Nessun login salvato:</strong> L'utente deve autenticarsi da zero digitando credenziali complesse.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Niente Apple Pay o 1-Click:</strong> I dati di pagamento salvati nel wallet non sono disponibili.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Cookie e tracking persi:</strong> Se l'utente apre l'app manualmente dopo 1 ora, le tue commissioni svaniscono.</span>
                </div>
              </div>
            </div>
          )}

          {/* MOCKUP 2: CON DEEPDIRECT (App Nativa Ufficiale) */}
          {(activeComparisonTab === 'both' || activeComparisonTab === 'with') && (
            <div className="relative p-6 sm:p-7 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950 border-2 border-emerald-500/60 rounded-3xl space-y-6 shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Con DeepDirect (App Nativa Ufficiale)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  +310% Conversioni
                </span>
              </div>

              {/* Visual Simulated Phone Frame */}
              <div className="w-full max-w-[320px] mx-auto bg-slate-950 border-4 border-emerald-500/40 rounded-3xl p-3 shadow-2xl space-y-3">
                {/* Fake Native App Header */}
                <div className="flex items-center justify-between px-2 py-1.5 bg-emerald-950/40 rounded-lg text-[10px] text-emerald-300 font-semibold">
                  <span>amazon://app/prime</span>
                  <span className="text-emerald-400 font-bold">● Connesso</span>
                </div>

                {/* Simulated Native App UI */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/40 space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-sm">
                    ✨
                  </div>
                  <div className="text-xs font-bold text-white">Bentornato Marco!</div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Spedizione Prime gratuita domani al tuo indirizzo abituale
                  </p>

                  <div className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs shadow-md">
                    Acquista ora con 1-Click
                  </div>

                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded text-[10px] text-emerald-300 font-semibold">
                    ✅ Vendita conclusa in 3 secondi
                  </div>
                </div>

                {/* Status Bar */}
                <div className="text-center text-[10px] text-emerald-400 font-medium">
                  Cookie affiliazione e UTM preservati al 100%
                </div>
              </div>

              {/* Bullet Points of Success */}
              <div className="space-y-2 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Zero login richiesto:</strong> L'utente è già autenticato nell'app Amazon o YouTube sul telefono.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Acquisto immediato a 1 tocco:</strong> Carta memorizzata, Apple Pay e FaceID pronti in 2 secondi.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Commissioni garantite:</strong> Il tuo ID affiliato o tag di tracking viene iniettato direttamente nell'app.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE CONVERSION & REVENUE LOSS CALCULATOR (Inspired by taap.it)
         ========================================================================= */}
      <section id="calcolatore" className="max-w-4xl mx-auto p-6 sm:p-9 bg-slate-900 border border-slate-800 rounded-3xl space-y-8 shadow-2xl relative scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Calcolatore di Vendite & Guadagni Recuperati</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quanti Soldi Stai Perdendo a Causa del Browser In-App?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Sposta i cursori per simulare il traffico dei tuoi link e scoprire quante vendite puoi recuperare ogni mese aprendo l'app nativa.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
          {/* Slider 1: Click Mensili */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Click mensili sui tuoi link social:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>500 click</span>
              <span>25.000 click</span>
              <span>50.000 click</span>
            </div>
          </div>

          {/* Slider 2: Valore Medio Ordine / Commissione */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Valore medio ordine o carrello:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
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
          <div className="p-4 bg-slate-950/80 border border-red-500/30 rounded-2xl space-y-1 text-center">
            <div className="text-xs text-slate-400">Click persi nel browser in-app (~65%)</div>
            <div className="text-2xl font-black text-red-400 font-mono">
              -{lostClicks.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">visitatori bloccati al login</div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-1 text-center">
            <div className="text-xs text-slate-400">Ordini extra recuperati con l'app</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              +{recoveredSales.toLocaleString()} ordini
            </div>
            <div className="text-[10px] text-slate-500">conclusi con 1-Click Buy</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-950/60 to-slate-950 border-2 border-emerald-500 rounded-2xl space-y-1 text-center shadow-lg shadow-emerald-500/10">
            <div className="text-xs text-emerald-300 font-semibold">Guadagno stimato recuperato</div>
            <div className="text-2xl font-black text-white font-mono">
              +{recoveredRevenue.toLocaleString()} € <span className="text-xs font-normal text-slate-400">/ mese</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Il piano si ripaga con 1 solo ordine</div>
          </div>
        </div>

        {/* Call to action inside calculator */}
        <div className="pt-2 text-center">
          <button
            onClick={onOpenCreateModal}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Inizia a Recuperare i Tuoi Guadagni Gratis</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          KEY METRICS / STATS COUNTER BAR
         ========================================================================= */}
      <section className="max-w-5xl mx-auto p-6 sm:p-8 bg-slate-900/80 border border-slate-800 rounded-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              +310%
            </div>
            <div className="text-xs font-semibold text-white">Aumento Conversioni</div>
            <div className="text-[11px] text-slate-400">rispetto al browser social</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white">
              &lt; 200ms
            </div>
            <div className="text-xs font-semibold text-white">Routing Istantaneo</div>
            <div className="text-[11px] text-slate-400">server cloud ultra-rapidi</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              100%
            </div>
            <div className="text-xs font-semibold text-white">Salvataggio Cookie</div>
            <div className="text-[11px] text-slate-400">UTM & commissioni affiliazione</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white">
              0€
            </div>
            <div className="text-xs font-semibold text-white">Inizio Gratuito</div>
            <div className="text-[11px] text-slate-400">5 deep link inclusi subito</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING SECTION: STRICTLY 2 TIERS (Free vs PRO)
         ========================================================================= */}
      <section id="prezzi" className="max-w-4xl mx-auto space-y-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Trasparenza Assoluta</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Due Soli Piani Semplici. Nessun Costo Nascosto.
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Inizia gratis con fino a 5 link per sempre, oppure passa alla versione PRO con link illimitati e dominio personalizzato via SamCart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* FREE TIER */}
          <div className="p-7 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Piano Free</h3>
                  <p className="text-xs text-slate-400">Ideale per testare il servizio e per piccoli creator</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  Gratis Sempre
                </span>
              </div>

              <div className="text-3xl font-black text-white">
                0€ <span className="text-xs font-normal text-slate-400">/ per sempre</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Fino a 5 deep link attivi</strong> contemporaneamente</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bypass automatico del browser in-app (Instagram, TikTok, FB)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Smart Redirect iOS Universal Links & Android Intent</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Statistiche di base su click totali e dispositivi</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-500">
                  <span className="w-4 h-4 text-slate-600 font-bold shrink-0">✕</span>
                  <span>Dominio personalizzato CNAME (esclusivo PRO)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors text-center cursor-pointer"
            >
              Inizia Subito Gratis
            </button>
          </div>

          {/* PRO TIER (SamCart Integration) */}
          <div className="relative p-7 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500 rounded-3xl space-y-6 shadow-2xl shadow-emerald-500/15 flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-3.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-full shadow-md uppercase tracking-wider">
              Consigliato
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                    Piano PRO
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">Massima potenza senza alcun limite</p>
                </div>
              </div>

              <div className="text-3xl font-black text-white">
                Accesso PRO <span className="text-xs font-normal text-slate-400">tramite SamCart</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-200 pt-2 border-t border-emerald-500/20">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">Deep Link ILLIMITATI</strong> (nessun blocco di 5 link)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Click, redirect e visitatori senza limiti di traffico</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dominio personalizzato (<code className="text-emerald-300">link.tuosito.it</code>)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Attivazione immediata automatica con <strong>Webhook SamCart</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Supporto prioritario e aggiornamenti continui</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenUpgrade}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acquista Piano PRO con SamCart</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION (Inspired by taap.it)
         ========================================================================= */}
      <section id="faq" className="max-w-3xl mx-auto space-y-8 scroll-mt-24">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            Domande Frequenti (FAQ)
          </h2>
          <p className="text-sm text-slate-400">
            Tutto ciò che devi sapere sulla tecnologia di DeepDirect e sull'apertura delle app.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white text-sm hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERSION CTA BANNER
         ========================================================================= */}
      <section className="max-w-4xl mx-auto p-8 sm:p-12 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Pronto a Smettere di Regalare il 70% delle Tue Conversioni?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Unisciti ai creator, affiliati ed e-commerce che utilizzano DeepDirect per far atterrare i loro follower direttamente nelle app native.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenCreateModal}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Inizia Subito Gratis (Fino a 5 Link)</span>
            </button>
            <button
              onClick={currentUser ? onGoToDashboard : onOpenAuth}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              {currentUser ? 'Vai alla Tua Dashboard' : 'Accedi al Tuo Account'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
