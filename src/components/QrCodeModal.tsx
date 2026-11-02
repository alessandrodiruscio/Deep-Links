import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((dataUri) => setQrDataUrl(dataUri))
        .catch((err) => console.error(err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <QrIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>QR Code Deep Link</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate px-2">{title}</p>

        {/* QR Display */}
        <div className="bg-white p-4 rounded-xl inline-block shadow-md border border-slate-200 dark:border-slate-800 mb-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              Generazione in corso...
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 truncate mb-4 select-all">
          {url}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiato!' : 'Copia Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Scarica PNG</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
          Inquadra con la fotocamera del tuo cellulare per testare il deep link reale!
        </p>
      </div>
    </div>
  );
};
