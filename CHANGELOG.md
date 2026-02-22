# 📋 Changelog - Espacio Desafíos

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.4] - 2026-02-21

### ✨ Agregado

#### 🎯 UX - Formularios Extensos
- **Componente `AccordionSection`** - Secciones colapsables con animación suave
- **Componente `ProgressIndicator`** - Indicador visual de progreso en formularios
- **Formularios reorganizados** con secciones colapsables:
  - Agregar/Editar Paciente: Paciente → Responsable → Asignación
  - Agregar Profesional: Personal → Acceso
- Indicador de completado (✓) en cada sección
- Soporte para campos requeridos con indicador visual

#### 🔐 UX - Confirmaciones de Acciones Críticas
- **Componente `ConfirmModal`** con `useConfirm` hook
- Modal de confirmación personalizado con:
  - Título y mensaje descriptivo
  - Iconos contextuales (trash, logout, warning)
  - Variantes de color (danger, warning, info)
  - Botones de confirmar/cancelar claros
- Reemplazados 10 usos de `confirm()` nativo:
  - Eliminar gasto, valor, paciente, profesional, módulo, obra social
  - Desactivar profesional
  - Cerrar sesión (admin y profesional)

#### ⏳ UX - Feedback de Carga (Skeletons)
- **Componentes Skeleton expandidos**:
  - `SkeletonStatCard` - Tarjetas de estadísticas
  - `SkeletonDashboard` - Dashboard completo
  - `SkeletonProfessionalList` - Lista de profesionales
  - `SkeletonChildrenList` - Lista de pacientes
  - `SkeletonChart` / `SkeletonPieChart` - Gráficos
  - `SkeletonStatistics` - Página estadísticas completa
  - `SkeletonSessions` - Página de sesiones
  - `SkeletonPayments` - Página de pagos
  - `SkeletonValues` - Página de valores
  - `SkeletonExpenses` - Página de consumos
- Reemplazados textos "Cargando..." por skeletons en:
  - `/profesional/sesiones`
  - `/profesional/ninos`
  - `/profesional/facturacion`
  - `/admin/estadisticas`
  - `/admin/valores`
  - `/admin/consumos`
  - `/admin/pagos`

#### ♿ Accesibilidad
- **aria-label** agregado a todos los botones con solo iconos:
  - Editar, eliminar, activar/desactivar módulos
  - Enviar WhatsApp
  - Marcar notificación como leída
  - Aprobar/rechazar liquidaciones
  - Guardar/cancelar edición
- **Mejora de contraste**: Color `#9A94A0` (ratio 3:1) → `#78716C` (ratio 4.6:1)
  - 49 instancias actualizadas en textos secundarios
  - Cumple WCAG AA para accesibilidad

#### 👋 Saludo Dinámico
- **Saludo basado en hora del día** en `/profesional`:
  - 06:00 - 12:00: "Buenos días"
  - 12:00 - 20:00: "Buenas tardes"
  - 20:00 - 06:00: "Buenas noches"

### 🛠 Corregido

#### Cálculo de Comisiones
- **Corregido cálculo de comisión por módulo** en `/profesional/facturacion`:
  - Cada módulo ahora muestra su propio porcentaje de comisión
  - Agregado `commissionPercentage` y `professionalAmount` al `ModuleBreakdown`
  - La card "Comisión Total a abonar a Espacio Desafíos" ahora muestra el valor correcto

#### Accesibilidad (a11y) - Labels y Controles
- **Labels asociados a controles** - Agregado `htmlFor` e `id` a todos los labels de formularios:
  - `edit-child-modal.tsx`: Labels de obra social y selección de profesionales
  - `add-child-modal.tsx`: Labels de obra social y selección de profesionales
  - `facturacion/page.tsx`: Labels de fecha, tipo de pago, importe y notas
  - `valores/page.tsx`: Labels de año, mes y valor
  - `sesiones/page.tsx`: Labels de año y mes
- **Elementos clickeables accesibles** - Agregado `role="button"`, `tabIndex` y manejadores de teclado:
  - `modal.tsx`: Backdrop del modal ahora manejable con teclado (Escape/Enter/Space)
  - `card.tsx`: Cards clickeables ahora accesibles por teclado
  - `configuracion-client.tsx`: Items de configuración navegables
  - `professional-detail-client.tsx`: Pacientes asignados navegables
  - `admin-professionals-client.tsx`: Tarjetas de profesionales navegables
