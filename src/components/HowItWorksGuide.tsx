import React from 'react';
import {
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Zap,
  Globe,
  DollarSign,
  ArrowRight,
  Code,
  Layers,
} from 'lucide-react';

export const HowItWorksGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Affirmation */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
          <CheckCircle className="w-3.5 h-3.5" />
          Risposta Definitiva: SÌ, Assolutamente!
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
          Puoi Creare e Gestire la Tua App di Deep Link Senza Pagare Abbonamenti Mensili
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Servizi come <strong>URLGenius</strong>, <strong>OpenInApp</strong>, <strong>Switchy</strong> o{' '}
          <strong>Geniuslink</strong> fanno pagare dai <strong>30€ ai 100€ al mese</strong> per una funzione
          tecnologica che ora possiedi e controlli al 100% all'interno di questa applicazione (
          <strong>DeepDirect</strong>).
        </p>
      </div>

      {/* The Problem */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Il Problema: La Trappola dei Browser "In-App" (WebView)</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Quando condividi un normale link sul tuo profilo Instagram, TikTok o Facebook, l'applicazione non
          apre Safari o Chrome. Apre invece un <strong>browser integrato (WebView)</strong> interno all'app.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-red-400 font-bold text-xs mb-1">❌ Zero Login Salvati</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              L'utente risulta disconnesso da Amazon, YouTube o dal tuo negozio. Chiedere di digitare username
              e password causa oltre il <strong>70% di abbandoni</strong>!
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-red-400 font-bold text-xs mb-1">❌ Niente Apple / Google Pay</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              I WebView bloccano spesso l'autenticazione biometrica (FaceID / TouchID) per completare acquisti
              in 1-Click.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-red-400 font-bold text-xs mb-1">❌ Cookie e Tracciamenti Persi</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Se l'utente chiude l'app, il carrello o la pagina scompare e non può ritrovarla tra i preferiti di
              Safari o Chrome.
            </p>
          </div>
        </div>
      </div>

      {/* The Solution */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
          <Zap className="w-5 h-5" />
          <span>Come Funziona il Nostro Motore di Bypass (La Tecnologia DeepDirect)</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Quando un utente tocca un link generato da questa app (es.{' '}
          <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">/l/mio-link</code>), il nostro
          server esegue in tempo reale 3 operazioni in meno di 150 millisecondi:
        </p>

        <div className="space-y-4 pt-2">
          {/* Step 1 */}
          <div className="flex gap-3.5 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
              1
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                Rilevamento Immediato dell'Ambiente (User-Agent Sniffing)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Il server analizza se il click proviene da un iPhone o da un telefono Android, e se è dentro
                Instagram, TikTok, Facebook, WhatsApp o un browser desktop.
              </p>
            </div>
          </div>

          {/* Step 2 Android */}
          <div className="flex gap-3.5 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
              2
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                Bypass su Android: Il Protocollo Intent
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Su Android viene lanciato uno speciale URI Intent (es.{' '}
                <code className="text-emerald-300 font-mono text-[11px]">
                  intent://...#Intent;scheme=https;package=com.android.chrome;end;
                </code>
                ). Il sistema operativo Android interpreta questa istruzione come un ordine imperativo ad uscire
                dalla sandbox di Instagram/TikTok per aprire Chrome o l'app ufficiale!
              </p>
            </div>
          </div>

          {/* Step 3 iOS */}
          <div className="flex gap-3.5 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/30">
              3
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                Bypass su iOS (iPhone/iPad): URL Schemes & Gateway Bridge
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se il link punta a un'app supportata (Amazon, YouTube, Spotify), invia il Custom Scheme nativo
                registrato nel sistema iOS. Per il tuo sito web personale, serve la pagina di interscambio con
                indicatore visivo animato che guida l'utente a toccare i 3 puntini (...) per aprire subito in
                Safari.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Confronto Costi: DeepDirect vs App Commerciali
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Funzionalità</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">DeepDirect (La Tua App)</th>
                <th className="py-2.5 px-3 text-slate-400">URLGenius / OpenInApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium">Costo Mensile</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">0 € (Gratis per sempre)</td>
                <td className="py-2.5 px-3 text-red-400 font-medium">Da 29$ a 99$ / mese</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Limite di Click Mensili</td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">Illimitati</td>
                <td className="py-2.5 px-3">Blocco a 2.000 / 5.000 click</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Bypass Android Chrome & In-App</td>
                <td className="py-2.5 px-3 text-emerald-400">Sì, automatico con Intent</td>
                <td className="py-2.5 px-3">Sì</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Supporto App Native (Amazon, YT, Spotify)</td>
                <td className="py-2.5 px-3 text-emerald-400">Sì, tutti i protocolli</td>
                <td className="py-2.5 px-3">Sì</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Proprietà dei Dati e dei Link</td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">100% Tuoi</td>
                <td className="py-2.5 px-3">Sui loro server proprietari</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Generatore QR Code Integrato</td>
                <td className="py-2.5 px-3 text-emerald-400">Sì, istantaneo PNG/SVG</td>
                <td className="py-2.5 px-3">Spesso a pagamento extra</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Practical Tutorial */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Come Iniziare a Usare i Tuoi Deep Link Oggi Stesso
        </h3>

        <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300 leading-relaxed">
          <li>
            Vai nella schermata <strong>"I Tuoi Deep Link"</strong> e incolla il link della tua pagina web o
            del tuo negozio.
          </li>
          <li>
            Scegli il target: <strong>"Browser Safari / Chrome"</strong> per il tuo sito o negozio, oppure{' '}
            <strong>"Forza App Nativa"</strong> se è un link Amazon o YouTube.
          </li>
          <li>
            Copia il link breve generato (es. <code className="text-indigo-300 font-mono">/l/mio-negozio</code>)
            e incollalo nella <strong>Bio di Instagram</strong>, nelle <strong>Storie</strong>, o nella{' '}
            <strong>Bio di TikTok</strong>.
          </li>
          <li>
            I visitatori che cliccheranno sul link non rimarranno più intrappolati nel webview di Instagram,
            garantendoti <strong>più conversioni, vendite e follower</strong>!
          </li>
        </ol>
      </div>
    </div>
  );
};
