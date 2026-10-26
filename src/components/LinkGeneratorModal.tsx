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
} from 'lucide-react';
import {
  detectPlatform,
  generateProtocols,
  normalizeUrl,
  slugify,
  getPlatformName,
} from '../lib/deepLinkEngine';
import { DeepLink, SupportedPlatform, TargetMode } from '../types/deepLink';

interface LinkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Partial<DeepLink>) => Promise<void>;
  initialData?: DeepLink | null;
}

export const LinkGeneratorModal: React.FC<LinkGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [targetMode, setTargetMode] = useState<TargetMode>('smart');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.originalUrl);
      setSlug(initialData.slug);
      setTargetMode(initialData.targetMode);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setImageUrl(initialData.imageUrl || '');
      setUtmSource(initialData.utm?.source || '');
      setUtmMedium(initialData.utm?.medium || '');
      setUtmCampaign(initialData.utm?.campaign || '');
    } else {
      setUrl('');
      setSlug('');
      setTargetMode('smart');
      setTitle('');
      setDescription('');
      setImageUrl('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Inserisci un URL valido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        originalUrl: normalizeUrl(url),
        slug: slugify(slug) || Math.random().toString(36).substring(2, 7),
        targetMode,
        title: title || `${getPlatformName(currentPlatform)} Link`,
        description,
        imageUrl,
        utm: {
          source: utmSource || undefined,
          medium: utmMedium || undefined,
          campaign: utmCampaign || undefined,
        },
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetUrl: string, presetTitle: string, mode: TargetMode) => {
    setUrl(presetUrl);
    setTitle(presetTitle);
    setSlug(slugify(presetTitle));
    setTargetMode(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? 'Modifica Deep Link' : 'Crea Nuovo Deep Link'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trasforma il tuo link in un deep link che bypassa i webview di Instagram, TikTok e Facebook.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Quick Fill */}
        {!initialData && (
          <div className="px-6 pt-4 pb-1 bg-slate-900/50 border-b border-slate-800/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Prova subito con un esempio reale:
            </div>
            <div className="flex flex-wrap gap-2 pb-3">
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'https://miosito.it/promozione',
                    'Mio Negozio Online',
                    'system_browser'
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
              >
                🌐 Sito Web / E-Commerce
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'https://www.amazon.it/dp/B08N5WRWNW',
                    'Apple MacBook su Amazon',
                    'native_app'
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-md transition-colors"
              >
                📦 Prodotto Amazon
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'Video YouTube Ufficiale',
                    'native_app'
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-red-400 rounded-md transition-colors"
              >
                ▶️ Video YouTube
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
                    'Playlist Spotify',
                    'native_app'
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-md transition-colors"
              >
                🎧 Musica Spotify
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Target URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL di Destinazione (Link originale) *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://tuosito.it, amazon.it, youtube.com, spotify..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              {currentPlatform !== 'generic' && (
                <div className="absolute right-3 top-2.5 text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  {getPlatformName(currentPlatform)}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Inserisci l'indirizzo della tua pagina web, negozio, o profilo social.
            </p>
          </div>

          {/* Target Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Comportamento all'apertura su smartphone *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTargetMode('smart')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  targetMode === 'smart'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Smart Auto</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Apre l'app nativa se supportata (Amazon, Spotify...), altrimenti forza il browser di sistema.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTargetMode('system_browser')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  targetMode === 'system_browser'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Browser Safari / Chrome</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bypassa sempre il webview in-app per usare Apple Pay, Google Pay e login salvati.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTargetMode('native_app')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  targetMode === 'native_app'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Forza App Nativa</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tenta sempre il lancio dell'app ufficiale installata sul telefono dell'utente.
                </p>
              </button>
            </div>
          </div>

          {/* Custom Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slug Personalizzato (Link Breve)
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500">
                <span className="px-3 text-xs text-slate-500 select-none bg-slate-900 border-r border-slate-800 py-2.5">
                  /l/
                </span>
                <input
                  type="text"
                  placeholder="mio-link"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Titolo di Riconoscimento
              </label>
              <input
                type="text"
                placeholder="es. Offerta Lampo Instagram"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Generated Protocols Inspector */}
          {protocols && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Protocolli Generati dal Motore Deep Link:
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Bypass Attivo</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
                <div className="truncate">
                  <strong className="text-slate-200">Android Intent:</strong>{' '}
                  <span className="text-cyan-400">{protocols.androidIntent}</span>
                </div>
                <div className="truncate">
                  <strong className="text-slate-200">iOS Scheme:</strong>{' '}
                  <span className="text-indigo-400">{protocols.iosScheme}</span>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Accordion (UTM, Social Previews) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <span>Parametri Avanzati (Tag UTM e Social Preview Card)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-slate-950 space-y-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Descrizione per Social Preview (WhatsApp / Facebook / Twitter)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descrizione accattivante visibile quando condividi il link..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">UTM Source</label>
                    <input
                      type="text"
                      placeholder="es. instagram_bio"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">UTM Medium</label>
                    <input
                      type="text"
                      placeholder="es. social / story"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">UTM Campaign</label>
                    <input
                      type="text"
                      placeholder="es. promo_2026"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Genera Deep Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
