import React, { useState, useEffect } from 'react';
import {
  X,
  Link2,
  Sparkles,
  Smartphone,
  Globe,
  Compass,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Folder,
  FolderPlus,
  QrCode,
  ArrowLeft,
  Settings,
  Plus,
} from 'lucide-react';
import {
  detectPlatform,
  generateProtocols,
  normalizeUrl,
  slugify,
  getPlatformName,
} from '../lib/deepLinkEngine';
import { DeepLink, TargetMode } from '../types/deepLink';

interface LinkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Partial<DeepLink>) => Promise<void>;
  initialData?: DeepLink | null;
  existingFolders?: string[];
  customBaseUrl?: string;
  onOpenQrModal?: (link: DeepLink) => void;
}

export const LinkGeneratorModal: React.FC<LinkGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingFolders = [],
  customBaseUrl,
  onOpenQrModal,
}) => {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [targetMode, setTargetMode] = useState<TargetMode>('smart');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('No project');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [generateQr, setGenerateQr] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available unique folders
  const allFolderOptions = Array.from(
    new Set([
      'No project',
      'E-Commerce',
      'Affiliazioni',
      'YouTube',
      'Musica',
      'Social Media',
      ...existingFolders.filter((f) => f && f !== 'No project'),
    ])
  );

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.originalUrl || '');
      setSlug(initialData.slug || '');
      setTargetMode(initialData.targetMode || 'smart');
      setTitle(initialData.title || '');
      setFolder(initialData.folder || initialData.project || 'No project');
      setIsCreatingNewFolder(false);
      setNewFolderName('');
      setDescription(initialData.description || '');
      setImageUrl(initialData.imageUrl || '');
      setUtmSource(initialData.utm?.source || '');
      setUtmMedium(initialData.utm?.medium || '');
      setUtmCampaign(initialData.utm?.campaign || '');
      setGenerateQr(false);
    } else {
      setUrl('');
      setSlug('');
      setTargetMode('smart');
      setTitle('');
      setFolder('No project');
      setIsCreatingNewFolder(false);
      setNewFolderName('');
      setDescription('');
      setImageUrl('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setGenerateQr(false);
      setError(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const currentPlatform = detectPlatform(url);
  const protocols = url ? generateProtocols(url, targetMode) : null;

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setError(null);
    if (!slug && newUrl) {
      const plat = detectPlatform(newUrl);
      try {
        const parsed = new URL(normalizeUrl(newUrl));
        const pathPart = parsed.pathname.replace(/^\//, '').split('/')[0] || '';
        setSlug(slugify(pathPart || plat));
      } catch {
        setSlug(slugify(plat));
      }
    }
    if (!title && newUrl) {
      const plat = detectPlatform(newUrl);
      setTitle(plat === 'generic' ? 'La Mia Pagina Web' : `${getPlatformName(plat)} Link`);
    }
  };

  const handleFolderChange = (val: string) => {
    if (val === '__new__') {
      setIsCreatingNewFolder(true);
      setFolder('');
    } else {
      setIsCreatingNewFolder(false);
      setFolder(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Inserisci un URL valido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const resolvedFolder = isCreatingNewFolder
        ? newFolderName.trim() || 'No project'
        : folder || 'No project';

      const finalSlug = slugify(slug) || Math.random().toString(36).substring(2, 7);
      const finalTitle = title.trim() || `${getPlatformName(currentPlatform)} Link`;

      const savedLinkPayload: Partial<DeepLink> = {
        originalUrl: normalizeUrl(url),
        slug: finalSlug,
        targetMode,
        title: finalTitle,
        folder: resolvedFolder === 'No project' ? '' : resolvedFolder,
        project: resolvedFolder === 'No project' ? '' : resolvedFolder,
        description,
        imageUrl,
        utm: {
          source: utmSource || undefined,
          medium: utmMedium || undefined,
          campaign: utmCampaign || undefined,
        },
      };

      await onSave(savedLinkPayload);

      // If Generate QR Code was toggled, open the QR modal
      if (generateQr && onOpenQrModal) {
        onOpenQrModal(savedLinkPayload as DeepLink);
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract clean domain for OpenUp-styled domain selector
  const defaultDomain = typeof window !== 'undefined' ? window.location.host : 'tuodominio.com';
  const customDomainClean = customBaseUrl ? customBaseUrl.replace(/^https?:\/\//i, '') : null;
  const activeDomain = customDomainClean || defaultDomain;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-slate-100">
        {/* OpenUp-Styled Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Indietro"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                {initialData ? 'Modifica link' : 'Create a new link'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          {/* 1. Destination URL * */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Destination URL <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Paste my link (es. https://...)"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
              />
              {currentPlatform !== 'generic' && (
                <div className="absolute right-3 top-3 text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  {getPlatformName(currentPlatform)}
                </div>
              )}
            </div>
          </div>

          {/* 2. Domain & Customize link (Split input like OpenUp screenshot) */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              {/* Domain part */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Domain</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200">
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate font-mono font-medium">{activeDomain}</span>
                </div>
              </div>

              {/* Customize link part */}
              <div className="sm:col-span-7 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Customize link</label>
                <div className="flex items-center bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus-within:border-indigo-500 rounded-xl overflow-hidden transition-colors">
                  <span className="px-3 text-xs text-slate-500 font-mono select-none">/</span>
                  <input
                    type="text"
                    placeholder="my-link"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full py-2.5 pr-3 text-sm text-white bg-transparent focus:outline-none font-mono placeholder:text-slate-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Leave blank to auto-generate</p>
              </div>
            </div>

            {/* Quick suggestion hint if custom domain is configured */}
            {customDomainClean && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 pt-0.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Usando dominio personalizzato: <strong>{customDomainClean}</strong></span>
              </div>
            )}
          </div>

          {/* 3. Link title (Explicit user request) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Link title
            </label>
            <input
              type="text"
              placeholder="Untitled (es. Offerta Primavera, Il mio sito, ecc.)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          {/* 4. Project / Cartella (Explicit user request) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>Project / Cartella</span>
            </label>

            {!isCreatingNewFolder ? (
              <div className="relative">
                <select
                  value={folder}
                  onChange={(e) => handleFolderChange(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer pr-10"
                >
                  {allFolderOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt === 'No project' ? '📁 No project (Nessuna cartella)' : `📁 ${opt}`}
                    </option>
                  ))}
                  <option value="__new__" className="bg-slate-900 text-indigo-300 font-semibold">
                    + Crea nuova cartella...
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Nome della nuova cartella (es. Campagne 2026)..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      autoFocus
                      className="w-full px-4 py-2.5 bg-slate-950/80 border border-indigo-500/50 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newFolderName.trim()) {
                        setFolder(newFolderName.trim());
                        setIsCreatingNewFolder(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Salva Cartella
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewFolder(false);
                      setFolder('No project');
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Organizza i tuoi link in gruppi o campagne per filtrarli facilmente nella dashboard.
            </p>
          </div>

          {/* 5. Advanced settings (Collapsible accordion with ⚙️ icon) */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Advanced settings</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-5 space-y-5 border-t border-slate-800 bg-slate-950/80">
                {/* Target Mode Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Comportamento Apertura su Smartphone
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTargetMode('smart')}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        targetMode === 'smart'
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-white">Smart Auto</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Apre l'app nativa se supportata, altrimenti esce nel browser predefinito.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetMode('system_browser')}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        targetMode === 'system_browser'
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs font-bold text-white">Safari / Chrome</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Bypassa WebView in-app per usare Apple Pay, Google Pay e login salvati.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetMode('native_app')}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        targetMode === 'native_app'
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-white">App Nativa</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Lancia direttamente l'app ufficiale installata su iOS e Android.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Social Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Descrizione per Social Preview (WhatsApp / Facebook / X)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descrizione accattivante mostrata nell'anteprima card..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                </div>

                {/* UTM Parameters */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Tracciamento UTM per Google Analytics
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">UTM Source</span>
                      <input
                        type="text"
                        placeholder="instagram_bio"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">UTM Medium</span>
                      <input
                        type="text"
                        placeholder="social"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">UTM Campaign</span>
                      <input
                        type="text"
                        placeholder="promo_2026"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. Generate a QR Code Toggle (Matching OpenUp screenshot) */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">Generate a QR Code</span>
                <span className="text-[11px] text-slate-400 block">
                  Mostra subito il QR code scaricabile appena il link viene salvato.
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={generateQr}
              onClick={() => setGenerateQr(!generateQr)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                generateQr ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  generateQr ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Protocols diagnostic inspector */}
          {protocols && (
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Bypass automatico attivo per: <strong>{protocols.platformName}</strong>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Pronto</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Save Changes'
                : 'Create link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