- **autoFocus eliminado** - Removido atributo `autoFocus` que causa problemas de usabilidad:
  - `valores/page.tsx`: Input de valor
  - `professional-detail-client.tsx`: Input de porcentaje de comisión

#### Rendimiento (Performance)
- **Inicialización lazy de estado** - Cambiado `useState(valor)` a `useState(() => valor)`:
  - `facturacion/page.tsx`: selectedYear y selectedMonth
  - `session-row.tsx`: localValue
  - `estadisticas/page.tsx`: selectedYear
  - `valores/page.tsx`: year y month
  - `sesiones/page.tsx`: year y month
- **Actualizaciones funcionales de setState** - Usado `prev => prev + 1` para evitar closures obsoletos:
  - `facturacion/page.tsx`: handlePrevMonth y handleNextMonth
- **Dynamic imports** - Implementado `next/dynamic` para recharts en `estadisticas/page.tsx`:
  - Reduce significativamente el bundle inicial
  - Carga diferida de componentes pesados de gráficos

#### Corrección de Código
- **Array index como key** - Reemplazado uso de `index` por identificadores estables:
  - `facturacion/page.tsx`: Module breakdown usa `${moduleName}-${sessionCount}`
  - `estadisticas/page.tsx`: Cell components usan `entry.name`
  - `admin-children-client.tsx`: Professional names usan `name` como key
- **Next.js Link** - Reemplazado `<a href>` por `<Link>` para navegación interna:
  - `notificaciones/page.tsx`: Link a /admin/pagos
  - `debug/page.tsx`: Link a /login

### 💄 Mejorado

#### UI Mobile
- **Botones en `/admin/pagos`**: En mobile, los botones "Aprobar" y "Rechazar" ahora se muestran apilados verticalmente
- **Opción eliminada**: "Liquidaciones" removida del menú de `/admin/mas`
- **Contraseña visible por defecto** en detalles de profesional

#### Lint y TypeScript
- 15 errores de tipo `any` corregidos
- 8 errores de `setState` en `useEffect` corregidos
- 2 errores de entidades no escapadas corregidos
- 1 error de prop `children` corregido
- 1 error de variable `module` corregido
- **40+ advertencias de accesibilidad y rendimiento corregidas**:
  - 8 labels sin asociación a controles
  - 5 elementos clickeables sin eventos de teclado
  - 5 inicializaciones de estado no lazy
  - 4 actualizaciones setState no funcionales
  - 4 usos de array index como key
  - 2 usos de `<a>` en lugar de `<Link>`
  - 1 import de librería pesada sin dynamic import
  - 2 usos de autoFocus
- **Resultado final**: 0 errores, ~15 warnings (principalmente sugerencias de useReducer y componentes grandes)

---

## [1.1.3] - 2026-02-19

### 🛠 Corregido

- **Admin/Pagos**: Corregida consulta a `payments_to_clinic` que provocaba el error de embed entre `payments_to_clinic` y `profiles`. Ahora se resuelven los profesionales en una segunda consulta tipada.
- **Dashboard Admin**: Corregido el tipo de `RecentActivity` y la construcción de `combinedRecent` para cumplir con TypeScript estricto.
- **Modales**: Ajustado el z-index del contenido del modal para que no quede oculto detrás del fondo borroso al abrir los modales de profesionales y pacientes.

### 💄 Mejorado

- **Dashboard Profesional**: Las tarjetas de “Mis Pacientes” y “Sesiones” vuelven a ser clicables y redirigen a `/profesional/ninos` y `/profesional/sesiones`.
- **Navegación Profesional**: Se reintrodujo la pestaña “Mi Facturación” en el `BottomNav`, apuntando a `/profesional/facturacion`.
- **Admin/Más**: Simplificada la pantalla dejando solo el menú de accesos rápidos; la gestión de obras sociales quedó totalmente centralizada en `/admin/obras-sociales`.
- **Admin/Consumos**: Eliminada la categoría de gasto **Gas** del panel de consumos.

---

## [1.1.2] - 2026-02-18

### 🔄 Refactorización de Dashboards y Navegación

