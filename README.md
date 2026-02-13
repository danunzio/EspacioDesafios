# 🌟 Espacio Desafíos

> Sistema de Gestión para Clínica Terapéutica

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.io/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa)](https://web.dev/progressive-web-apps/)

## 📖 Descripción

**Espacio Desafíos** es una aplicación web progresiva (PWA) diseñada para la gestión integral de clínicas terapéuticas. Permite administrar profesionales, niños/pacientes, sesiones de terapia, facturación y liquidaciones de manera eficiente y moderna.

### ✨ Características Principales

- 🔐 **Autenticación segura** con roles diferenciados
- 📱 **Diseño responsive** optimizado para móvil y escritorio
- 🎯 **PWA completa** con soporte offline
- 📊 **Dashboards interactivos** con estadísticas en tiempo real
- 💰 **Gestión financiera** con cálculo automático de comisiones
- 🎨 **Interfaz moderna** con paleta de colores suaves y atractiva
- ⚡ **Rendimiento optimizado** con Next.js 15
- 🔒 **Seguridad** con headers de protección y autenticación JWT

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

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗄️ Configuración de Base de Datos

### Tablas Principales

#### 1. **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'professional')),
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  specialization TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **children**
```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  cedula TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  mother_name TEXT,
  mother_phone TEXT,
  mother_email TEXT,
  father_name TEXT,
  father_phone TEXT,
  father_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  school TEXT,
  grade TEXT,
  diagnosis TEXT,
  referral_source TEXT,
  referral_doctor TEXT,
  therapy_start_date DATE,
  observation_date DATE,
  assigned_professional_id UUID REFERENCES profiles(id),
  fee_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  discharge_date DATE,
  discharge_reason TEXT,
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
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ninos/
│   │   │   │   ├── profesionales/
│   │   │   │   ├── liquidaciones/
│   │   │   │   └── valores/
│   │   │   ├── profesional/ # Rutas para profesionales
│   │   │   │   ├── page.tsx
│   │   │   │   ├── sesiones/
│   │   │   │   ├── ninos/
│   │   │   │   └── facturacion/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/        # API Routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── 📂 components/
│   │   ├── admin/      # Componentes administrativos
│   │   ├── auth/       # Componentes de autenticación
│   │   ├── navigation/ # Navegación (header, bottom-nav)
│   │   ├── professional/ # Componentes para profesionales
│   │   └── ui/         # Componentes UI reutilizables
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── input.tsx
│   ├── 📂 lib/
│   │   ├── actions/    # Server Actions
│   │   │   └── liquidations.ts
│   │   ├── hooks/      # Custom React Hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-children.ts
│   │   │   └── use-sessions.ts
│   │   ├── supabase/   # Cliente Supabase
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   └── utils/      # Utilidades
│   │       └── calculations.ts
│   ├── 📂 types/
│   │   └── index.ts    # Tipos TypeScript
│   └── middleware.ts   # Middleware de autenticación
├── 📄 next.config.ts   # Configuración de Next.js + PWA
├── 📄 tsconfig.json    # Configuración TypeScript
├── 📄 postcss.config.mjs
├── 📄 tailwind.config.ts
└── 📄 package.json
```

---

## 👥 Roles y Funcionalidades

### 🔑 Administrador (`admin`)

| Funcionalidad | Descripción |
|---------------|-------------|
| 📊 **Dashboard** | Vista general con estadísticas de toda la clínica |
| 👨‍⚕️ **Gestión de Profesionales** | Crear, editar, activar/desactivar profesionales |
| 👶 **Gestión de Niños** | Registrar, editar, asignar profesionales, dar de alta/baja |
| 💰 **Configuración de Valores** | Administrar valores de módulos terapéuticos |
| 💵 **Liquidaciones** | Calcular y gestionar pagos a profesionales |
| 📈 **Estadísticas** | Reportes de facturación y sesiones |

### 👩‍⚕️ Profesional (`professional`)

| Funcionalidad | Descripción |
|---------------|-------------|
| 📊 **Dashboard Personal** | Vista de sus sesiones y estadísticas |
| 👶 **Mis Niños** | Ver niños asignados y sus datos |
| 🗓️ **Registro de Sesiones** | Registrar sesiones mensuales por niño |
| 💵 **Mi Facturación** | Ver historial de liquidaciones y comisiones |
| 📱 **Acceso Móvil** | Optimizado para uso desde celular |

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

### Sombras

```css
--shadow-soft: 0 4px 20px rgba(163, 142, 195, 0.15);
--shadow-card: 0 2px 12px rgba(163, 195, 0.08);
--shadow-button: 0 4px 14px rgba(163, 142, 195, 0.3);
```

### Componentes UI

#### Button
- **Primary**: Fondo `#A38EC3`, texto blanco
- **Secondary**: Fondo `#F4C2C2`, texto oscuro
- **Ghost**: Transparente con borde

#### Card
- Fondo blanco
- Bordes redondeados (`0.625rem`)
- Sombra suave
- Padding consistente

#### Input
- Borde `#E8E5F0`
- Fondo blanco
- Focus ring en color primary

---

## 💼 Lógica de Negocio

### Cálculo de Facturación

```typescript
// Valor de facturación = Número de sesiones × Valor del módulo
total_amount = session_count × fee_value
```

### Cálculo de Comisiones

```typescript
// Por defecto: Profesional recibe 25%, Clínica 75%
professional_amount = total_amount × 0.25
clinic_amount = total_amount × 0.75
```

### Flujo de Trabajo

1. **Admin registra un niño** con datos completos y profesional asignado
2. **Profesional registra sesiones** mensualmente para cada niño
3. **Sistema calcula automáticamente**:
   - Total facturado por niño
   - Comisión del profesional
   - Total de sesiones del mes
4. **Admin genera liquidaciones** mensuales por profesional
5. **Profesional visualiza** su facturación y liquidaciones

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

### PWA no se instala

1. Verifica que `manifest.json` esté accesible en `/manifest.json`
2. Asegúrate de que los iconos existan en `/icons/`
3. Revisa la consola del navegador para errores del Service Worker

### Problemas de Tailwind CSS v4

Tailwind v4 usa configuración diferente. Los estilos se definen directamente en `globals.css` usando `@theme inline`.

---

## 📱 PWA - Instalación

### Android (Chrome)
1. Abre la app en Chrome
2. Toca el menú (⋮)
3. Selecciona "Agregar a pantalla de inicio"

### iOS (Safari)
1. Abre la app en Safari
2. Toca el botón Compartir
3. Selecciona "Agregar a pantalla de inicio"

### Desktop (Chrome/Edge)
1. Abre la app
2. Click en el ícono de instalación en la barra de direcciones
3. Sigue las instrucciones

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
