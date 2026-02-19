# 🌟 Espacio Desafíos

> Sistema de Gestión para Clínica Terapéutica

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.io/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa)](https://web.dev/progressive-web-apps/)

## 📖 Descripción

**Espacio Desafíos** es una aplicación web progresiva (PWA) diseñada específicamente para la gestión integral de clínicas terapéuticas y centros de rehabilitación. Esta plataforma permite administrar de manera eficiente todos los aspectos operativos de una clínica que brinda terapias a niños y adolescentes.

### 🎯 Propósito del Sistema

El sistema nace de la necesidad de digitalizar y optimizar la gestión administrativa de clínicas terapéuticas, permitiendo:

- **Centralizar la información** de niños, profesionales y sesiones en un solo lugar
- **Automatizar el cálculo de liquidaciones** y comisiones para profesionales
- **Facilitar el seguimiento** de sesiones terapéuticas mensuales
- **Mejorar la comunicación** entre administración, profesionales y familias
- **Digitalizar el registro** de obras sociales y datos de contacto
- **Optimizar el tiempo** de gestión administrativa
- **Brindar acceso móvil** a profesionales para cargar sesiones desde cualquier lugar

### 👥 Usuarios Objetivo

| Perfil | Necesidades Cubiertas |
|--------|----------------------|
| **Administradores** | Gestión completa de profesionales, niños, valores, liquidaciones y estadísticas |
| **Profesionales Terapeutas** | Registro de sesiones y consulta de niños asignados |
| **Familias** | (Próximamente) Portal para ver progreso y próximas sesiones |

### 💡 Casos de Uso Principales

1. **Administrador registra un nuevo niño** con sus datos, obra social y asigna un profesional
2. **Profesional accede desde su celular** y carga las sesiones realizadas durante el mes
3. **Sistema registra automáticamente** las sesiones realizadas durante el mes
4. **Administrador gestiona liquidaciones** y pagos de profesionales
5. **Profesional registra pagos** a Espacio Desafíos, el administrador recibe notificación y verifica el pago

### 🏥 Contexto de Uso

Ideal para:
- Clínicas de psicomotricidad relacional
- Centros de estimulación temprana
- Consultorios de psicopedagogía
- Centros de fonoaudiología
- Clínicas de terapia ocupacional
- Centros de rehabilitación infantil
- Consultorios multidisciplinarios

---

## 📚 Guía Rápida de Uso

### Primeros Pasos

#### 1. Configuración Inicial (Solo Admin)
```
1. Iniciar sesión como administrador
2. Ir a "Más" > "Configuración de Valores" y configurar los 4 tipos:
   - Nomenclatura
   - Módulos
   - OSDE
   - Sesión Individual
3. Ir a "Profesionales" y agregar los profesionales de la clínica
4. Ir a "Niños" y registrar los niños
5. Ir a cada perfil de profesional y:
   a. Asignar pacientes al profesional
   b. Configurar qué tipos de módulo aplica a cada paciente
   c. Configurar porcentajes de comisión por tipo de módulo
```

#### 2. Uso Diario - Profesionale
```
1. Iniciar sesión con email y contraseña
2. Ver "Mis Niños" para consultar datos de pacientes asignados
3. Ir a "Sesiones" al final del mes
4. Seleccionar mes y año
5. Ver los pacientes asignados con sus módulos configurados
6. Cargar cantidad de sesiones por cada niño y tipo de módulo
7. Ver el cálculo automático con el porcentaje de comisión correspondiente
8. Guardar cambios
```

#### 3. Proceso Mensual - Administrador
```
1. Revisar sesiones cargadas por profesionales
2. Ir a "Liquidaciones"
3. Seleccionar año, mes y profesionales a liquidar
4. Calcular liquidaciones (automático basado en % configurado)
5. Revisar en "Pagos" los pagos reportados por profesionales y aprobar/rechazar
6. Ver en "Liquidaciones" el resumen por profesional:
   - Comisión total a abonar a Espacio Desafíos
   - Pagos verificados imputados por profesional
   - Saldo pendiente por profesional
7. Marcar liquidaciones como pagadas una vez conciliado el período
```

---

## 🚀 Tecnologías

| Categoría | Tecnologías |
|-----------|-------------|
| **Framework** | [Next.js 15](https://nextjs.org/) con App Router |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Base de Datos** | [Supabase](https://supabase.io/) (PostgreSQL) |
| **Auth** | Supabase Auth con SSR |
| **PWA** | [next-pwa](https://github.com/shadowwalker/next-pwa) |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **Iconos** | [Lucide React](https://lucide.dev/) |

---

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun
- Cuenta en [Supabase](https://supabase.com/)

---

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/espacio-desafios.git
cd espacio-desafios
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key

# PWA Manifest
NEXT_PUBLIC_PWA_NAME="Espacio Desafíos"
NEXT_PUBLIC_PWA_SHORT_NAME="Desafíos"
NEXT_PUBLIC_PWA_DESCRIPTION="Sistema de gestión para clínica terapéutica"
NEXT_PUBLIC_PWA_THEME_COLOR=#A38EC3
NEXT_PUBLIC_PWA_BACKGROUND_COLOR=#F8F7FF
```

> ⚠️ **Nota**: Reemplaza los valores de Supabase con tus credenciales reales.

### 4. Configurar Base de Datos en Supabase

#### 4.1 Crear Tablas
Ejecuta el script SQL ubicado en `database/schema.sql` en el SQL Editor de Supabase:

1. Ve a tu proyecto Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido de `database/schema.sql`
4. Ejecuta el script

#### Tablas creadas:
- `profiles` - Usuarios (admin/profesional)
- `children` - Pacientes/niños
- `children_professionals` - Relación muchos a muchos entre niños y profesionales
- `monthly_sessions` - Sesiones mensuales
- `module_values` - Valores de módulos
- `liquidations` - Liquidaciones
- `value_history` - Historial de valores
- `expenses` - Gastos operativos
- `professional_modules` - Configuración de módulos por profesional
- `notifications` - Sistema de notificaciones
- `payments_to_clinic` - Pagos de profesionales al centro

#### 4.2 Insertar Datos Iniciales (Opcional)

**Profesionales de ejemplo:**
```bash
# Opción A: Con especialidades (requiere emails únicos)
# Ejecutar: database/insert_professionals.sql

# Opción B: Solo nombres (emails temporales)
# Ejecutar: database/insert_professionals_temp.sql
```

**Niños de ejemplo:**
```bash
# Ejecutar: database/insert_children.sql
```

#### 4.3 Crear Usuario Administrador
```sql
-- Crear usuario admin (reemplaza con tu email)
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES (
  gen_random_uuid(),
  'tu-email@gmail.com',
  'Administrador',
  'admin',
  true
);
```

> ⚠️ **Nota importante**: Los profesionales deben crearse desde el panel de administración de la app, NO directamente en SQL, porque requieren autenticación en Supabase Auth.

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 6. Acceder por Primera Vez

1. Ve a `/login`
2. Inicia sesión con el email admin que configuraste
3. Configura los valores en "Más" > "Configuración de Valores"
4. Agrega profesionales desde "Profesionales"
5. Registra niños desde "Niños"
6. Configura módulos y porcentajes en el perfil de cada profesional

---

## 🗄️ Configuración de Base de Datos

### Tablas Principales

#### 1. **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'professional' CHECK (role IN ('admin', 'professional', 'assistant')),
  specialty TEXT,
  license_number TEXT,
  hourly_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **children**
```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE,
  document_number TEXT UNIQUE,
  health_insurance TEXT,
  affiliate_number TEXT,
  diagnostic TEXT,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_relationship TEXT,
  secondary_contact_name TEXT,
  secondary_contact_phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Córdoba',
  state TEXT DEFAULT 'Córdoba',
  country TEXT DEFAULT 'Argentina',
  assigned_professional_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **monthly_sessions**
```sql
CREATE TABLE monthly_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id),
  professional_id UUID NOT NULL REFERENCES profiles(id),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  session_count INTEGER NOT NULL DEFAULT 0,
  fee_value DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, month, year)
);
```

#### 4. **module_values**
```sql
CREATE TABLE module_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  fee_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. **liquidations**
```sql
CREATE TABLE liquidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  professional_percentage DECIMAL(5,2) NOT NULL DEFAULT 25.00,
  professional_amount DECIMAL(10,2) NOT NULL,
  clinic_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  payment_receipt_url TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(professional_id, month, year)
);
```

#### 6. **professional_modules** (NUEVA)
```sql
CREATE TABLE professional_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value_type TEXT NOT NULL CHECK (value_type IN ('nomenclatura', 'modulos', 'osde', 'sesion')),
  commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 25.00 CHECK (commission_percentage BETWEEN 0 AND 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, value_type)
);
```

#### 7. **notifications** (NUEVA)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. **payments_to_clinic** (NUEVA)
```sql
CREATE TABLE payments_to_clinic (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  payment_date DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('efectivo', 'transferencia')),
  amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. **children_professionals** (NUEVA - Relación muchos a muchos)
```sql
CREATE TABLE children_professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, professional_id, module_name)
);
```

> **Nota**: La columna `module_name` permite asignar diferentes tipos de módulo (nomenclatura, modulos, osde, sesion) a cada relación niño-profesional.

### Módulos Predefinidos

```sql
INSERT INTO module_values (module_name, fee_value) VALUES
  ('Estimulación Temprana', 35000),
  ('Integración Sensorial', 35000),
  ('Psicomotricidad', 35000),
  ('Lenguaje', 35000),
  ('Aprendizaje', 35000),
  ('Conducta', 35000),
  ('Desarrollo Social', 35000),
  ('Terapia Ocupacional', 35000),
  ('Fisioterapia', 35000),
  ('Psicología', 35000),
  ('Musicoterapia', 35000);
```

---

## 📁 Estructura del Proyecto

```
espacio-desafios/
├── 📂 public/
│   ├── icons/           # Iconos PWA
│   ├── manifest.json    # Configuración PWA
│   └── sw.js           # Service Worker
├── 📂 src/
│   ├── 📂 app/         # App Router (Next.js 15)
│   │   ├── (auth)/     # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/ # Grupo de rutas del dashboard
│   │   │   ├── admin/   # Rutas solo para administradores
│   │   │   │   ├── page.tsx                    # Dashboard admin
│   │   │   │   ├── configuracion/              # Configuración admin
│   │   │   │   ├── consumos/                   # Panel de gastos
│   │   │   │   ├── estadisticas/               # Estadísticas
│   │   │   │   ├── liquidaciones/              # Liquidaciones
│   │   │   │   ├── mas/                        # Menú "Más"
│   │   │   │   ├── ninos/                      # Gestión de niños
│   │   │   │   ├── notificaciones/             # Notificaciones admin
│   │   │   │   ├── profesionales/              # Gestión de profesionales
│   │   │   │   │   └── [id]/                   # Perfil detallado
│   │   │   │   └── valores/                    # Configuración de valores
│   │   │   ├── profesional/ # Rutas para profesionales
│   │   │   │   ├── page.tsx                    # Dashboard profesional
│   │   │   │   ├── configuracion/              # Configuración profesional
│   │   │   │   ├── ninos/                      # Mis pacientes
│   │   │   │   ├── notificaciones/             # Notificaciones profesional
│   │   │   │   └── sesiones/                   # Carga de sesiones
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/        # API Routes
│   │   ├── offline/     # Página offline PWA
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── 📂 components/
│   │   ├── admin/      # Componentes administrativos
│   │   ├── auth/       # Componentes de autenticación
│   │   ├── navigation/ # Navegación (header, bottom-nav)
│   │   ├── professional/ # Componentes para profesionales
│   │   │   └── session-row.tsx
│   │   └── ui/         # Componentes UI reutilizables
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── install-prompt.tsx
│   │       ├── modal.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── spinner.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── index.ts
│   ├── 📂 lib/
│   │   ├── actions/    # Server Actions
│   │   │   ├── liquidations.ts
│   │   │   ├── payments.ts
│   │   │   ├── professionals.ts
│   │   │   ├── statistics.ts
│   │   │   └── values.ts
│   │   ├── hooks/      # Custom React Hooks
│   │   ├── supabase/   # Cliente Supabase
│   │   └── utils/      # Utilidades
│   ├── 📂 types/
│   │   └── index.ts    # Tipos TypeScript
│   └── middleware.ts   # Middleware de autenticación
├── 📄 database/
│   └── schema.sql      # Esquema completo de BD
├── 📄 next.config.ts   # Configuración de Next.js + PWA
├── 📄 tsconfig.json    # Configuración TypeScript
└── 📄 package.json
```

---

## 👥 Roles y Funcionalidades

### 🔑 Administrador (`admin`)

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| 📊 **Dashboard** | ✅ | Vista general con estadísticas de toda la clínica |
| 👨‍⚕️ **Gestión de Profesionales** | ✅ | Crear, editar, activar/desactivar profesionales |
| 👶 **Gestión de Niños** | ✅ | Registrar, editar, asignar profesionales, dar de alta/baja |
| 💰 **Configuración de Valores** | ✅ | Administrar valores históricos (pasado, presente, futuro) |
| 💵 **Liquidaciones** | ✅ | Calcular y gestionar pagos con filtros avanzados |
| 📊 **Panel de Consumos** | ✅ | Registro de gastos operativos con resumen mensual |
| 📈 **Estadísticas** | ✅ | Reportes visuales conectados a datos reales |
| 🔔 **Notificaciones** | ✅ | Sistema de notificaciones con badge en header |
| ⚙️ **Configuración** | ✅ | Perfil y logout |

#### Flujo del Administrador:

1. **Dashboard**: Vista general con estadísticas generales
2. **Header**: Botones de Notificaciones (campana) y Configuración (tuerca) en la esquina superior derecha
3. **Gestión de Profesionales**:
   - **Listado**: Ordenamiento (Activos primero), WhatsApp directo, click en tarjeta para ver perfil
   - **Edición**: Contraseña visible, datos del profesional, botón para eliminar/desactivar
   - **Perfil de Liquidación**: 
     - Asignación de pacientes vinculados
     - **Configuración de módulos por paciente**: Cada paciente puede tener uno o más tipos de módulo asignados (Nomenclatura, Módulos, OSDE, Sesión Individual)
     - Porcentaje variable por tipo de módulo
4. **Valores**: Historial mensual editable (añadir, editar, eliminar valores)
5. **Liquidaciones**: Filtros por año, mes y profesional
6. **Consumos**: Registro de gastos (Luz, Gas, Fotocopias, etc.) con balance mensual
7. **Estadísticas**: 
   - Reportes de salud financiera (Ingresos vs Gastos)
   - Seguimiento de profesionales sin registro de pagos
   - Distribución por tipo de valor y estados de pago
8. **Gestión de Niños**:
   - **Listado**: Filtrado por profesional, click en "Editar" para abrir modal
   - **Edición**: Modal con todos los campos, incluye botón para eliminar paciente

---

### 👩‍⚕️ Profesional (`professional`)

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
|  **Mis Niños** | ✅ | Ver niños asignados (sin diagnóstico), con Llamar y WhatsApp |
|  **Notificaciones** | ✅ | Sistema de notificaciones con badge en header |
| ⚙️ **Configuración** | ✅ | Perfil y logout |
| 📱 **Acceso Móvil** | ✅ | Optimizado para uso desde celular |

#### Flujo del Profesional:

1. **Dashboard**:
   - Card destacada: "¡Comienza a cargar tus sesiones!" → redirige a Sesiones
   - Estadísticas del mes actual (Pacientes y Sesiones)

2. **Header**: 
   - Botones de Notificaciones (campana) y Configuración (tuerca) en la esquina superior derecha
   - Badge rojo con contador de notificaciones no leídas

3. **Mis Niños**:
   - Listado de pacientes asignados
   - **Sin campo diagnóstico**
   - Botones: **Llamar** (tel:) y **WhatsApp** (wa.me)
   - Click en paciente: sin acción (por ahora)

4. **Sesiones**:
   - Filtros por año y mes
   - **Entre nombre y "Mes anterior"**: Tipo de Módulo y Porcentaje (ej: "Psicomotricidad • 25%")
   - Pacientes con múltiples módulos aparecen en filas separadas
   - Botón "Guardar Sesiones" **centrado**

---

## 🎨 Sistema de Diseño

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary** | `#A38EC3` | Botones principales, acentos, enlaces |
| **Primary Light** | `#B8A5D3` | Hover states |
| **Primary Dark** | `#8A75AA` | Active states |
| **Pink** | `#F4C2C2` | Fondos secundarios, badges |
| **Yellow** | `#F9E79F` | Acentos, alertas suaves |
| **Aqua** | `#A8E6CF` | Estados positivos, éxito |
| **Background** | `#F8F7FF` | Fondo principal de la app |
| **Card** | `#FFFFFF` | Tarjetas y contenedores |
| **Text Primary** | `#2D2A32` | Texto principal |
| **Text Secondary** | `#6B6570` | Texto secundario |
| **Text Muted** | `#9A94A0` | Texto deshabilitado |
| **Border** | `#E8E5F0` | Bordes y divisores |

### Sistema de Espaciado

Basado en múltiplos de 4px para consistencia:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--spacing-1` | 4px | Espaciado mínimo |
| `--spacing-2` | 8px | Espaciado pequeño |
| `--spacing-3` | 12px | Espaciado medio-pequeño |
| `--spacing-4` | 16px | Espaciado estándar |
| `--spacing-6` | 24px | Espaciado grande |
| `--spacing-8` | 32px | Espaciado extra grande |

### Sistema Tipográfico

| Variable | Tamaño | Uso |
|----------|--------|-----|
| `--text-xs` | 12px | Texto pequeño, captions |
| `--text-sm` | 14px | Texto secundario |
| `--text-base` | 16px | Texto normal |
| `--text-lg` | 18px | Subtítulos |
| `--text-xl` | 20px | Títulos pequeños |
| `--text-2xl` | 24px | Títulos |
| `--text-3xl` | 30px | Títulos destacados |

### Sistema de Z-Index

Organizado en niveles para evitar conflictos:

| Clase | Valor | Uso |
|-------|-------|-----|
| `.z-dropdown` | 10 | Menús desplegables |
| `.z-sticky` | 20 | Elementos sticky |
| `.z-fixed` | 30 | Navegación fija |
| `.z-modal-backdrop` | 40 | Fondo de modales |
| `.z-modal` | 50 | Modales |
| `.z-popover` | 60 | Popovers |
| `.z-tooltip` | 70 | Tooltips |
| `.z-toast` | 80 | Notificaciones toast |

### Sombras

```css
--shadow-soft: 0 4px 20px rgba(163, 142, 195, 0.15);
--shadow-card: 0 2px 12px rgba(163, 195, 0.08);
--shadow-button: 0 4px 14px rgba(163, 142, 195, 0.3);
```

### Transiciones

```css
--transition-fast: 150ms ease;    /* Micro-interacciones */
--transition-normal: 200ms ease;  /* Transiciones estándar */
--transition-slow: 300ms ease;    /* Animaciones complejas */
```

### Touch Targets

Todos los elementos interactivos tienen un tamaño mínimo de 44x44px para cumplir con los estándares de accesibilidad móvil.

### Navegación

#### Header (Esquina superior derecha):
- 🔔 **Campana**: Notificaciones (badge rojo si hay no leídas)
- ⚙️ **Tuerca**: Configuración
- Touch targets de 44x44px para accesibilidad

#### Bottom Navigation (Admin):
- 🏠 Inicio
- 👨‍⚕️ Profs
- 👶 Pacientes
- 💵 Liquid
- 📊 Más

#### Bottom Navigation (Profesional):
- 🏠 Inicio
- 👶 Pacientes
- 📅 Sesiones
- 🧾 Facturacion

---

## 🧩 Componentes UI

### Componentes Base

| Componente | Descripción | Props principales |
|------------|-------------|-------------------|
| **Button** | Botón con variantes y estados | `variant`, `size`, `loading`, `leftIcon`, `rightIcon` |
| **Input** | Campo de texto con validación | `label`, `error`, `hint`, `leftIcon`, `rightIcon` |
| **Select** | Selector desplegable | `options`, `label`, `error`, `hint` |
| **Textarea** | Área de texto multilínea | `label`, `error`, `hint`, `rows` |
| **Badge** | Etiqueta de estado | `variant`, `size` |
| **Card** | Contenedor con sombra | `variant`, `onClick` |
| **Modal** | Ventana modal | `isOpen`, `onClose`, `title`, `maxWidth` |

### Componentes de Carga

| Componente | Uso |
|------------|-----|
| **Skeleton** | Placeholder durante carga de datos |
| **SkeletonCard** | Skeleton para tarjetas |
| **SkeletonList** | Skeleton para listados |
| **SkeletonTable** | Skeleton para tablas |
| **Spinner** | Indicador de carga circular |
| **LoadingOverlay** | Overlay de carga sobre contenido |
| **LoadingState** | Estado de carga centrado |

### Componentes de Feedback

| Componente | Uso |
|------------|-----|
| **ToastProvider** | Provider para notificaciones toast |
| **useToast()** | Hook para mostrar toasts |
| **InstallPrompt** | Prompt de instalación PWA |

---

## 💼 Lógica de Negocio

### Cálculo de Facturación

```typescript
// Valor de facturación = Número de sesiones × Valor del módulo
total_amount = session_count × fee_value
```

### Cálculo de Comisiones

Por defecto: Profesional recibe 75%, Clínica 25% (configurable por módulo)

```typescript
// Comisión personalizable por profesional y tipo de módulo
professional_amount = total_amount × (professional_percentage / 100)
clinic_amount = total_amount - professional_amount
```

### Flujo de Trabajo

1. **Admin registra valores** para cada tipo de módulo
2. **Admin configura profesional** con módulos y porcentajes personalizados
3. **Admin registra niño** con profesional asignado
4. **Profesional registra sesiones** mensualmente por niño y módulo
5. **Sistema calcula automáticamente** la liquidación con los porcentajes configurados
6. **Admin aprueba y marca como pagada** la liquidación
7. **Admin recibe notificación** de cada pago registrado o carga de sesiones

---

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |

---

## 🔧 Solución de Problemas

### Error: "Module not found"

```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión con Supabase

1. Verifica que las variables de entorno estén correctas
2. Asegúrate de que las políticas RLS estén configuradas
3. Verifica que el proyecto Supabase esté activo

### Error: "use server file can only export async functions"

No importes funciones entre archivos 'use server'. Copia la función localmente o conviértela en un utility compartido sin 'use server'.

### PWA no se instala

1. Verifica que `manifest.json` esté accesible en `/manifest.json`
2. Asegúrate de que los iconos existan en `/icons/`
3. Revisa la consola del navegador para errores del Service Worker

### Problemas de Tailwind CSS v4

Tailwind v4 usa configuración diferente. Los estilos se definen directamente en `globals.css` usando `@theme inline`.

---

## 📱 PWA - Progressive Web App

### Características

- ✅ **Instalable** en Android e iOS
- ✅ **Prompt automático** de instalación inteligente
- ✅ **Funciona offline** con página de fallback
- ✅ **Push notifications** preparado
- ✅ **Cache optimizado** con múltiples estrategias
- ✅ **Shortcuts** en pantalla de inicio

### Instalación

#### Android (Chrome)
1. Abre la app en Chrome
2. Espera 2-3 segundos y aparecerá el prompt de instalación
3. O toca el menú (⋮) → "Agregar a pantalla de inicio"

#### iOS (Safari)
1. Abre la app en Safari
2. Espera el prompt con instrucciones visuales
3. O manualmente: Botón Compartir → "Agregar a pantalla de inicio"

#### Desktop (Chrome/Edge)
1. Abre la app
2. Click en el ícono de instalación en la barra de direcciones
3. Sigue las instrucciones

### Comportamiento del Prompt

| Característica | Descripción |
|----------------|-------------|
| **Detección de dispositivo** | Android, iOS, Desktop |
| **Prompt Android** | Nativo con `beforeinstallprompt` |
| **Instrucciones iOS** | Modal visual paso a paso |
| **Frecuencia** | Máximo cada 7 días |
| **Persistencia** | No muestra si ya instalada |

### Estructura PWA

```
public/
├── manifest.json          # Configuración PWA
├── sw.js                  # Service Worker
├── logo.jpg               # Logo principal
└── icons/
    ├── icon-192x192.png   # Icono estándar
    ├── icon-512x512.png   # Icono grande
    └── apple-touch-icon.png # Icono iOS
```

### Shortcuts Disponibles

Desde el icono de la app en pantalla de inicio:
- 🗓️ **Mis Sesiones** → `/profesional/sesiones`
- 👶 **Mis Pacientes** → `/profesional/ninos`
- 💵 **Liquidaciones** → `/admin/liquidaciones` (solo admin)

---

## 🔒 Seguridad

- ✅ Autenticación JWT con Supabase Auth
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Middleware de protección de rutas
- ✅ Headers de seguridad (XSS, Clickjacking, etc.)
- ✅ Validación de roles en servidor

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

---

## 📞 Soporte

¿Tienes preguntas o necesitas ayuda?

- 📧 Email: soporte@espaciodesafios.cl
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/espacio-desafios/issues)

---

<p align="center">
  <strong>🌟 Espacio Desafíos - Transformando vidas, una terapia a la vez 🌟</strong>
</p>

<p align="center">
  Hecho con ❤️ para la clínica terapéutica Espacio Desafíos
</p>
