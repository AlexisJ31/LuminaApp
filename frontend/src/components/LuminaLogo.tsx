import { motion } from 'motion/react';

interface LuminaLogoProps {
  isGlowing?: boolean;
  className?: string;
}

export default function LuminaLogo({ isGlowing = true, className = "w-9 h-9" }: LuminaLogoProps) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className} shrink-0`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg 
        viewBox="0 0 36 36" 
        className="w-full h-full overflow-visible"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        animate={{ 
          filter: isGlowing 
            ? "drop-shadow(0px 0px 8px rgba(16, 185, 129, 0.8)) drop-shadow(0px 0px 3px rgba(251, 191, 36, 0.6))" 
            : "none"
        }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id="luminaBgGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="luminaSparkGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          <radialGradient id="centerGlow" cx="18" cy="18" r="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow Background */}
        <circle cx="18" cy="18" r="17" fill="url(#centerGlow)" />

        {/* Outer Glassmorphic Rounded Badge */}
        <rect 
          x="2" 
          y="2" 
          width="32" 
          height="32" 
          rx="10" 
          fill="url(#luminaBgGrad)" 
          stroke="url(#luminaSparkGrad)" 
          strokeWidth="1.5" 
          strokeOpacity="0.8"
        />

        {/* Inner Stylized Lumina Diamond / Sparkle Logo */}
        <path 
          d="M 18 6 L 22.5 13.5 L 30 18 L 22.5 22.5 L 18 30 L 13.5 22.5 L 6 18 L 13.5 13.5 Z" 
          fill="url(#luminaSparkGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.75"
          strokeOpacity="0.9"
        />

        {/* Inner Bright Core */}
        <circle cx="18" cy="18" r="3.5" fill="#FFFFFF" />
      </motion.svg>
    </motion.div>
  );
}
