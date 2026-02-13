# 📧 Configuración de Email para Profesionales

## ⚠️ Problema: Profesionales no reciben email de confirmación

Cuando creas un profesional desde el panel de administración, Supabase Auth envía un email de confirmación por defecto. Si no llega el email, el profesional no puede iniciar sesión.

---

## ✅ Soluciones (Elige una)

### Solución 1: Desactivar Confirmación de Email (Recomendada - Más fácil)

Esta opción hace que los profesionales queden confirmados automáticamente y puedan iniciar sesión inmediatamente.

**Pasos:**
1. Ve a tu proyecto Supabase: https://supabase.com/dashboard
2. Navega a **Authentication** → **Providers**
3. Busca **Email** y haz clic
4. Desactiva la opción **"Confirm email"** (o "Confirmación de email")
5. Guarda los cambios

**Ventajas:**
- ✅ Profesionales pueden iniciar sesión inmediatamente
- ✅ No requiere configurar SMTP
- ✅ Más simple para administradores

**Desventajas:**
- ❌ No hay verificación de email (menos seguro, pero aceptable para este caso)

---

### Solución 2: Configurar SMTP (Para emails reales)

Si quieres que los profesionales reciban emails reales de confirmación.

**Pasos:**

#### Opción A: Gmail (Para pruebas)
1. Ve a **Authentication** → **Providers** → **Email** → **SMTP Settings**
2. Configura:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: tu-email@gmail.com
   SMTP Password: [App Password de Gmail]
   Sender Name: Espacio Desafíos
   ```

3. Para obtener el App Password de Gmail:
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"
   - Ve a "Contraseñas de aplicaciones"
   - Genera una contraseña para "Otra (Nombre personalizado)"
   - Ponle nombre "Supabase" y copia la contraseña

#### Opción B: SendGrid (Para producción)
1. Crea cuenta en https://sendgrid.com
2. Crea un API Key
3. Configura en Supabase:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [tu-api-key-de-sendgrid]
   Sender Name: Espacio Desafíos
   ```

**Ventajas:**
- ✅ Emails reales de confirmación
- ✅ Más profesional
- ✅ Verificación de email real

**Desventajas:**
- ❌ Requiere configuración adicional
- ❌ Puede costar dinero (SendGrid)
- ❌ Profesionales deben confirmar antes de iniciar sesión

---

### Solución 3: Edge Function (Más técnica)

Usar una Edge Function de Supabase para crear profesionales confirmados automáticamente.

**Pasos:**

1. **Instalar CLI de Supabase** (si no lo tienes):
   ```bash
   npm install -g supabase
   ```

2. **Inicializar proyecto** (en la raíz de tu proyecto):
   ```bash
   supabase login
   supabase link --project-ref tu-project-ref
   ```

3. **Desplegar la Edge Function**:
   ```bash
   supabase functions deploy create-professional
   ```

4. **Obtener la URL de la función**:
   - Ve a Supabase Dashboard → Edge Functions
   - Copia la URL de `create-professional`

5. **Configurar variable de entorno** en tu `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://tu-ref.supabase.co/functions/v1
   ```

6. **Modificar el frontend** para usar la Edge Function en lugar de `signUp()` directo.

**Ventajas:**
- ✅ Control total sobre el proceso
- ✅ Auto-confirmación sin desactivar globalmente
- ✅ Más seguro

**Desventajas:**
- ❌ Requiere conocimientos técnicos
- ❌ Más complejo de configurar

---

## 🔧 Solución Rápida: Trigger SQL

Si tienes acceso como superuser en Supabase, ejecuta este SQL para autoconfirmar profesionales:

```sql
-- Autoconfirmar automáticamente usuarios con rol 'professional'
CREATE OR REPLACE FUNCTION public.auto_confirm_professional()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id 
  AND email_confirmed_at IS NULL
  AND raw_user_meta_data->>'role' = 'professional';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger
DROP TRIGGER IF EXISTS auto_confirm_professional_trigger ON auth.users;
CREATE TRIGGER auto_confirm_professional_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_professional();
```

**Nota:** Este trigger puede requerir permisos especiales. Si no funciona, usa la Solución 1.

---

## 📝 Resumen Recomendado

| Método | Complejidad | Costo | Recomendado para |
|--------|-------------|-------|------------------|
| **Solución 1** (Desactivar confirmación) | ⭐ Fácil | Gratis | ✅ Desarrollo y producción simple |
| **Solución 2** (Gmail SMTP) | ⭐⭐ Media | Gratis | Pruebas con emails reales |
| **Solución 2** (SendGrid) | ⭐⭐ Media | Pago | Producción con emails profesionales |
| **Solución 3** (Edge Function) | ⭐⭐⭐ Difícil | Gratis | Casos especiales |

---

## ✅ Verificación

Después de aplicar una solución, prueba:

1. Crea un nuevo profesional desde el panel admin
2. Intenta iniciar sesión con el email y contraseña del profesional
3. Debería funcionar inmediatamente (Solución 1) o después de confirmar el email (Solución 2)

---

## 🆘 ¿Sigues teniendo problemas?

1. **Revisa los logs** en Supabase Dashboard → Authentication → Logs
2. **Verifica el spam** en el correo del profesional
3. **Comprueba que el email sea válido**
4. **Asegúrate de que el usuario no exista ya** en auth.users

Si el problema persiste, crea un issue en GitHub con:
- Screenshot de la configuración de Email en Supabase
- Logs de errores (si hay)
- El email que intentas usar
