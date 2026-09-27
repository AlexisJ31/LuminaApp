# Flujo de Trabajo de Desarrollo - LuminaApp

Este documento establece las reglas estrictas de desarrollo y contribución para el proyecto LuminaApp, asegurando un entorno organizado, seguro, escalable y con separación limpia entre Staging y Producción.

## 1. Arquitectura de Ramas y Separación de Entornos

- **`main` (Producción)**: 
  - Representa el código prístino de producción.
  - **PROHIBIDO** contaminar esta rama con datos falsos de prueba (mockdata temporales) o experimentos incompletos.
  - Únicamente recibe merges estables de despliegue desde `QA-staging-lumina` cuando un hito/fase completa está 100% validado.
- **`QA-staging-lumina` (Staging / Pre-producción)**:
  - Rama principal para integración continua y pruebas activas en el entorno de Staging (Netlify).
  - Es la rama base objetivo por defecto para los Pull Requests de características activas y mockdata de prueba.

## 2. Sincronización Obligatoria
Antes de iniciar cualquier tarea o escribir código nuevo, se debe asegurar que el entorno local esté sincronizado con la versión más reciente del repositorio remoto:
- `git fetch origin`
- `git checkout QA-staging-lumina`
- `git pull origin QA-staging-lumina`

## 3. Prohibido Trabajar Directamente en `main` o `QA-staging-lumina`
**NUNCA** se realizarán commits directos a `main` ni a `QA-staging-lumina`.
Toda nueva característica, corrección de error o modificación debe realizarse en una rama dedicada creada a partir de `QA-staging-lumina`.
- Ejemplo de rama: `feature/FIN-2-supabase-auth` o `fix/FIN-2-bug-login`

## 4. Creación de Pull Requests (PRs)
El asistente de IA (Antigravity) será el responsable de:
1. Crear la rama de característica desde `QA-staging-lumina`.
2. Escribir el código y ejecutar pruebas unitarias/compilación.
3. Hacer los commits con mensajes informativos y convencionales.
4. Subir la rama al repositorio remoto (`git push`).
5. Crear el Pull Request hacia la rama `QA-staging-lumina`.

## 5. Revisión, Merge y Live Confirm Obligatorio
- **Target PR de Desarrollo**: Hacia `QA-staging-lumina`.
- **Entorno de Staging (Netlify)**: Despliega automáticamente los cambios tras el merge en `QA-staging-lumina`.
- **REGLA ESTRUCTURAL DE ORO**: **NUNCA** se cambiará el estado de un ticket a **"Done"** en Linear inmediatamente al escribir el código.
- Cada ticket debe atravesar obligatoriamente la fase de **"Live Confirm"** (comprobación visual y funcional en vivo sobre la URL de Staging desplegada).
- Solo tras confirmar empíricamente que la funcionalidad responde al 100% de lo solicitado, se marcará el ticket como **"Done"** en Linear y se procederá secuencialmente con el siguiente ticket.
- **Pase a Producción (`main`)**: Cuando una fase o hito completo se encuentra verificado al 100% en Staging, se abre un PR de Release desde `QA-staging-lumina` hacia `main`.
