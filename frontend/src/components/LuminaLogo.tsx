import { motion } from 'motion/react';

interface LuminaLogoProps {
  isGlowing?: boolean;
  className?: string;
}

export default function LuminaLogo({ isGlowing = true, className = "w-9 h-6" }: LuminaLogoProps) {
  return (
    <motion.svg 
      viewBox="0 0 100 60" 
      className={`${className} shrink-0 overflow-visible`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        filter: isGlowing 
          ? "drop-shadow(0px 0px 10px rgba(16, 185, 129, 0.75)) drop-shadow(0px 0px 4px rgba(251, 191, 36, 0.5))" 
          : "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="luminaLogoGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>

        <linearGradient id="luminaLogoGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        <linearGradient id="luminaGlowHalo" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Halo de fondo suave */}
      <rect x="10" y="5" width="80" height="50" rx="25" fill="url(#luminaGlowHalo)" />

      {/* Círculo izquierdo (Emerald) */}
      <motion.circle 
        cx="38" 
        cy="30" 
        r="20" 
        stroke="url(#luminaLogoGradientLeft)" 
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Círculo derecho (Cyan / Amber) */}
      <motion.circle 
        cx="62" 
        cy="30" 
        r="20" 
        stroke="url(#luminaLogoGradientRight)" 
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Intersección entrelazada */}
      <motion.path 
        d="M 46 11.7 A 20 20 0 0 1 54 18" 
        stroke="url(#luminaLogoGradientLeft)" 
        strokeWidth="5" 
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
