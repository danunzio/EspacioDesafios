# Instrucciones para Insertar Profesionales y Niños

## ⚠️ IMPORTANTE: Los Profesionales NO se pueden insertar directamente por SQL

La tabla `profiles` tiene una restricción de clave foránea (foreign key) que requiere que el `id` exista primero en `auth.users` (la tabla de autenticación de Supabase).

### Opción 1: Usar el Panel de Administración (Recomendado)
1. Inicia sesión como administrador
2. Ve a la pestaña "Profesionales"
3. Haz clic en "Nuevo Profesional"
4. Completa el formulario con:
   - Nombre completo
   - Especialidad
   - Email temporal (puede ser falso por ahora)
   - Teléfono (opcional)
   - Contraseña temporal

### Opción 2: Script SQL para Niños (Funciona correctamente)
Los niños SÍ se pueden insertar directamente. Usa este script en el SQL Editor de Supabase:

```sql
-- Insertar niños con obras sociales
INSERT INTO children (id, full_name, health_insurance, guardian_name, is_active) VALUES
  (gen_random_uuid(), 'Herrera Alejo', 'UP CERAMISTA', 'Apoderado', true),
  (gen_random_uuid(), 'Sabrina Acosta/Laureano Juarez', 'AUSTRAL', 'Apoderado', true),
  (gen_random_uuid(), 'Mamani Pilar', 'UP', 'Apoderado', true),
  (gen_random_uuid(), 'Luan Robledo', 'OSPACA', 'Apoderado', true),
  (gen_random_uuid(), 'Giovanni Alcoba', 'IOSFA/ospecon', 'Apoderado', true),
  (gen_random_uuid(), 'Duarte Sofia / muller isabella', 'Galeno/OSPAGA', 'Apoderado', true),
  (gen_random_uuid(), 'Barraza Maite', 'UP', 'Apoderado', true),
  (gen_random_uuid(), 'Carla Fernanadez', 'UP', 'Apoderado', true),
  (gen_random_uuid(), 'Luciano Nuñez', 'OSPECON', 'Apoderado', true),
  (gen_random_uuid(), 'Garelli Joaquin', 'AUSTRAL', 'Apoderado', true),
  (gen_random_uuid(), 'Oña Nahitan', 'UP', 'Apoderado', true),
  (gen_random_uuid(), 'Fran Fagundez', 'OSPACA', 'Apoderado', true),
  (gen_random_uuid(), 'Torres Candela', 'MEDIFE', 'Apoderado', true),
  (gen_random_uuid(), 'Ojeda Ignacio', 'OSPACA', 'Apoderado', true),
  (gen_random_uuid(), 'Helena Martinez', 'OSPACA', 'Apoderado', true);

-- Verificar la inserción
SELECT full_name, health_insurance FROM children ORDER BY full_name;
```

### Lista de Profesionales a Agregar
Abril Villalba
Agostina Acevedo
Alejo Herrera
Alvaro Robledo
Amber Alleguero
Antonella Vera Romero
Beltran Coronel
Benjamín Wasinger
Benjamin Benitez
Benjamin Mamani
Bruno Orellana
Camilo Maciel
Candela Torres
Carla Fernandez
Cata Gomez
Constantino
Dylan Godoy
Elias Alvelo
Ema Cisneros
Emanuel Cisneros
Emilio Russo
Emily Garcia
Emma Dos Santos
Espiniza Joaquin
Felipe Galvan
Felipe Herterich
Felipe Portillo
Fran Maciel Fagundez
Franco Aguado
Gabriel Rodriguez
Gadiel Huaylla
Helena Martinez
Hernan Flores
Ian Orrego
Ignacio Gonzalo
Ignacio Herrera
Ignacio Ojeda
Iker Flores
Isaias Baez
Italia Chavez
Joaquin Espindola
Joaquin Garelli
Kaila Villalba
Liam Mendez
Lian Mendez
Lionel Escobar
Luciano Nuñez
Luis Lopez
Luan Robledo
Maite Barraza
Martina Cerchiari
Mateo Anse
Mateo Molina
Matias Luna
Maximo Canseco
Nahitan Oña
Naomi
Noah Fagundez
Otto Stale
Pedro Lencina
Pia Saavedra
Pilar Mamani
Samuel Godoy
Santiago Wasinger
Santino Lopez
Stefano Sosa
Taylor Quiroga
Thiago Cider
Thiago Rusch
Tiziano
Triana Heis
Valentino Meza
Victoria Herrera

## Notas
- Los emails temporales pueden modificarse después desde el panel de administración
- Las especialidades también pueden agregarse/editar después
- Una vez creados los profesionales, podrás asignarles niños desde el panel de administración