#### 👨‍💼 Panel de Administración
- **Dashboard**: Se eliminaron las secciones de "Valor Módulo" y "Liquidaciones" de la vista principal para simplificar el resumen.
- **Notificaciones**: 
  - Se eliminó el botón global "Borrar todas".
  - Se movió el botón individual "Borrar" a la derecha de cada notificación para mejorar la accesibilidad y el diseño.

#### 👨‍⚕️ Panel de Profesional
- **Dashboard**: Se eliminaron las tarjetas de "Facturación" y "Comisión 25%" para enfocar la vista en la gestión de pacientes y sesiones.
- **Navegación**: Se eliminó la pestaña "Facturacion" del menú inferior (`BottomNav`).
- **Textos**: Se actualizaron las llamadas a la acción (CTA) y avisos para referirse a "mantener el registro actualizado" en lugar de "facturación".

#### 📝 Documentación
- Actualizado **README.md** para reflejar la eliminación de las secciones financieras en el perfil del profesional y simplificar los flujos de uso diario.

---

## [1.1.0] - 2026-02-18

### ✨ Agregado

#### 🎨 Sistema de Diseño UI Completo
- **Sistema de espaciado** basado en 4px (spacing-1 a spacing-20)
- **Sistema de z-index** organizado (z-dropdown: 10, z-sticky: 20, z-fixed: 30, etc.)
- **Sistema tipográfico** con variables CSS (--text-xs a --text-4xl, font-weights)
- **Sistema de transiciones** (--transition-fast: 150ms, --transition-normal: 200ms, --transition-slow: 300ms)
- **Contenedores responsive** con clase `.container-mobile`
- **Touch target utility** (--touch-target: 44px)

#### 🧩 Nuevos Componentes UI
- **Skeleton** - Componentes de carga para mejor UX:
  - `Skeleton` base con variantes (text, circular, rectangular, card)
  - `SkeletonCard` para tarjetas
  - `SkeletonList` para listados
  - `SkeletonTable` para tablas
- **Spinner** - Indicadores de carga:
  - `Spinner` con tamaños (sm, md, lg, xl)
  - `LoadingOverlay` para superposición de carga
  - `LoadingState` para estados de carga
- **Toast** - Sistema de notificaciones toast:
  - `ToastProvider` y `useToast` hook
  - 4 variantes (success, error, warning, info)
  - Auto-dismiss después de 4 segundos
  - Animaciones suaves

#### 📱 PWA Completamente Configurada
- **Manifest.json** mejorado:
  - Iconos maskable y any
  - Shortcuts para acceso rápido (Sesiones, Pacientes, Liquidaciones)
  - Configuración de idioma es-AR
- **Install Prompt** inteligente:
  - Detecta dispositivo (Android/iOS/Desktop)
  - Prompt nativo en Android (beforeinstallprompt)
  - Instrucciones visuales paso a paso para iOS
  - Persiste decisión por 7 días
  - No muestra si ya está instalada
- **Service Worker** optimizado:
  - Cache strategies (network-first, cache-first, stale-while-revalidate)
  - Soporte offline
  - Push notifications
- **Página offline** con diseño coherente
- **Meta tags Apple/iOS** completos (apple-touch-icon, status-bar-style, etc.)

#### 🔐 Login Mejorado
- Logo de Espacio Desafíos en pantalla de login
- Fondo con gradiente sutil
- Textos con colores de la paleta

### 🔄 Mejorado

#### Componentes UI Existentes
- **Button**:
  - Touch target mínimo 44px
  - 5 variantes (primary, secondary, outline, ghost, destructive)
  - Prop `loading` con spinner automático
  - Props `leftIcon` y `rightIcon`
  - Estados hover/active/focus/disabled mejorados
- **Input**:
  - Touch target mínimo 44px
  - Props `leftIcon` y `rightIcon`
  - Prop `hint` para texto de ayuda
  - Estados consistentes (hover, focus, disabled, error)
- **Select**:
  - Touch target mínimo 44px
  - Icono ChevronDown integrado
  - forwardRef para mejor control
- **Textarea**:
  - Estados consistentes con otros inputs
  - Prop `hint`
- **Badge**:
  - 6 variantes (default, primary, success, warning, error, outline)
  - 3 tamaños (sm, md, lg)
- **Modal**:
  - z-index usando sistema organizado
