-- Script para insertar niños con sus obras sociales
-- Solo nombres y obra social como solicitó el usuario
-- Ejecutar en Supabase SQL Editor

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
