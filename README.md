# 🚀 LuminaApp — Plataforma de Gestión Financiera Personal & Pacing Engine

**LuminaApp** es una solución SaaS de finanzas personales diseñada para brindar claridad, control y proyección financiera en tiempo real. Combina un **Motor de Pacing (Ritmo de Gasto)** con ingesta automatizada de transacciones, presupuestación inteligente y monitoreo del patrimonio neto.

---

## 🔗 Entorno de Pruebas (Staging)

Puedes probar la versión más reciente desplegada en vivo en el siguiente enlace:

👉 **[Entorno de QA Staging en Netlify](https://qa-staging-lumina--luminaapp-alexis.netlify.app/)**

---

## ✨ Características Principales

### ⚡ 1. Motor de Ritmo de Gasto (Pacing Engine)
- **Monitoreo en Tiempo Real**: Compara el gasto acumulado del usuario contra una curva ideal de consumo basada en su presupuesto mensual o quincenal.
- **Visualización Inteligente**: La gráfica de Cashflow se trunca limpiamente en el día actual (ej. Día 27), evitando proyección de líneas ficticias en días no transcurridos.
- **Badge de Desempeño**: Muestra al instante si estás por debajo o por encima del ritmo de gasto ideal proyectado para el día de hoy.

### ⚙️ 2. Modal Profesional de Ajuste de Presupuesto (`BudgetAdjustmentModal`)
- **Impacto Financiero en Vivo**: Reclacula el límite diario de gasto (ej. `$26.66/día ➔ $40.00/día`) antes de confirmar los cambios.
- **Validación de Déficit**: Alerta si el presupuesto ingresado supera tus ingresos netos estimados.
- **Selección de Alcance (Scope)**: Opción de aplicar ajustes como una *excepción temporal para el mes en curso* o como una *regla recurrente para el futuro*.

### 📥 3. Bandeja de Transacciones por Revisar (Inbox Automatizado)
- Integración con flujos pasivos de ingesta (n8n, webhooks y notificaciones bancarias).
- Permite aprobar o desestimar transacciones inyectadas en tiempo real con un solo clic.

### 🎨 4. Interfaz Responsive & Tema Adaptativo (Light / Dark Mode)
- Diseñado desde cero con **Tailwind CSS v4** y **Framer Motion**.
- Paleta de colores ajustada para máxima legibilidad tanto en modo claro (Slate / Emerald) como en modo oscuro (`#080A0F` / `#121824`).

---

## 🛠️ Stack Tecnológico

- **Framework Frontend**: React 18 + TypeScript + Vite
- **Estilos & Diseño**: Tailwind CSS v4 + Lucide React Icons
- **Animaciones & Gráficos**: Framer Motion (`motion/react`) + Recharts
- **Gestión de Estado**: React Context API (`FinanceContext`) con persistencia local
- **Despliegue Continuo**: Netlify CI/CD
