import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

interface UserLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  unreviewedCount?: number;
}

export default function UserLayout({
  children,
  currentTab,
  onTabChange,
  onOpenNewTransaction,
  onNavigateHome,
  isDarkMode = true,
  toggleTheme,
  unreviewedCount = 3
}: UserLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#080A0F] text-slate-900 dark:text-white selection:bg-emerald-500/20 font-sans antialiased overflow-x-hidden transition-colors duration-300">
      
      {/* Sidebar para Pantallas Grandes (Desktop lg) */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={onTabChange} 
        unreviewedCount={unreviewedCount} 
      />

      {/* Contenedor Principal (Header + Área de Trabajo + Mobile Navigation) */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 min-h-screen">
        
        {/* Header Superior Adaptativo */}
        <Topbar 
          currentTab={currentTab}
          onOpenNewTransaction={onOpenNewTransaction}
          onNavigateHome={onNavigateHome}
          onTabChange={onTabChange}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        {/* Área Principal de Contenido Dinámico */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Navegación Inferior Móvil (Regla del Pulgar con FAB Central) */}
        <BottomNav 
          currentTab={currentTab}
          onTabChange={onTabChange}
          onOpenNewTransaction={onOpenNewTransaction}
          unreviewedCount={unreviewedCount}
        />

      </div>

    </div>
  );
}
