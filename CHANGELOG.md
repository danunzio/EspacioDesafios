# 📋 Changelog - Espacio Desafíos

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

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
