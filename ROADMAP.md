# Roadmap de Implementacion de LuminaApp

Este documento define la trayectoria técnica y de producto para la plataforma LuminaApp, estructurada en diez fases (Fase 0 a Fase 9), con criterios de aceptación verificables (DoD), dependencias y reglas de arquitectura conforme al Plan Maestro de Ingesta y Finanzas Personales.

---

## Principios y Reglas de Oro de Ingenieria

1. Ausencia estricta de emojis en codigo, mensajes de commit, documentacion y componentes de interfaz de usuario.
2. Cada fase y pull request debe contar con criterios de aceptacion verificables y pruebas automatizadas asociadas.
3. El frontend nunca asume exito antes de recibir respuesta confirmada del servidor en operaciones criticas.
4. El backend es la unica fuente de verdad para calculos de balance, metricas y pacing engine.
5. Cero floats para dinero: todo calculo monetario se almacena y procesa en centavos enteros (`amountInCents`).
6. El pipeline de ingesta no se acopla a ningun transporte especifico: n8n, webhooks y parsers son adaptadores intercambiables.
7. Las credenciales bancarias nunca tocan la base de datos de la aplicacion.
8. Los tokens bancarios y secretos de conexion se cifran en reposo con AES-256-GCM.
9. Toda mutacion financiera genera un registro de auditoria inmutable.
10. La bandeja de revision es obligatoria para transacciones con nivel de confianza inferior a 0.85.
11. Los filtros por fecha usan rangos inclusivos normalizados a medianoche UTC-5 (zona horaria oficial de Panama).
12. La autenticacion no confia en el identificador `userId` provisto por el cliente: siempre se deriva de la sesion del servidor.
13. Las migraciones de base de datos son hacia adelante y reversibles (up/down).
14. Ningun cambio se despliega a staging sin que el build y la suite de pruebas pasen satisfactoriamente en CI.
15. Las llamadas a APIs externas tienen timeouts estrictos (maximo 10 segundos) y reintentos con backoff exponencial.
16. Los webhooks entrantes son idempotentes por diseno utilizando claves de deduplicacion.
17. Los errores de validacion y excepciones de API retornan formato RFC 7807 (Problem Details).
18. La documentacion tecnica y los registros de decision arquitectonica (ADR) se actualizan en el mismo commit que el codigo.
19. Los datos semilla (seed data) reflejan casos de uso y comercios reales de Panama (Banco General, Banistmo, BAC, Yappy).
20. Cada fase del roadmap debe ser demostrable de forma independiente antes de avanzar a la subsiguiente.

---

## Fases del Roadmap

### Fase 0: Fundaciones de Ingenieria y Decisiones de Arquitectura
- **Objetivo**: Establecer las bases documentales, registros de decision arquitectonica (ADRs) y el backlog de ingesta formal.
- **Entregables**:
  - `ROADMAP.md` exhaustivo en la raiz del repositorio.
  - Registro formal de decisiones de arquitectura: ADR-001 a ADR-010 en `docs/adr/`.
  - Definicion detallada de epics y tareas tecnicas del pipeline de ingesta (ING-01 a ING-07).
- **Criterio de Aceptacion (DoD)**:
  - Documentacion aprobada y versionada en el repositorio sin emojis.
  - Especificaciones de arquitectura referenciadas y enlazadas.

### Fase 1: Persistencia Real y Dominio Financiero
- **Objetivo**: Consolidar PostgreSQL con Prisma ORM como unica fuente de verdad y eliminar mocks o almacenes temporales en memoria.
- **Entregables**:
  - Modelo relacional ampliado en `schema.prisma`: `User`, `Account`, `Category`, `Transaction`, `Budget`, `RawEvent`, `SourceConnection`, `ReviewItem`, `MerchantAlias`, `SyncCursor`.
  - Derivacion estricta del `userId` a partir del token JWT / sesion en todos los controladores.
  - Migracion de base de datos y semilla con datos reales de Panama.
  - Suite de pruebas unitarias y de integracion para transacciones, cuentas y presupuestos.
- **Criterio de Aceptacion (DoD)**:
  - Cero dependencias de arreglos `mockTransactions` o `mockAccounts` en runtime.
  - Pruebas pasando en backend (`npm test`) y compilacion TypeScript sin errores (`npm run build`).

### Fase 2: Pipeline de Ingesta Acelerada
- **Objetivo**: Desacoplar el transporte de ingesta, admitir webhooks con validacion criptografica HMAC e implementar almacenamiento de eventos crudos (`RawEvent`).
- **Entregables**:
  - Gateway de webhooks `/api/v1/ingest/webhook` protegido por HMAC SHA-256 y API Keys.
  - Tabla inmutable de `RawEvent` para preservar la carga util original antes de cualquier transformacion.
  - Manejo estricto de idempotencia por transporte (`x-idempotency-key`).
- **Criterio de Aceptacion (DoD)**:
  - Eventos duplicados responden `200 OK` con bandera `duplicated: true` sin reinyectar datos.
  - Firmas HMAC no validas son rechazadas con codigo `401 Unauthorized` bajo RFC 7807.

### Fase 3: Motor de Normalizacion, Deduplicacion y Enriquecimiento
- **Objetivo**: Transformar eventos crudos en transacciones financieras limpias y categorizadas para el mercado de Panama.
- **Entregables**:
  - Servicio de limpieza y normalizacion de descripciones de comercios panameños (Riba Smith, Super 99, Metrobus, ENSA, IDAAN, etc.).
  - Tabla de alias y sinonimos `MerchantAlias`.
  - Deduplicacion multi-nivel: hash SHA-256 de campos canonicos + tolerancia temporal (+/- 48 horas) para montos identicos.
  - Motor de categorizacion determinista y asignacion de puntaje de confianza (`confidenceScore`).
