# Sistema de Diseño (Design System) - LuminaApp / Aurora

Este documento almacena las directrices visuales maestras para mantener la armonía en toda la aplicación, basándose en el concepto "Aurora".

## Tecnologías UI
- **Framework:** React (Vite)
- **Estilos:** Tailwind CSS v4 (Aprobado explícitamente por el usuario)
- **Animaciones:** `motion/react` (Framer Motion)
- **Iconografía:** `lucide-react`

## 1. Global Setup (index.css)
- **Tipografía:** "Inter" (Google Fonts). Pesos: 300, 400, 500, 600, 700.
- **Variables Globales:**
  - Font Sans: `"Inter", ui-sans-serif, system-ui, sans-serif`
  - Color Brand Gray: `#1A1A1A`
- **Body Base:** Fondo negro puro (`bg-black`), texto blanco (`text-white`), tipografía suavizada (`antialiased`).

## 2. Layouts y Contenedores Principales
- Los contenedores base deben tener `min-h-screen w-full bg-black selection:bg-white/30 transition-all duration-500`.
- En pantallas grandes (`lg`), limitar el alto a `lg:h-screen lg:overflow-hidden` con padding.
- Las divisiones de pantalla (ej. Login/Dashboard) se harán dividiendo en Columnas (Izquierda/Derecha).

## 3. Elementos Visuales Clave
- **Videos de Fondo (Hero):** Se usarán videos en reproducción automática, silenciados, sin overlay ni tintes oscuros. Estilo puro. (Ejemplo reservado: `hf_20260506_...mp4`).
- **Animaciones de Entrada:** Uso intensivo de `motion.div` con `staggerChildren: 0.15` y `delayChildren: 0.2`. Los elementos hijos deben aparecer con un *fade in* y deslizarse hacia arriba (`y: 10` a `y: 0`, duration `0.5`).

## 4. Componentes Reutilizables
1. **`<StepItem>`**: Indicadores de progreso. Activo: `bg-white text-black`. Inactivo: `bg-brand-gray text-white`.
2. **`<SocialButton>`**: Botones cuadrados/oscuros: `bg-black border border-white/10 rounded-xl hover:bg-white/5`.
3. **`<InputGroup>`**: Campos de formulario modernos con `bg-brand-gray border-none rounded-xl h-11 px-4 text-white`. Textos placeholder opacos (`text-white/20`).

*Nota: Este diseño prioriza el "Glassmorphism" sutil, bordes translúcidos y contrastes extremos blanco/negro.*
