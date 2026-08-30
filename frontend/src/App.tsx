import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Code, Globe, ArrowLeft } from 'lucide-react';
import LandingPage from './components/LandingPage';
import LuminaLogo from './components/LuminaLogo';

export default function App() {
  const [view, setView] = useState<'landing' | 'register' | 'login'>('landing');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load initial theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newTheme;
    });
  };

  // Render Landing Page
  if (view === 'landing') {
    return (
      <LandingPage 
        onNavigate={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
    );
  }

  return (
    <main className="flex min-h-screen w-full bg-white dark:bg-black selection:bg-black/10 dark:selection:bg-white/30 p-2 transition-colors duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      
      {/* Absolute Header Controls (Back Button) */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => setView('landing')}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-brand-gray text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shadow-sm text-xs font-semibold"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>
      </div>

      {/* Left Column (Hero & Video) - Always keeps Dark Mode aesthetic for brand consistency */}
      <section className="hidden lg:flex w-[52%] relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full bg-black">
        {/* Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Hero Content Container */}
        <motion.div 
          className="z-10 w-full max-w-xs space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 }
            }
          }}
        >
          <motion.div 
            variants={childVariants} 
            className="flex flex-row items-center space-x-2 cursor-pointer"
            onClick={() => setView('landing')}
          >
            <LuminaLogo isGlowing={true} className="w-9 h-5" />
            <span className="text-xl font-semibold tracking-tight text-white">LuminaApp</span>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-2">
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">
              {view === 'register' ? 'Join LuminaApp' : 'Welcome Back'}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              {view === 'register' 
                ? 'Follow these 3 quick phases to activate your space.' 
                : 'Enter your credentials to access your financial dashboard.'}
            </p>
          </motion.div>

          {view === 'register' && (
            <motion.div variants={childVariants} className="space-y-4">
              <StepItem number={1} text="Register your identity" active />
              <StepItem number={2} text="Configure your studio" />
              <StepItem number={3} text="Finalize your profile" />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Right Column (Sign Up / Login Form) */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden text-gray-900 dark:text-white transition-colors duration-500">
        <motion.div 
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight">
              {view === 'register' ? 'Create New Profile' : 'Iniciar Sesión'}
            </h2>
            <p className="text-gray-500 dark:text-white/40 text-sm transition-colors duration-500">
              {view === 'register' 
                ? 'Input your basic details to begin the journey.' 
                : 'Ingresa a tu cuenta de LuminaApp para gestionar tus finanzas.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={<Globe className="w-5 h-5" />} label="Google" />
            <SocialButton icon={<Code className="w-5 h-5" />} label="Github" />
          </div>

          <div className="flex items-center justify-center relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10 transition-colors duration-500"></div>
            </div>
            <span className="bg-white dark:bg-black px-4 text-xs font-medium text-gray-400 dark:text-white/40 uppercase tracking-widest relative z-10 transition-colors duration-500">
              Or
            </span>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {view === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" placeholder="John" type="text" />
                <InputGroup label="Last Name" placeholder="Doe" type="text" />
              </div>
            )}
            
            <InputGroup label="Email" placeholder="john@example.com" type="email" />
            
            <div className="space-y-1">
              <div className="relative flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-white transition-colors duration-500">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 border border-gray-200 dark:border-transparent dark:bg-brand-gray rounded-xl h-11 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20 transition-all duration-300"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {view === 'register' && (
                <p className="text-[11px] text-gray-500 dark:text-white/30 px-1 transition-colors duration-500">Requires at least 8 symbols.</p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full h-14 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:bg-gray-900 dark:hover:bg-white/90 active:scale-[0.98] mt-4 transition-all duration-200"
            >
              {view === 'register' ? 'Create Account' : 'Acceder'}
            </button>
          </form>

          <div className="text-center">
            {view === 'register' ? (
              <button 
                onClick={() => setView('login')}
                className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 bg-transparent border-none cursor-pointer"
              >
                Member of the team? Log in
              </button>
            ) : (
              <button 
                onClick={() => setView('register')}
                className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 bg-transparent border-none cursor-pointer"
              >
                New to LuminaApp? Create an account
              </button>
            )}
          </div>

        </motion.div>
      </section>
    </main>
  );
}

// Reusable Components

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function StepItem({ number, text, active = false }: { number: number, text: string, active?: boolean }) {
  if (active) {
    return (
      <div className="flex items-center space-x-4 bg-white text-black border border-white rounded-xl p-3">
        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
          {number}
        </div>
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm text-white border-none rounded-xl p-3">
      <div className="w-6 h-6 rounded-full bg-white/10 text-white/50 flex items-center justify-center text-xs font-semibold">
        {number}
      </div>
      <span className="text-sm font-medium text-white/70">{text}</span>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button type="button" className="flex items-center justify-center space-x-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl h-11 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-300 text-gray-700 dark:text-white/80 shadow-sm dark:shadow-none">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function InputGroup({ label, placeholder, type }: { label: string, placeholder: string, type: string }) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-white transition-colors duration-500">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        className="bg-gray-50 border border-gray-200 dark:border-transparent dark:bg-brand-gray rounded-xl h-11 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20 transition-all duration-300"
      />
    </div>
  );
}
