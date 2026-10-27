import React, { useState } from 'react';
import {
  Smartphone,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  MoreVertical,
  X,
  Share,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { DeepLink, SupportedPlatform } from '../types/deepLink';
import { generateProtocols, getPlatformName } from '../lib/deepLinkEngine';

interface DeviceSimulatorProps {
  links: DeepLink[];
  selectedLink?: DeepLink | null;
}

type SimulationEnvironment = 'instagram' | 'tiktok' | 'facebook' | 'safari' | 'chrome';

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  links,
  selectedLink: initialSelected,
}) => {
  const [selectedLinkId, setSelectedLinkId] = useState<string>(
    initialSelected?.id || (links[0] ? links[0].id : '')
  );
  const [env, setEnv] = useState<SimulationEnvironment>('instagram');
  const [isSimulating, setIsSimulating] = useState(false);
  const [step, setStep] = useState<'idle' | 'in_app' | 'redirecting' | 'escaped'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const currentLink = links.find((l) => l.id === selectedLinkId) || links[0];
  const protocols = currentLink
    ? generateProtocols(currentLink.originalUrl, currentLink.targetMode)
    : null;

  const runSimulation = () => {
    setIsSimulating(true);
    setStep('in_app');
    setLogs([
      `[1/4] Utente clicca sul link all'interno di ${getEnvName(env)}...`,
      `[2/4] Intercettato User-Agent: ${getUserAgentSnippet(env)}`,
    ]);

    setTimeout(() => {
      setStep('redirecting');
      if (env === 'chrome' || (env !== 'safari' && env !== 'instagram' && env !== 'tiktok')) {
        setLogs((prev) => [
          ...prev,
          `[3/4] Esecuzione Intent Android: ${protocols?.androidIntent}`,
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          `[3/4] Rilevato iOS: Caricamento Gateway con trigger protocollo ${protocols?.iosScheme}`,
        ]);
      }
    }, 900);

    setTimeout(() => {
      setStep('escaped');
      setIsSimulating(false);
      setLogs((prev) => [
        ...prev,
        `[4/4] SUCCESSO! WebView in-app bypassato. Apertura in ${
          currentLink.targetMode === 'native_app' && currentLink.platform !== 'generic'
            ? 'Applicazione Nativa Ufficiale'
            : env === 'chrome'
            ? 'Google Chrome di Sistema'
            : 'Safari di Sistema'
        }!`,
      ]);
    }, 1800);
  };

  const resetSimulation = () => {
    setStep('idle');
    setLogs([]);
    setIsSimulating(false);
  };

  const getEnvName = (e: SimulationEnvironment) => {
    switch (e) {
      case 'instagram':
        return 'Instagram In-App Browser';
      case 'tiktok':
        return 'TikTok In-App Browser';
      case 'facebook':
        return 'Facebook In-App Browser';
      case 'safari':
        return 'Mobile Safari (iOS)';
      case 'chrome':
        return 'Google Chrome (Android)';
    }
  };

  const getUserAgentSnippet = (e: SimulationEnvironment) => {
    switch (e) {
      case 'instagram':
        return 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Mobile/15E148 Instagram 320.0';
      case 'tiktok':
        return 'Mozilla/5.0 (Linux; Android 14) Mobile TikTok/33.2.0';
      case 'facebook':
        return 'Mozilla/5.0 (iPhone) Mobile FBAN/FBIOS;FBAV/450.0.0';
      case 'safari':
        return 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Version/17.4 Mobile/15E148 Safari/604.1';
      case 'chrome':
        return 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/124.0.0.0 Mobile';
    }
  };

  if (!currentLink) {
    return (
      <div className="p-8 text-center text-slate-400">
        Nessun deep link disponibile. Crea prima un link!
      </div>
    );
  }

  if (!currentLink || links.length === 0) {
    return (
      <div className="space-y-6">
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Nessun deep link da simulare</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Crea il tuo primo deep link personalizzato per testare la simulazione in tempo reale di apertura su Instagram, TikTok o browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            Simulatore Live di Bypass In-App
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Testa in tempo reale come si comporta il tuo deep link quando un utente lo tocca nella bio di
            Instagram, su TikTok, o su Facebook. Guarda come sfugge dalla trappola del webview.
          </p>
        </div>

        {/* Link Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Link da testare:</label>
          <select
            value={selectedLinkId}
            onChange={(e) => {
              setSelectedLinkId(e.target.value);
              resetSimulation();
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            {links.map((link) => (
              <option key={link.id} value={link.id}>
                /l/{link.slug} ({link.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Device Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-[320px] h-[640px] bg-slate-950 rounded-[44px] border-[6px] border-slate-700 shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-800">
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-0 inset-x-0 h-6 flex items-center justify-center z-30 pointer-events-none">
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-between px-3">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-900"></div>
              </div>
            </div>

            {/* In-App Browser Chrome Header */}
            <div className="pt-7 pb-2 px-3 bg-slate-900 border-b border-slate-800 text-white z-20">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={resetSimulation}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Chiudi webview"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-[11px] truncate max-w-[170px]">
                    {currentLink.slug}.deepdirect.app
                  </span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    Bypass Engine
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* The famous 3 dots in Instagram */}
                  <div
                    className={`p-1 rounded text-slate-400 ${
                      step === 'in_app' ? 'text-amber-400 bg-amber-400/20 ring-2 ring-amber-400 animate-pulse' : ''
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 bg-slate-950 p-4 flex flex-col justify-between overflow-y-auto relative">
              {step === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
                    <Play className="w-6 h-6 ml-0.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{currentLink.title}</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Fai clic sul pulsante in basso per avviare la simulazione di apertura in {getEnvName(env)}.
                  </p>
                  <button
                    onClick={runSimulation}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Simula Clic in Bio
                  </button>
                </div>
              )}

              {step === 'in_app' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-3 relative">
                  {/* Pulsing visual indicator pointing to 3 dots */}
                  <div className="absolute top-2 right-1 flex flex-col items-end animate-bounce">
                    <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow">
                      Apri nel Browser
                    </span>
                    <span className="text-amber-400 mr-2">▲</span>
                  </div>

                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h4 className="text-xs font-bold text-white mb-1">Intercettazione In-App...</h4>
                  <p className="text-[11px] text-slate-400 mb-4">
                    Rilevato browser {env.toUpperCase()}. Generazione protocollo nativo in corso...
                  </p>
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-left text-[10px] font-mono text-slate-400">
                    <div className="text-indigo-400 font-semibold mb-1">
                      Destinazione: {getPlatformName(currentLink.platform)}
                    </div>
                    <div className="truncate">{currentLink.originalUrl}</div>
                  </div>
                </div>
              )}

              {step === 'redirecting' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Bypassando il WebView...</h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Lancio comando OS: <br />
                    <code className="text-[10px] text-cyan-300 font-mono">
                      {protocols?.platform === 'generic' ? 'Intent / Safari Escape' : protocols?.iosScheme}
                    </code>
                  </p>
                </div>
              )}

              {step === 'escaped' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 mb-1">
                    Bypass Completato!
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">
                    {currentLink.targetMode === 'native_app' && currentLink.platform !== 'generic'
                      ? `Aperto nell'App ${getPlatformName(currentLink.platform)}`
                      : env === 'chrome'
                      ? 'Aperto in Google Chrome di Sistema'
                      : 'Aperto in Safari di Sistema'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
                    L'utente non è più intrappolato nel webview. Le sue password salvate, Apple Pay e carrello
                    sono subito disponibili!
                  </p>

                  <button
                    onClick={runSimulation}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Ripeti Simulazione
                  </button>
                </div>
              )}

              {/* Bottom Phone Indicator */}
              <div className="pt-2 flex justify-center">
                <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Environment Controls & Protocol Inspector */}
        <div className="lg:col-span-7 space-y-5">
          {/* Environment Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Scegli l'ambiente in-app da simulare:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setEnv('instagram');
                  resetSimulation();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  env === 'instagram'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-pink-400 mb-0.5">📸 Instagram</div>
                <div className="text-[11px] text-slate-400">Bio & Stories Webview</div>
              </button>

              <button
                onClick={() => {
                  setEnv('tiktok');
                  resetSimulation();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  env === 'tiktok'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-cyan-400 mb-0.5">🎵 TikTok</div>
                <div className="text-[11px] text-slate-400">Bio Link In-App</div>
              </button>

              <button
                onClick={() => {
                  setEnv('facebook');
                  resetSimulation();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  env === 'facebook'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-blue-400 mb-0.5">📘 Facebook</div>
                <div className="text-[11px] text-slate-400">Post & Ad In-App</div>
              </button>

              <button
                onClick={() => {
                  setEnv('chrome');
                  resetSimulation();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  env === 'chrome'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400 mb-0.5">🌐 Android Chrome</div>
                <div className="text-[11px] text-slate-400">Browser di Sistema</div>
              </button>

              <button
                onClick={() => {
                  setEnv('safari');
                  resetSimulation();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  env === 'safari'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-indigo-400 mb-0.5">🧭 iOS Safari</div>
                <div className="text-[11px] text-slate-400">Browser Apple Nativo</div>
              </button>
            </div>
          </div>

          {/* Protocol Mechanics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Protocolli Tecnici Generati
              </h3>
              <span className="text-[11px] text-indigo-400 font-medium">
                Piattaforma: {getPlatformName(currentLink.platform)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>Android OS Intent URI (Bypass Automatico)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Chrome Intent</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono break-all select-all bg-slate-900 p-2 rounded border border-slate-800/80">
                  {protocols?.androidIntent}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  L'istruzione <code className="text-slate-300">#Intent;package=...</code> costringe Android ad
                  abbandonare il Webview e avviare l'app esterna.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-indigo-400 mb-1 flex items-center justify-between">
                  <span>iOS URL Scheme / Universal Link</span>
                  <span className="text-[10px] text-slate-500 font-mono">Apple Scheme</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono break-all select-all bg-slate-900 p-2 rounded border border-slate-800/80">
                  {protocols?.iosScheme}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Attiva il registered custom scheme in iOS per aprire l'applicazione nativa corrispondente.
                </p>
              </div>
            </div>
          </div>

          {/* Execution Telemetry Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Telemetria di Esecuzione del Simulatore
            </h3>
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs space-y-1.5 min-h-[100px]">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-xs italic">
                  Premi "Simula Clic in Bio" sul telefono per osservare i passaggi del reindirizzamento...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`text-[11px] leading-relaxed ${
                      log.includes('SUCCESSO') ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
