# Reporte de ESLint

Fecha: 2026-02-13 (Actualizado)

## Resumen

- Total de problemas: 13
- Errores: 0
- Advertencias: 13

## Detalles

### Errores Críticos
¡Felicidades! No se encontraron errores críticos.

### Advertencias (Warnings)

#### Variables no utilizadas (@typescript-eslint/no-unused-vars)
- `public/sw.js`: 'CACHE_NAME' (2:7)
- `src/app/(dashboard)/admin/ninos/admin-children-client.tsx`: 'Mail' (18:3)
- `src/app/(dashboard)/admin/profesionales/admin-professionals-client.tsx`: 'setProfessionals' (33:25)
- `src/app/(dashboard)/admin/valores/page.tsx`: 'DollarSign' (8:3)
- `src/app/(dashboard)/layout.tsx`: 'Profile' (6:10)
- `src/app/(dashboard)/profesional/ninos/page.tsx`: 'Button' (5:10)
- `src/app/api/push/route.ts`: 'vapidSubject' (56:11)
- `src/components/auth/login-form.tsx`: 'err' (35:14)
- `src/components/navigation/header.tsx`: 'isAdmin' (12:59)
- `src/lib/supabase/middleware.ts`: 'options' (18:48)

#### React Hooks (react-hooks/exhaustive-deps)
- `src/components/modals/add-child-modal.tsx`: Dependencia faltante 'fetchProfessionals' (79:6)
- `src/components/modals/edit-child-modal.tsx`: Dependencia faltante 'fetchProfessionals' (91:6)

#### Optimización de Imágenes (@next/next/no-img-element)
- `src/components/navigation/header.tsx`: Uso de `<img>` en lugar de `<Image />` (28:15)

---
*Reporte generado automáticamente por Trae AI.*
