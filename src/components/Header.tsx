import React, { useState } from 'react';
import { Link2, Plus, User, LogOut, Zap, Shield, ChevronDown, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types/deepLink';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTab: 'links' | 'analytics';
  onTabChange: (tab: 'links' | 'analytics') => void;
  onOpenCreateModal: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenUpgrade: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateModal,
  currentUser,
  onOpenAuth,
  onOpenUpgrade,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isPro = currentUser?.plan === 'pro';

  const handleLogoClick = () => {
    if (!currentUser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onTabChange('links');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Zone */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            title="Torna all'inizio"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  DeepDirect
                </span>
                {currentUser && (
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      isPro
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isPro ? '⭐ PRO' : `Free: ${currentUser.currentLinkCount || 0}/5`}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Deep Link Engine & Commercial SaaS
              </span>
            </div>
          </div>

          {/* Navigation Links: When LOGGED IN, show platform tabs */}
          {currentUser && (
            <nav className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => onTabChange('links')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'links'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                I Tuoi Deep Link
              </button>
              <button
                onClick={() => onTabChange('analytics')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'analytics'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Statistiche & Click
              </button>
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Passa a modalità scura (Dark)' : 'Passa a modalità chiara (Light)'}
              aria-label="Cambia tema chiaro/scuro"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Upgrade Button if not Pro */}
            {!isPro && (
              <button
                onClick={onOpenUpgrade}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-400/20 transition-all hover:scale-105 whitespace-nowrap cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Passa a PRO</span>
              </button>
            )}

            {/* Create Link Button: ONLY when logged in */}
            {currentUser && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Deep Link</span>
              </button>
            )}

            {/* User Profile / Auth Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline-block max-w-[100px] truncate font-medium">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{currentUser.name || 'Utente'}</div>
                      <div className="text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Shield className="w-3 h-3" />
                        <span>Piano: {isPro ? 'PRO (Illimitato)' : `Free (${currentUser.currentLinkCount || 0}/5)`}</span>
                      </div>
                    </div>

                    <button
                      onClick={onOpenUpgrade}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isPro ? 'Dettagli Piano PRO' : 'Passa a PRO (SamCart)'}</span>
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Esci dall'account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/20 transition-all hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar: When logged in, show platform tabs */}
        {currentUser && (
          <div className="flex sm:hidden overflow-x-auto py-2 gap-2 border-t border-slate-200 dark:border-slate-800/60 no-scrollbar items-center">
            <button
              onClick={() => onTabChange('links')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                currentTab === 'links'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              I Tuoi Link
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Statistiche
            </button>
            {!isPro && (
              <button
                onClick={onOpenUpgrade}
                className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500 text-slate-950 whitespace-nowrap ml-auto cursor-pointer"
              >
                ⚡ PRO
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