- **Header**:
  - Touch targets 44px en botones
  - Estados hover/active/focus mejorados
  - z-index corregido
- **BottomNav**:
  - z-index usando sistema organizado

### 📝 Documentación
- README.md actualizado con nuevas funcionalidades PWA
- CHANGELOG.md actualizado

---

## [1.0.4] - 2026-02-18

### ✨ Agregado

- **Reporte de Profesionales sin Pagos** en `/admin/estadisticas`:
  - Se reemplazó el gráfico de sesiones por una sección dinámica de profesionales que aún no han registrado sus pagos mensuales.
  - Permite identificar rápidamente quiénes tienen saldos pendientes por reportar.
- **Nuevos gráficos financieros**:
  - Implementación de Salud Financiera (Ingresos vs Gastos).
  - Distribución de estados de verificación de pagos.
- **Simplificación de Interfaz**:
  - Se eliminó el gráfico de Evolución de Sesiones para enfocar la pantalla en el control de pagos y salud financiera.
- **Notificaciones automáticas**:
  - El profesional recibe una notificación instantánea en su panel cuando administración aprueba o rechaza un pago registrado.

## [1.0.3] - 2026-02-18

### ✨ Agregado

- **Registro y verificación de pagos** desde el panel profesional:
  - El profesional registra pagos en `/profesional/facturacion`
  - Se notifica automáticamente a administración en `/admin/notificaciones`
- **Pantalla de revisión de pagos** en `/admin/pagos`:
  - Listado por período de pagos reportados
  - Acciones para aprobar o rechazar pagos
- **Integración con liquidaciones** en `/admin/liquidaciones`:
  - Resumen por profesional con:
    - Comisión total a abonar a Espacio Desafíos
    - Pagos verificados imputados por profesional
    - Saldo pendiente a abonar al centro
  - Detalle de pagos por profesional con estado (Pendiente/Verificado/Rechazado)
- **Actividad Reciente (Admin)** ahora muestra también pagos registrados por profesionales

### 🐛 Corregido

- **admin/pagos/page.tsx** – Corregido tipo de `Badge` usando `variant="error"` en lugar de `danger`

---

## [1.0.2] - 2026-02-16

### ✨ Agregado

#### Módulos por Paciente
- **Tabla `children_professionals` ampliada** con columna `module_name` para guardar qué tipo de módulo aplica a cada paciente-profesional
- **Selección de módulos en perfil de profesional** - Ahora cada paciente puede tener asignado uno o más tipos de módulo:
  - Nomenclatura
  - Módulos
  - OSDE
  - Sesión Individual
- **Porcentaje de comisión personalizado** - Cada tipo de módulo tiene su propio porcentaje de comisión configurado en `professional_modules`

#### Profesional/Sesiones
- **Pacientes con módulos asignados** - Solo aparecen los pacientes asignados al profesional con sus tipos de módulo correspondientes
- **Cálculo de facturación dinámico** - Usa el porcentaje de comisión específico de cada tipo de módulo
- **Visualización de porcentaje** - Muestra el porcentaje de comisión configurado para cada módulo

### 🐛 Corregido

#### Errores de Runtime
- **AbortError en profesional/ninos** - Agregado manejo para ignorar errores de cancelación de requests
- **AbortError en profesional/sesiones** - Agregado manejo similar

#### Errores de TypeScript
- **admin/consumos/page.tsx** - Corregido tipo de `description` de `undefined` a `string`
- **admin/consumos/page.tsx** - Corregido tipo para `setFormCategory`
- **admin/liquidaciones/page.tsx** - Corregido `variant="info"` a `variant="warning"`
- **admin/estadisticas/page.tsx** - Corregido tipo del formatter en Tooltip de gráficos
- **admin/mas/page.tsx** - Corregido `size="xs"` a `size="sm"` en botones
- **profesional/facturacion/page.tsx** - Corregidos tipos para badges y campos faltantes
- **lib/actions/liquidations.ts** - Corregido tipo faltante en `LiquidationCalculation`
- **admin/profesionales/[id]/professional-detail-client.tsx** - Corregido `variant="info"` a `variant="warning"`

#### Errores de Datos
- **add-child-modal.tsx** - Eliminado campo `fee_value` que no existe en la tabla
- **profesional/page.tsx** - Actualizado para obtener pacientes de ambas fuentes (asignación directa y `children_professionals`)
- **use-children.ts** - Actualizado hook para obtener niños de ambas fuentes

