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

      {/* Step 3: Supabase Database Setup */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Passo 3: Database Supabase - Salva i Link per Sempre</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            Integrazione Supabase Attiva
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Hai collegato Supabase a Vercel: <strong>ottimo lavoro!</strong> Per fare in modo che Supabase
          salvi i tuoi link e i conteggi dei click in modo permanente, serve solo creare la tabella{' '}
          <code className="text-emerald-300 font-mono">deep_links</code> (operazione da fare una sola volta in 30 secondi):
        </p>

        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1">
          <li>
            Apri la tua dashboard su <strong className="text-white">Supabase.com</strong> (oppure da Vercel → scheda <em>Storage</em> → <em>Supabase</em>).
          </li>
          <li>
            Nel menu a sinistra clicca su <strong className="text-white">SQL Editor</strong> (l'icona del terminale <code>&gt;_</code>).
          </li>
          <li>
            Clicca su <strong className="text-indigo-400">New query</strong>, incolla il codice qui sotto e premi <strong className="text-emerald-400">Run</strong>:
          </li>
        </ol>

        {/* Copyable SQL Snippet */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-xs font-mono text-emerald-400">
          <button
            type="button"
            onClick={() =>
              handleCopy(
                `-- Crea la tabella per salvare i link in Supabase
CREATE TABLE IF NOT EXISTS public.deep_links (
  slug TEXT PRIMARY KEY,
  id TEXT,
  original_url TEXT NOT NULL,
  platform TEXT DEFAULT 'generic',
  target_mode TEXT DEFAULT 'smart',
  title TEXT,
  description TEXT,
  image_url TEXT,
  clicks BIGINT DEFAULT 0,
  stats JSONB DEFAULT '{"iosClicks":0,"androidClicks":0,"desktopClicks":0,"inAppBreaks":{"instagram":0,"tiktok":0,"facebook":0,"whatsapp":0,"other":0},"appOpens":0,"browserEscapes":0}'::jsonb,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita l'accesso in lettura e scrittura per l'app
ALTER TABLE public.deep_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access to deep_links" ON public.deep_links;
CREATE POLICY "Public access to deep_links" ON public.deep_links FOR ALL USING (true) WITH CHECK (true);`,
                'sql'
              )
            }
            className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-medium rounded-lg border border-slate-700 transition-colors"
          >
            {copiedField === 'sql' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiato!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copia Script SQL</span>
              </>
            )}
          </button>

          <pre className="text-[11px] text-slate-300 leading-relaxed pr-24">
{`CREATE TABLE IF NOT EXISTS public.deep_links (
  slug TEXT PRIMARY KEY,
  id TEXT,
  original_url TEXT NOT NULL,
  platform TEXT DEFAULT 'generic',
  target_mode TEXT DEFAULT 'smart',
  title TEXT,
  description TEXT,
  image_url TEXT,
  clicks BIGINT DEFAULT 0,
  stats JSONB DEFAULT '{"iosClicks":0,"androidClicks":0,"desktopClicks":0}'::jsonb,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deep_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access to deep_links" ON public.deep_links FOR ALL USING (true) WITH CHECK (true);`}
          </pre>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Una volta premuto <strong>Run</strong>, il database è configurato: ogni link creato resterà salvato su Supabase per sempre!
          </span>
        </p>
      </div>

      {/* Step 4: Zero maintenance workflow */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Passo 4: Flusso Quotidiano (Zero Manutenzione)</span>
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