- **Criterio de Aceptacion (DoD)**:
  - Mas del 90% de los comercios panameños tipicos categorizados de forma determinista.
  - Deteccion de colisiones en ventana temporal evitando transacciones repetidas.

### Fase 4: Bandeja de Revision y Flujo de Aprobacion
- **Objetivo**: Implementar el ciclo de vida de transacciones no confirmadas en frontend y backend.
- **Entregables**:
  - Estados formales: `UNREVIEWED`, `REVIEWED`, `REJECTED`.
  - Endpoints dedicados para aprobacion rapida, edicion en linea y rechazo.
  - Interfaz de usuario en frontend optimizada para revision por teclado y acciones en lote.
- **Criterio de Aceptacion (DoD)**:
  - Transacciones con confianza < 0.85 aterrizan obligatoriamente en `UNREVIEWED`.
  - Aprobacion o rechazo actualiza el balance proyectado y el pacing engine de forma reactiva.

### Fase 5: Ingesta Asistida por Documentos
- **Objetivo**: Permitir la extraccion e importacion de estados de cuenta bancarios en PDF y CSV.
- **Entregables**:
  - Modulo extractor para formatos de Banco General, Banistmo y BAC Credomatic.
  - Vista previa de transacciones extraidas previo a la confirmacion de insercion.
  - Registro de trazabilidad y auditoria de la importacion.
- **Criterio de Aceptacion (DoD)**:
  - Extraccion precisa de fecha, descripcion, debito/credito y balance resultante.
  - Cobertura de pruebas con muestras anonimizadas de extractos bancarios.

### Fase 6: Descubrimiento y Piloto de Open Banking Panama
- **Objetivo**: Integrar sincronizacion automatica de cuentas bancarias mediante agregadores autorizados.
- **Entregables**:
  - Modulo de adaptacion para Prometeo API y protocolos bancarios regionales.
  - Flujo de conexion segura (OAuth2 / Connect Widget).
  - Tarea programada de sincronizacion incremental (`SyncCursor`).
- **Criterio de Aceptacion (DoD)**:
  - Descarga incremental sin duplicados mediante cursores temporales.
  - Desconexion de cuentas con revocacion de tokens inmediata.

### Fase 7: Sincronizacion Push y Notificaciones Bancarias
- **Objetivo**: Procesamiento en tiempo real de alertas bancarias (notificaciones por correo, push y mensajeria).
- **Entregables**:
  - Adaptador de procesamiento de correos de notificaciones de compra (Banco General, Banistmo, BAC, Yappy).
  - Webhook receptor endurecido con circuit-breaker para sobrecargas.
- **Criterio de Aceptacion (DoD)**:
  - Latencia de procesamiento inferior a 1.5 segundos desde recepcion del evento hasta inbox.

### Fase 8: Motor de Conciliacion Automatica
- **Objetivo**: Resolver discrepancias y emparejar transacciones manuales preexistentes con las ingresadas por via automatica.
- **Entregables**:
  - Algoritmo de emparejamiento fuzzy por fecha (+/- 3 dias), monto exacto y similitud de texto.
  - Fusion automatica conservando notas y etiquetas manuales del usuario.
- **Criterio de Aceptacion (DoD)**:
  - Evitar duplicacion de gastos registrados manualmente cuando ingresa la notificacion bancaria.

### Fase 9: Auditoria, Seguridad y Gobernanza de Datos
- **Objetivo**: Blindar la plataforma segun estandares financieros y la Ley 81 de Proteccion de Datos Personales de Panama.
- **Entregables**:
  - Cifrado en reposo AES-256-GCM para todos los secretos de integracion.
  - Registro inmutable de auditoria (`AuditLog`) para creacion, edicion y eliminacion.
  - Endpoint de exportacion completa y eliminacion definitiva de cuenta (derecho al olvido).
- **Criterio de Aceptacion (DoD)**:
  - Registro de auditoria verificable sin fugas de datos sensibles en logs.
  - Cumplimiento de politicas de retencion y anonimizacion.

---

## Backlog Detallado de Ingesta (Epics ING-01 a ING-07)

| Clave | Titulo | Prioridad | Dependencias | Estado |
|---|---|---|---|---|
| ING-01 | Modelo de datos relacional para ingesta (RawEvent, SourceConnection, ReviewItem, MerchantAlias) | P0 | Ninguna | Completado |
| ING-02 | Webhook Ingest Gateway con validacion HMAC, API Key e idempotencia estricta | P0 | ING-01 | Completado |
| ING-03 | Motor de deduplicacion multi-nivel (hash canonico + ventana temporal) | P0 | ING-01, ING-02 | Completado |
| ING-04 | Servicio de normalizacion de comercios y categorizacion heuristica para Panama | P1 | ING-01 | Completado |
| ING-05 | API y controladores de la bandeja de revision (Inbox UNREVIEWED / REVIEWED / REJECTED) | P0 | ING-01 | Completado |
| ING-06 | Extractores y parsers de estados de cuenta PDF/CSV (Banco General, Banistmo, BAC) | P1 | ING-01, ING-04 | Completado |
| ING-07 | Conector Open Banking (Prometeo API / agregador bancario autorizado) | P2 | ING-01, ING-03 | Pendiente |
