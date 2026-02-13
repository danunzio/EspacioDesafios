-- SQL para configurar autoconfirmación de emails en Supabase
-- Ejecutar esto en el SQL Editor de Supabase como superuser

-- Opción 1: Desactivar confirmación de email globalmente
-- Esto hace que todos los nuevos usuarios queden confirmados automáticamente
UPDATE auth.config 
SET confirm_email = false 
WHERE id = (SELECT id FROM auth.config LIMIT 1);

-- Opción 2: O si prefieres mantener la confirmación pero configurar el SMTP:
-- Ve al Dashboard de Supabase → Authentication → Providers → Email → SMTP Settings
-- Configura tu servidor SMTP allí

-- Opción 3: Trigger para autoconfirmar usuarios con rol 'professional'
CREATE OR REPLACE FUNCTION public.auto_confirm_professional()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el usuario para confirmar el email automáticamente
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

-- Nota: Este trigger requiere permisos especiales. 
-- Si no funciona, usa la Opción 1 (desactivar confirmación globalmente)
