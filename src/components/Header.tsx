import React from 'react';
import { ExternalLink, Link2, Plus, Sparkles, Globe } from 'lucide-react';

interface HeaderProps {
  currentTab: 'links' | 'simulator' | 'guide' | 'analytics' | 'deploy';
  onTabChange: (tab: 'links' | 'simulator' | 'guide' | 'analytics' | 'deploy') => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                DeepDirect
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-indigo-400 font-medium">
                Deep Link Engine
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('links')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'links'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              I Tuoi Deep Link
            </button>
            <button
              onClick={() => onTabChange('simulator')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'simulator'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Simulatore In-App
            </button>
            <button
              onClick={() => onTabChange('deploy')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'deploy'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Dominio & Deploy (0€)
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'analytics'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Statistiche & Click
            </button>
            <button
              onClick={() => onTabChange('guide')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'guide'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Come Funziona (Guida)
            </button>
          </nav>

          {/* Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Deep Link</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => onTabChange('links')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'links' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            I Tuoi Link
          </button>
          <button
            onClick={() => onTabChange('simulator')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'simulator' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Simulatore
          </button>
          <button
            onClick={() => onTabChange('deploy')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'deploy' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Dominio & Deploy
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'analytics' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Statistiche
          </button>
          <button
            onClick={() => onTabChange('guide')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'guide' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            Guida
          </button>
        </div>
      </div>
    </header>
  );
};
