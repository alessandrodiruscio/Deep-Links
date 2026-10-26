import React, { useState } from 'react';
import {
  Globe,
  Cloud,
  Server,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { DeepLink } from '../types/deepLink';

interface DeployGuideProps {
  links: DeepLink[];
  customBaseUrl: string;
  onSaveCustomBaseUrl: (url: string) => void;
}

export const DeployGuide: React.FC<DeployGuideProps> = ({
  links,
  customBaseUrl,
  onSaveCustomBaseUrl,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState(customBaseUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = domainInput.trim().replace(/\/$/, '');
    if (cleaned && !/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }
    onSaveCustomBaseUrl(cleaned);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Reassurance Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Configurazione 1 Sola Volta con Record CNAME
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Esattamente come nell'app che usi: 1 Solo Record DNS e Funziona per Sempre
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>Non devi aggiornare alcun codice ogni volta che crei un link!</strong> Proprio come con
          URLGenius o OpenInApp, imposti il record <strong>CNAME</strong> nel tuo hosting <strong>una sola volta</strong>.
          Da quel momento in poi, entri in questa dashboard, crei qualsiasi nuovo link e sarà attivo all'istante
          sul tuo dominio (es. <code className="text-emerald-400 font-mono">link.tuosito.it/l/...</code>) senza toccare più nulla!
        </p>
      </div>

      {/* Step 1: Input your domain */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Globe className="w-5 h-5 text-indigo-400" />
          <span>Passo 1: Inserisci il Tuo Sottodominio Personalizzato</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Inserisci l'indirizzo con cui vuoi condividere i tuoi deep link (es.{' '}
          <code className="text-slate-300 font-mono">https://link.iltuosito.it</code> o{' '}
          <code className="text-slate-300 font-mono">https://go.iltuosito.it</code>). Tutti i tasti "Copia"
          e i codici QR utilizzeranno automaticamente questo indirizzo:
        </p>

        <form onSubmit={handleSaveDomain} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="es. https://link.miosito.it oppure https://go.alessandro.it"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-md whitespace-nowrap"
          >
            Salva Sottodominio
          </button>
        </form>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvato! Tutti i link generati ora useranno questo dominio.</span>
          </div>
        )}
      </div>

      {/* Step 2: The exact DNS Record table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Passo 2: Il Record DNS da Inserire nel Tuo Hosting (Aruba, SiteGround, GoDaddy, ecc.)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Accedi al pannello DNS del tuo provider di dominio e aggiungi questo singolo record <strong>CNAME</strong>:
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-12 bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <div className="col-span-3">Tipo Record</div>
            <div className="col-span-4">Nome / Host</div>
            <div className="col-span-5">Valore / Destinazione (Punta a)</div>
          </div>

          <div className="grid grid-cols-12 px-4 py-3 items-center text-slate-200 font-mono text-xs divide-y sm:divide-y-0">
            <div className="col-span-3 font-bold text-emerald-400">CNAME</div>
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-indigo-300 font-bold">link</span>
              <button
                type="button"
                onClick={() => handleCopy('link', 'host')}
                className="p-1 hover:text-white text-slate-500 rounded"
                title="Copia"
              >
                {copiedField === 'host' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="col-span-5 flex items-center gap-2">
              <span className="text-amber-300 truncate">cname.vercel-dns.com</span>
              <button
                type="button"
                onClick={() => handleCopy('cname.vercel-dns.com', 'val')}
                className="p-1 hover:text-white text-slate-500 rounded"
                title="Copia"
              >
                {copiedField === 'val' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          * Nota: al posto di <code className="text-slate-400">cname.vercel-dns.com</code> puoi usare il target del tuo hosting gratuito preferito (Vercel, Render o Cloudflare). Una volta salvato, il DNS è configurato per sempre!
        </p>
      </div>

      {/* Step 3: Zero maintenance workflow */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Passo 3: Come Funziona il Flusso Quotidiano (Zero Manutenzione)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px]">1</span>
              Incolli il Link
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Apri questa dashboard e inserisci il link della tua pagina, prodotto Amazon o YouTube.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px]">2</span>
              Copi il Tuo Link
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ricevi subito <code className="text-indigo-300">link.tuosito.it/l/mio-link</code> e lo copi con un tocco.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
              Instagram Bypassa!
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              I tuoi follower cliccano su Instagram e si apre subito in Safari o nell'app ufficiale nativa.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span>Non devi mai più esportare codici, né aggiornare file, né toccare di nuovo il tuo hosting.</span>
          <span className="text-emerald-400 font-bold whitespace-nowrap ml-2">100% Automatico</span>
        </div>
      </div>
    </div>
  );
};
