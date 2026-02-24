export const getFriendlyError = (rawError: string): string => {
  if (rawError.includes('duplicate key') || rawError.includes('unique constraint')) {
    return 'Ya existe una configuración con ese dato. Por favor verificá los módulos asignados.';
  }
  if (rawError.includes('foreign key')) {
    return 'No se puede completar la acción porque hay datos relacionados.';
  }
  if (rawError.includes('network') || rawError.includes('fetch')) {
    return 'Error de conexión. Verificá tu internet e intentá de nuevo.';
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
};
