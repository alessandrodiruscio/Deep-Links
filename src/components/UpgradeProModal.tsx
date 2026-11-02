import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Sparkles, ExternalLink, ShieldCheck, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types/deepLink';

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth?: () => void;
}

export const UpgradeProModal: React.FC<UpgradeProModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const [checkoutUrl, setCheckoutUrl] = useState('https://checkout.samcart.com/products/deepdirect-pro');
  const [editingUrl, setEditingUrl] = useState(false);
  const [newCheckoutUrl, setNewCheckoutUrl] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/samcart-config')
        .then((res) => res.json())
        .then((data) => {
          if (data.checkoutUrl) {
            setCheckoutUrl(data.checkoutUrl);
            setNewCheckoutUrl(data.checkoutUrl);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCheckoutUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/samcart-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutUrl: newCheckoutUrl }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        setEditingUrl(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const isPro = currentUser?.plan === 'pro';
  const isAdmin = currentUser?.email === 'alessandro.diruscio@gmail.com';

  // Construct checkout URL with user email prefill if available
  let finalCheckoutUrl = checkoutUrl;
  if (currentUser?.email) {
    const separator = finalCheckoutUrl.includes('?') ? '&' : '?';
    finalCheckoutUrl = `${finalCheckoutUrl}${separator}email=${encodeURIComponent(currentUser.email)}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Gradient Banner */}
        <div className="h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Piani DeepDirect
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  2 Livelli: Free & Pro
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Scegli il piano ideale per i tuoi link e campagne marketing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert if already PRO */}
          {isPro && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-300 text-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Sei attualmente abbonato al piano PRO!</div>
                  <div className="text-xs text-emerald-400/90">Hai accesso a link illimitati e tutte le funzioni avanzate.</div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs bg-emerald-500 text-slate-950 font-bold rounded-lg uppercase tracking-wide">
                Attivo
              </span>
            </div>
          )}

          {/* Pricing Comparison Grid: Only Free and Pro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Piano Free */}
            <div className={`p-5 rounded-2xl border transition-all ${
              !isPro ? 'bg-slate-950/60 border-slate-700 shadow-md' : 'bg-slate-950/30 border-slate-800 opacity-80'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">Piano Free</h3>
                  <p className="text-xs text-slate-400">Ideale per iniziare</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                  Gratis
                </span>
              </div>

              <div className="text-2xl font-black text-white mb-4">
                0€ <span className="text-xs font-normal text-slate-400">per sempre</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Fino a 5 deep link</strong> attivi contemporaneamente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Smart Redirect automatico per iOS e Android</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Browser Escape anti in-app browser</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Statistiche di base sui click</span>
                </li>
              </ul>

              <div className="pt-2">
                {!currentUser ? (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
                  >
                    Crea account Free
                  </button>
                ) : !isPro ? (
                  <div className="w-full py-2 px-3 bg-slate-800/80 text-slate-400 rounded-xl text-xs font-medium text-center">
                    Piano Corrente ({currentUser.currentLinkCount || 0}/5 link usati)
                  </div>
                ) : (
                  <div className="w-full py-2 px-3 bg-slate-900 text-slate-500 rounded-xl text-xs text-center">
                    Piano Base
                  </div>
                )}
              </div>
            </div>

            {/* Piano Pro (Senza Limiti) */}
            <div className="relative p-5 rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-950 shadow-xl shadow-emerald-500/10 flex flex-col justify-between">
              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-full shadow-md uppercase tracking-wider">
                Consigliato
              </div>

              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-1.5">
                      Piano PRO
                      <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    </h3>
                    <p className="text-xs text-emerald-400">Nessuna restrizione</p>
                  </div>
                </div>

                <div className="text-2xl font-black text-white mb-4">
                  Accesso PRO <span className="text-xs font-normal text-slate-400">Checkout SamCart</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong className="text-white">Deep Link ILLIMITATI</strong> (nessun blocco)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Click e traffico illimitati senza quote</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Attivazione immediata via <strong>Webhook SamCart</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priorità di reindirizzamento ultra-veloce</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Assistenza tecnica prioritaria</span>
                  </li>
                </ul>
              </div>

              <div>
                <a
                  href={finalCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Passa a PRO con SamCart</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <p className="mt-2 text-[11px] text-center text-slate-400">
                  Transazione sicura gestita tramite SamCart. Attivazione istantanea.
                </p>
              </div>
            </div>
          </div>

          {/* How SamCart activation works */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Come funziona l'integrazione SamCart:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white mb-1">1. Completa l'ordine</div>
                <div>Acquista il prodotto sulla pagina di checkout SamCart.</div>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white mb-1">2. Webhook istantaneo</div>
                <div>SamCart invia l'evento al nostro server protetto in tempo reale.</div>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className="font-semibold text-white mb-1">3. PRO Sbloccato</div>
                <div>Il tuo profilo viene istantaneamente abilitato a link illimitati.</div>
              </div>
            </div>
          </div>

          {/* Admin Checkout URL Configuration */}
          {(isAdmin || editingUrl) && (
            <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Settings className="w-4 h-4" />
                  <span>Configurazione URL SamCart (Pannello Admin)</span>
                </div>
                {savedSuccess && (
                  <span className="text-xs text-emerald-400 font-medium">Salvato con successo!</span>
                )}
              </div>

              <form onSubmit={handleSaveCheckoutUrl} className="space-y-2">
                <label className="block text-xs text-slate-400">
                  URL della tua Checkout Page di SamCart:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={newCheckoutUrl}
                    onChange={(e) => setNewCheckoutUrl(e.target.value)}
                    placeholder="https://checkout.samcart.com/products/tuo-prodotto"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    {savingConfig ? 'Salvataggio...' : 'Salva URL'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Configura l'endpoint del Webhook nelle impostazioni di SamCart all'indirizzo:{' '}
                  <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">
                    {window.location.origin}/api/webhooks/samcart
                  </code>
                </p>
              </form>
            </div>
          )}

          {!isAdmin && !editingUrl && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setEditingUrl(true)}
                className="text-[11px] text-slate-500 hover:text-slate-400 inline-flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Imposta URL Checkout SamCart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
