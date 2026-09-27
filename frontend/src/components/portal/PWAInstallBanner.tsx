import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Usuario instalo PWA LuminaApp');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white p-3 rounded-xl shadow-lg flex items-center justify-between mb-4 border border-white/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          <Smartphone className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Instalar LuminaApp en tu celular</h4>
          <p className="text-xs text-blue-100">Accede a tus finanzas e Inbox Yappy con 1-clic sin instalar desde tiendas</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-white text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar App
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