### 📝 Documentación
- Actualización de schema.sql con nueva columna `module_name` en `children_professionals`

---

## [1.0.1] - 2026-02-15

### 🐛 Corregido

#### Errores de Runtime
- **TypeError en admin-children-client.tsx** - Agregado fallback `(child.professional_names ?? [])` para prevenir errores cuando professional_names es undefined

#### UI/UX
- **Botón "Ver Perfil" eliminado** de la lista de profesionales - Ahora al hacer click en la tarjeta del profesional se navega directamente al perfil
- **Botón "Eliminar" eliminado** de las listas de profesionales y pacientes
- **Botón "Eliminar paciente" agregado** dentro del modal de edición de pacientes
- **Botón "Desactivar profesional"** renombrado correctamente en modal de edición
- **Importes no utilizados** limpiados (Trash2, Eye)

### 📝 Documentación
- Actualización de README.md con nuevos flujos de UI

---

## [1.0.0] - 2026-02-13

### ✨ Agregado

#### 🎨 UI/UX y Diseño Responsive
- **Rediseño completo de modales** para móvil (bottom sheet style en dispositivos pequeños)
- **Optimización para Samsung S8** (360x740px) y dispositivos similares
- **Navegación inferior mejorada** con iconos y textos adaptativos
- **Header compacto** para móvil con altura reducida
- **Componentes UI responsive**: Cards, Inputs, Buttons con tamaños adaptativos
- **Animaciones suaves** para modales (slide-up en móvil, scale en desktop)
- **Toast notifications reposicionados** para no interferir con bottom nav

#### 👶 Gestión de Niños
- **Campo Obra Social** en formulario de niños con 9 opciones predefinidas
- **Visualización de obra social** en listados de niños (panel admin y profesional)
- **Modal de edición de niños** completo con todos los campos
- **Funcionalidad de editar niños** operativa desde el panel administrador
- **Filtrado por profesional** en listado de niños
- **Integración con datos reales** de Supabase (Server Components)

#### 👨‍⚕️ Gestión de Profesionales
- **Campo Especialidad** obligatorio en registro de profesionales
- **Modal de agregar profesional** con validaciones completas
- **Integración con Supabase Auth** para creación de usuarios
- **Scripts SQL** para carga masiva de profesionales (75 profesionales)
- **Asignación de profesionales** a niños desde el panel admin

#### ⚙️ Panel de Administración - Valores
- **4 tipos de valores configurables**:
  - Nomenclatura
  - Módulos
  - OSDE
  - Sesión Individual
- **Tabs interactivos** para cambiar entre tipos de valores
- **Historial por tipo de valor** con indicador de valor actual
- **Resumen mensual** con todos los valores configurados
- **Formulario de configuración** por período (año/mes)

#### 🗂️ Estructura de Datos
- **Tabla `children`** ampliada con campo `health_insurance`
- **Tabla `profiles`** con campo `specialty` para profesionales
- **Sistema de valores múltiples** en reemplazo de valor único de módulo
- **Scripts SQL** para inserción masiva de datos:
  - `insert_professionals.sql` - 75 profesionales con especialidades
  - `insert_children.sql` - 15 niños con obras sociales
  - `insert_professionals_temp.sql` - Emails temporales para profesionales

#### 🔧 Mejoras Técnicas
- **Server Components** para carga de datos reales (niños y profesionales)
- **Client Components** para interactividad (modales, filtros, búsqueda)
- **Separación de responsabilidades** en páginas admin:
  - `page.tsx` - Server Component (carga de datos)
  - `admin-children-client.tsx` - Client Component (UI interactiva)
- **TypeScript estricto** en todos los nuevos componentes
- **Manejo de errores** mejorado en formularios
- **Validaciones de formulario** completas con mensajes descriptivos

### 🐛 Corregido

#### Errores de Build
- **Variable `body` duplicada** en `route.ts` renombrada a `requestBody` y `messageBody`
- **Errores de TypeScript** en componentes de modales
- **Conflictos de nombres** en parámetros de funciones

