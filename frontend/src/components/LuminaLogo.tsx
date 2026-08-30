import { motion } from 'motion/react';

interface LuminaLogoProps {
  isGlowing: boolean;
  className?: string;
}

export default function LuminaLogo({ isGlowing, className = "w-10 h-6" }: LuminaLogoProps) {
  const strokeColor = isGlowing ? "#FBBF24" : "#000000"; // Usamos un amarillo/ámbar un poco más claro y brillante para el modo encendido

  return (
    <motion.svg 
      viewBox="0 0 100 60" 
      className={`${className}`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      // Aplicamos el drop-shadow de CSS acelerado por hardware para un efecto de brillo/alumbrado real y compatible
      animate={{ 
        filter: isGlowing ? "drop-shadow(0px 0px 8px rgba(251, 191, 36, 0.8))" : "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Círculo izquierdo */}
      <motion.circle 
        cx="38" 
        cy="30" 
        r="20" 
        stroke={strokeColor} 
        strokeWidth="3.5"
        animate={{ stroke: strokeColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Círculo derecho */}
      <motion.circle 
        cx="62" 
        cy="30" 
        r="20" 
        stroke={strokeColor} 
        strokeWidth="3.5"
        animate={{ stroke: strokeColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Pequeño parche de entrelazado para que los anillos se crucen físicamente */}
      <motion.path 
        d="M 46 11.7 A 20 20 0 0 1 54 18" 
        stroke={strokeColor} 
        strokeWidth="3.5" 
        strokeLinecap="butt"
        animate={{ stroke: strokeColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
