# Flujo de Trabajo de Desarrollo - LuminaApp

Este documento establece las reglas estrictas de desarrollo y contribución para el proyecto LuminaApp, asegurando un entorno organizado, seguro y escalable.

## 1. Sincronización Obligatoria
Antes de iniciar cualquier tarea o escribir código nuevo, se debe asegurar que el entorno local esté sincronizado con la versión más reciente del repositorio remoto.
- `git fetch origin`
- `git pull origin main`

## 2. Prohibido Trabajar en Main
**NUNCA** se realizarán commits directos a la rama `main`.
Toda nueva característica, corrección de error o modificación debe realizarse en una rama dedicada, preferiblemente referenciando el ticket de Linear.
- Ejemplo de rama: `feature/FIN-1-dashboard` o `fix/FIN-2-bug-login`

## 3. Creación de Pull Requests (PRs)
El asistente de IA (Antigravity) será el responsable de:
1. Escribir el código en la rama correspondiente.
2. Hacer los commits con mensajes claros.
3. Subir la rama al repositorio remoto (`git push`).
4. Crear o preparar el Pull Request hacia la rama principal.

## 4. Revisión y Merge
El **Usuario (Líder del Proyecto)** es el único responsable de revisar el Pull Request y realizar el **Merge** oficial hacia `main`. 

## 5. Entorno de Staging y Live Confirm
- Existirá un entorno de **Staging** (pre-producción) donde se desplegará la aplicación de forma automática o manual tras un merge.
- Después de cada merge, el equipo esperará a que el despliegue finalice exitosamente.
- Se realizará un **"Live Confirm"** (confirmación en vivo) comprobando visual y funcionalmente los cambios en el entorno de Staging antes de dar por cerrada la tarea y pasar al siguiente ticket.