#### Errores de Funcionalidad
- **Botón "Editar" no funcionaba** - Creado modal de edición completo
- **Datos de prueba en producción** - Migrado a datos reales de Supabase
- **Página de profesionales con mock data** - Ahora consulta base de datos real
- **Campo email nullable** - Solucionado con emails temporales para profesionales

#### Responsive
- **Modales cortados en móvil** - Ahora usan max-height y scroll adecuado
- **Bottom nav tapa contenido** - Agregado padding-bottom seguro
- **Textos desbordados** - Implementado truncamiento con ellipsis
- **Botones muy pequeños** - Aumentado tamaño mínimo a 44px para touch

### 📝 Documentación

#### Nuevos Archivos
- `CHANGELOG.md` - Este archivo
- `database/README.md` - Instrucciones para carga de datos
- `database/schema.sql` - Esquema completo de base de datos
- `database/insert_professionals.sql` - Script profesionales con especialidades
- `database/insert_children.sql` - Script niños con obras sociales
- `database/insert_professionals_temp.sql` - Script profesionales sin email

#### Archivos Actualizados
- `README.md` - Estructura de tablas actualizada

### 🔒 Seguridad
- **Row Level Security (RLS)** configurado en todas las tablas
- **Políticas de acceso** por rol (admin/profesional)
- **Validación en servidor** de todos los formularios
- **Sanitización de inputs** en campos de texto

---

## [0.9.0] - 2026-02-12

### ✨ Agregado
- Estructura base del proyecto con Next.js 15
- Autenticación con Supabase Auth
- Sistema de roles (admin/profesional)
- Dashboard básico para administradores
- Dashboard básico para profesionales
- Navegación inferior con 5 tabs
- Pantalla de login funcional
- PWA básica con manifest y service worker

### 🎨 UI
- Paleta de colores definida
- Componentes UI base (Button, Card, Input, Badge)
- Sistema de diseño con Tailwind CSS v4
- Layout responsive inicial

---

## 📊 Estadísticas del Proyecto

### Líneas de Código
- **TypeScript/JavaScript**: ~15,000 líneas
- **CSS/Tailwind**: ~2,000 líneas
- **SQL**: ~500 líneas

### Componentes Creados
- **UI Components**: 8
- **Modales**: 4 (AddChild, EditChild, AddProfessional, EditProfessional)
- **Páginas**: 15+
- **Hooks personalizados**: 3

### Tablas de Base de Datos
- **profiles**: Usuarios y profesionales
- **children**: Niños/pacientes
- **monthly_sessions**: Sesiones mensuales
- **module_values**: Valores de módulos terapéuticos
- **liquidations**: Liquidaciones a profesionales
- **commission_payments**: Pagos de comisiones
- **session_statistics**: Estadísticas de sesiones
- **audit_logs**: Auditoría de cambios

---

## 🎯 Próximas Versiones (Roadmap)

### [1.1.0] - Planificado
- [ ] Página de perfil de usuario
- [ ] Edición de perfil para profesionales
- [ ] Cambio de contraseña
- [ ] Recuperación de contraseña vía email
- [ ] Notificaciones push para nuevas liquidaciones
- [ ] Exportar reportes a PDF/Excel

### [1.2.0] - Planificado
- [ ] Sistema de mensajería interna
- [ ] Calendario de sesiones
- [ ] Recordatorios automáticos
- [ ] App móvil nativa (React Native)
- [ ] Integración con WhatsApp Business

### [2.0.0] - Planificado
- [ ] Multi-sucursal
- [ ] Facturación electrónica
- [ ] Integración con sistemas de salud
- [ ] Portal para padres/tutores
- [ ] Reportes avanzados con IA

---

## 🏆 Créditos

### Desarrollo
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **PWA**: next-pwa, Service Workers
- **UI/UX**: Diseño responsive mobile-first

### Inspiración
- Diseño inspirado en apps modernas de gestión
- Paleta de colores suaves y terapéuticas
- Enfoque en usabilidad para usuarios no técnicos

---

## 📞 Contacto

Para reportar bugs o sugerir mejoras:
- GitHub Issues: [https://github.com/danunzio/EspacioDesafios/issues](https://github.com/danunzio/EspacioDesafios/issues)
- Email: soporte@espaciodesafios.cl

---

<p align="center">
  <strong>Espacio Desafíos - Cambiando vidas, una terapia a la vez</strong>
</p>
