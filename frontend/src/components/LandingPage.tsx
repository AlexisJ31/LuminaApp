import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { ArrowRight, Wallet, BarChart3, Users, Zap, Check } from 'lucide-react';
import LuminaLogo from './LuminaLogo';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'register' | 'login') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { scrollY } = useScroll();
  const [isScrolledDark, setIsScrolledDark] = useState(false);

  // Sincronizamos la clase 'dark' en el documento raíz para activar Tailwind dark: nativamente
  useEffect(() => {
    if (isScrolledDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Limpieza al desmontar el componente para evitar que afecte a otras pantallas
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isScrolledDark]);

  // Detectamos la posición del scroll para encender la "noche" y el logo
  useMotionValueEvent(scrollY, "change", (latest) => {
    // La noche se activa a mitad de camino del desvanecimiento (700px de scroll)
    if (latest > 700) {
      setIsScrolledDark(true);
    } else {
      setIsScrolledDark(false);
    }
  });

  // La capa blanca del Hero se desvanece suavemente a transparente entre los 300px y 1100px de scroll
  const heroWhiteOpacity = useTransform(scrollY, [300, 1100], [1, 0]);

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white/30 scroll-smooth antialiased transition-colors duration-1000">
      
      {/* 1. Navbar Flotante */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-6xl mt-4 px-6 h-16 flex items-center justify-between bg-white/70 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl shadow-lg transition-all duration-1000"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div 
          className="flex items-center space-x-2 cursor-pointer text-black dark:text-white transition-colors duration-300" 
          onClick={() => onNavigate('landing')}
        >
          {/* Reemplazamos por nuestro logotipo vectorial animado */}
          <LuminaLogo isGlowing={isScrolledDark} className="w-8 h-5" />
          <span className="text-lg font-semibold tracking-tight transition-colors duration-300">LuminaApp</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-black/70 dark:text-white/70">
          <a href="#features" className="hover:text-black dark:hover:text-white transition-colors duration-200">Características</a>
          <a href="#about" className="hover:text-black dark:hover:text-white transition-colors duration-200">Sobre la App</a>
          <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors duration-200">Planes</a>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            Iniciar Sesión
          </button>
          
          <button 
            onClick={() => onNavigate('register')}
            className="hidden sm:inline-flex px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-semibold rounded-xl hover:bg-black/90 dark:hover:bg-white/90 active:scale-[0.98] transition-all duration-200"
          >
            Empezar Gratis
          </button>
        </div>
      </motion.nav>

      {/* 2. Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 px-6">
        {/* Background Video and Transition Overlays */}
        <div className="absolute inset-0 w-full h-full z-0">
          {/* Capa de fondo blanco que se desvanece con el scroll para revelar el fondo negro de la página */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-white via-white via-90% to-transparent z-10 pointer-events-none"
            style={{ opacity: heroWhiteOpacity }}
          />

          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-35 z-0"
          >
            <source 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" 
              type="video/mp4" 
            />
          </video>

          {/* Gradiente dinámico de overlay que pasa de blanco a negro según el modo activo */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white via-90% to-transparent dark:from-black/20 dark:via-black/80 dark:to-black transition-all duration-1000 z-20 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-30 max-w-4xl mx-auto text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 }
            }
          }}
        >
          <motion.div 
            variants={childVariants} 
            className="inline-flex items-center space-x-2 px-3 py-1 border border-black/10 bg-black/5 text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60 rounded-full backdrop-blur-sm text-xs transition-colors duration-1000"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            <span>Presentamos LuminaApp - SaaS de Finanzas</span>
          </motion.div>

          <motion.h1 
            variants={childVariants} 
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-black to-black/70 dark:from-white dark:to-white/60 transition-all duration-1000"
          >
            Controla las finanzas de tu <br />
            <span className="text-black dark:text-white transition-colors duration-1000">emprendimiento hoy mismo.</span>
          </motion.h1>

          <motion.p 
            variants={childVariants} 
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed text-black/60 dark:text-white/60 transition-colors duration-1000"
          >
            Una plataforma moderna y minimalista diseñada para emprendedores y empresas. Gestiona flujos de caja, cuentas y pagos en un solo lugar bajo el ecosistema financiero Aurora.
          </motion.p>

          <motion.div 
            variants={childVariants} 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto h-12 px-8 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:bg-black/90 dark:hover:bg-white/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Crear Cuenta Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <a 
              href="#features"
              className="w-full sm:w-auto h-12 px-8 bg-white text-black dark:bg-black dark:text-white border border-black/10 dark:border-white/10 font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300 flex items-center justify-center"
            >
              Conocer Características
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6 relative z-10 text-black dark:text-white transition-colors duration-1000">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Finanzas simplificadas. Sin complicaciones.</h2>
          <p className="text-black/60 dark:text-white/60 font-light">Todas las herramientas financieras que tu emprendimiento necesita, organizadas con una estética limpia e intuitiva.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div 
            className="p-8 rounded-2xl bg-gray-50/60 dark:bg-brand-gray/30 border border-black/5 dark:border-white/5 backdrop-blur-sm hover:border-black/15 dark:hover:border-white/15 transition-all duration-300 space-y-6"
            whileHover={{ y: -4 }}
          >
            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Dashboard en Vivo</h3>
              <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">Monitorea tus ingresos, egresos y el flujo de caja neto en tiempo real con gráficos minimalistas interactivos.</p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            className="p-8 rounded-2xl bg-gray-50/60 dark:bg-brand-gray/30 border border-black/5 dark:border-white/5 backdrop-blur-sm hover:border-black/15 dark:hover:border-white/15 transition-all duration-300 space-y-6"
            whileHover={{ y: -4 }}
          >
            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Cuentas Multi-Rol</h3>
              <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">Configuraciones adaptadas tanto para usuarios particulares como para empresas o emprendimientos con flujos de caja separados.</p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            className="p-8 rounded-2xl bg-gray-50/60 dark:bg-brand-gray/30 border border-black/5 dark:border-white/5 backdrop-blur-sm hover:border-black/15 dark:hover:border-white/15 transition-all duration-300 space-y-6"
            whileHover={{ y: -4 }}
          >
            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Integración Fintech (Yappy)</h3>
              <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">Facilita el cobro de tu negocio a través de la integración nativa y de fácil configuración con la pasarela de Yappy.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. About App Section */}
      <section id="about" className="py-24 bg-gray-50/30 dark:bg-brand-gray/20 border-t border-b border-gray-100 dark:border-white/5 relative z-10 text-black dark:text-white transition-colors duration-1000">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-black/60 dark:text-white/60">
              <span>Nuestra Misión</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Diseñado para la velocidad del emprendedor moderno.</h2>
            <p className="text-black/60 dark:text-white/60 font-light leading-relaxed">
              Sabemos que mantener la salud financiera de un emprendimiento puede ser caótico. Por eso LuminaApp consolida tus movimientos financieros en una interfaz limpia, sin distracciones y enfocada en métricas clave que de verdad impactan tu toma de decisiones diarias.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mt-1">
                  <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Visualización Clara</span>
                  <p className="text-xs text-black/40 dark:text-white/40">Sin tablas confusas o herramientas sobrecargadas.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mt-1">
                  <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
                <div>
                  <span className="font-medium text-black dark:text-white">Seguridad de Grado Financiero</span>
                  <p className="text-xs text-black/40 dark:text-white/40">Tus datos bancarios y personales están encriptados de extremo a extremo.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            {/* Visual Aurora glow container */}
            <div className="absolute w-72 h-72 bg-black/5 dark:bg-white/5 rounded-full blur-3xl -z-10"></div>
            
            {/* Mockup Dashboard stays dark for premium physical look */}
            <div className="border border-white/10 rounded-2xl bg-black p-6 shadow-2xl w-full max-w-md text-white">
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                <div>
                  <span className="text-xs text-white/40 font-mono">LuminaApp Dashboard</span>
                  <h4 className="text-lg font-bold">Resumen Financiero</h4>
                </div>
                <Wallet className="w-5 h-5 text-white/60" />
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-white/40">Saldo Neto Actual</span>
                  <p className="text-3xl font-mono font-bold">$12,450.80</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/40">Ingresos (Mes)</span>
                    <p className="text-sm font-semibold text-green-400">+$8,900.00</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/40">Gastos (Mes)</span>
                    <p className="text-sm font-semibold text-red-400">-$3,449.20</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing / Planes Section */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6 relative z-10 text-black dark:text-white transition-colors duration-1000">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Comienza a escalar tu negocio.</h2>
          <p className="text-black/60 dark:text-white/60 font-light">Elige el plan ideal para tus operaciones. Cambia o cancela cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white space-y-6 relative flex flex-col justify-between transition-colors duration-1000">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Plan Emprendedor</h3>
                <p className="text-xs text-black/40 dark:text-white/40">Para pequeños negocios e independientes.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-mono font-bold">$0</span>
                <span className="text-sm text-black/40 dark:text-white/40 ml-2">/ gratis siempre</span>
              </div>
              <ul className="space-y-3 text-sm text-black/70 dark:text-white/70">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-black dark:text-white" />
                  <span>1 cuenta financiera</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-black dark:text-white" />
                  <span>Seguimiento de flujo de caja</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-black dark:text-white" />
                  <span>Reportes en PDF básicos</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onNavigate('register')}
              className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              Comenzar Gratis
            </button>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black space-y-6 relative flex flex-col justify-between shadow-2xl transition-colors duration-1000">
            <div className="absolute -top-3 right-6 bg-white dark:bg-black text-black dark:text-white text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-xl border border-black/10 dark:border-white/10">
              Popular
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Plan Lumina Pro</h3>
                <p className="text-xs text-white/50 dark:text-black/50">Para empresas y emprendimientos en expansión.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-mono font-bold">$15</span>
                <span className="text-sm text-white/50 dark:text-black/50 ml-2">/ al mes</span>
              </div>
              <ul className="space-y-3 text-sm text-white/80 dark:text-black/80">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-white dark:text-black" />
                  <span>Cuentas ilimitadas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-white dark:text-black" />
                  <span>Integración de cobros con Yappy</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-white dark:text-black" />
                  <span>Análisis de IA y presupuestos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-white dark:text-black" />
                  <span>Soporte prioritario 24/7</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onNavigate('register')}
              className="w-full h-11 bg-white dark:bg-black text-black dark:text-white hover:bg-white/90 dark:hover:bg-black/90 text-sm font-semibold rounded-xl transition-all duration-200"
            >
              Probar Pro Gratis (30 días)
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 bg-white dark:bg-black border-t border-black/5 dark:border-white/5 text-center text-xs text-black/30 dark:text-white/30 space-y-4 relative z-10 transition-colors duration-1000">
        <div className="flex justify-center items-center space-x-2">
          {/* Renderiza el LuminaLogo en el footer también */}
          <LuminaLogo isGlowing={isScrolledDark} className="w-6.5 h-4" />
          <span className="font-medium tracking-tight text-black/40 dark:text-white/40">LuminaApp</span>
        </div>
        <p>© {new Date().getFullYear()} LuminaApp. Todos los derechos reservados. Diseñado bajo concepto visual Aurora.</p>
      </footer>
    </div>
  );
}
