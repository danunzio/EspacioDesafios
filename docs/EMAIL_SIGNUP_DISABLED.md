# 🔧 Solución: "Email signups are disabled"

## ❌ Problema
A pesar de tener "Enable Email provider" activado, el sistema muestra el error "Email signups are disabled".

## ✅ Solución Paso a Paso

### Paso 1: Verificar Configuración de Site URL

El error suele aparecer cuando no está configurada la URL del sitio:

1. Ve a Supabase Dashboard → **Authentication** → **URL Configuration**
2. Configura:
   - **Site URL**: `https://tu-dominio.vercel.app` (o `http://localhost:3000` para desarrollo)
   - **Redirect URLs**: Agrega tu dominio

### Paso 2: Verificar "Enable New Users"

Busca esta configuración (puede estar en diferentes lugares según la versión):

**Opción A - En Project Settings:**
1. Ve a **Project Settings** (icono de engranaje)
2. Busca **Authentication** o **Auth Settings**
3. Activa **"Enable New Users"** o **"Allow new users to sign up"**

**Opción B - En la sección de Providers:**
1. Authentication → Providers → Email
2. Busca un toggle llamado **"Enable Signup"** o **"Allow new users"**
3. Actívalo

### Paso 3: Configuración de Hooks (Si existe)

Algunos proyectos tienen hooks de autenticación que pueden bloquear registros:

1. Ve a **Database** → **Hooks** (o **Triggers**)
2. Busca triggers en la tabla `auth.users`
3. Asegúrate de que no haya triggers bloqueando inserciones

### Paso 4: Verificar Rate Limits

Supabase tiene límites en el plan gratuito:

- **Verifica** si has alcanzado el límite de usuarios del plan gratuito
- **Espera** unos minutos si has hecho muchos intentos (rate limiting)

---

## 🚨 Si Nada Funciona - Solución Alternativa

### Usar Edge Function con Service Role

La forma más confiable es usar una Edge Function con el rol de servicio:

1. **Despliega la Edge Function** que ya te proporcioné en:
   `supabase/functions/create-professional/index.ts`

2. **Comando para desplegar:**
   ```bash
   npx supabase login
   npx supabase link --project-ref tu-project-ref
   npx supabase functions deploy create-professional
   ```

3. **Modifica el frontend** para llamar a la Edge Function:

```typescript
// En add-professional-modal.tsx, reemplaza el handleSubmit:

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  const isValid = await validateForm()
  if (!isValid) return

  setLoading(true)
  setErrors({})

  try {
    // Llamar a la Edge Function
    const { data, error } = await supabase.functions.invoke('create-professional', {
      body: {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        specialty: formData.specialty.trim(),
      },
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)

    setSuccess(true)
    setToast({ message: 'Profesional creado exitosamente', type: 'success' })

    setTimeout(() => {
      onSuccess?.()
      onClose()
    }, 1500)
  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al crear el profesional'
    setToast({ message: errorMessage, type: 'error' })
    setErrors({ general: errorMessage })
  } finally {
    setLoading(false)
  }
}
```

---

## 📝 Checklist de Verificación

- [ ] Site URL configurado en Authentication → URL Configuration
- [ ] Redirect URLs configurados
- [ ] Email Provider habilitado (Enable Email provider = ON)
- [ ] Signups habilitados (buscar "Enable Signup" o "Allow new users")
- [ ] No hay rate limits activos
- [ ] El email no está ya registrado
- [ ] El proyecto Supabase está activo

---

## 💡 Nota Importante

Si estás en el **plan gratuito de Supabase**, a veces hay limitaciones temporales. Intenta:

1. Refrescar la página de Supabase Dashboard
2. Cerrar y volver a iniciar sesión en Supabase
3. Esperar 5-10 minutos e intentar nuevamente

Si el problema persiste, contacta al soporte de Supabase o considera usar la Edge Function como solución permanente.
