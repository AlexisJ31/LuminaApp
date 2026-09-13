import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Key, CreditCard, Globe, Check, Copy, Shield, Save } from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'webhook' | 'accounts' | 'preferences'>('profile');
  
  // Form State
  const [userName, setUserName] = useState('Alexis Jaén');
  const [userEmail, setUserEmail] = useState('alexis@luminaapp.io');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/Panama');
  const [webhookKey] = useState('lum_live_sk_99a8b7c6d5e4f3a2b1_n8n');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(webhookKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <User className="w-6 h-6 text-teal-400" />
          <span>Configuración del Perfil</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
          Administra tus datos personales, claves de ingesta n8n y cuentas vinculadas.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil de Usuario</span>
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'webhook'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Webhooks n8n (`x-api-key`)</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cuentas Bancarias</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Preferencias Financieras</span>
        </button>
      </div>

      {/* Tab Contents */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md max-w-3xl space-y-6 shadow-xl"
      >
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Información Personal</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-white/60">Nombre Completo</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-white/60">Correo Electrónico</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              {isSaved && (
                <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>¡Ajustes guardados correctamente!</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        )}

        {/* Webhook n8n Tab */}
        {activeTab === 'webhook' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Autenticación de Webhook n8n</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">
              Utiliza esta clave <code className="text-purple-400 font-mono">x-api-key</code> en el encabezado HTTP de tu flujo de n8n o Make para inyectar transacciones automáticamente desde WhatsApp.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Clave de Ingesta Secreta</span>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookKey}
                  className="w-full bg-transparent text-purple-300 font-mono text-xs focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-300 space-y-1">
              <span className="font-bold">Endpoint de Ingesta:</span>
              <p className="font-mono text-[11px] text-purple-200/80 select-all">POST https://lumina-api.onrender.com/api/v1/webhooks/transactions</p>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Cuentas y Tarjetas Vinculadas</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    BG
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">Banco General - Cuenta de Débito</div>
                    <div className="text-[10px] text-slate-400 dark:text-white/40">Principal • Cta: ••• 1092</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">$1,450.00</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    BAC
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">BAC Credomatic - Visa CashBack</div>
                    <div className="text-[10px] text-slate-400 dark:text-white/40">Crédito • Tarjeta: ••• 4821</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-400">-$340.50</span>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Preferencias Financieras</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-white/60">Moneda Base</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#121824] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none"
                >
                  <option value="USD">USD ($) - Dólar Estadounidense / Balboa</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-white/60">Zona Horaria</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#121824] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none"
                >
                  <option value="America/Panama">America/Panama (UTC-5)</option>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="UTC">UTC Universal</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              {isSaved && (
                <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>¡Preferencias guardadas!</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Preferencias</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>

    </div>
  );
}
