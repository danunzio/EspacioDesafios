/**
 * Calcula el monto de facturación basado en la cantidad de sesiones y el valor del módulo
 * @param sessionCount - Número de sesiones
 * @param moduleValue - Valor del módulo
 * @returns Monto de facturación
 */
export function calculateBilling(sessionCount: number, moduleValue: number): number {
  return sessionCount * moduleValue
}

/**
 * Calcula la comisión basada en el total facturado
 * @param totalBilled - Total facturado
 * @param commissionRate - Tasa de comisión (por defecto 25%)
 * @returns Monto de la comisión
 */
export function calculateCommission(
  totalBilled: number,
  commissionRate: number = 0.25
): number {
  return totalBilled * commissionRate
}

/**
 * Calcula el total mensual basado en las sesiones y el valor del módulo
 * @param sessions - Array de sesiones o número total de sesiones
 * @param moduleValue - Valor del módulo
 * @returns Total mensual
 */
export function calculateMonthlyTotal(
  sessions: number | Array<{ count: number }>,
  moduleValue: number
): number {
  const sessionCount = Array.isArray(sessions)
    ? sessions.reduce((acc, session) => acc + (session.count || 1), 0)
    : sessions
  
  return calculateBilling(sessionCount, moduleValue)
}

/**
 * Formatea un monto como moneda en pesos chilenos
 * @param amount - Monto a formatear
 * @returns String formateado como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Obtiene el nombre del mes en español
 * @param month - Número del mes (1-12)
 * @returns Nombre del mes
 */
export function getMonthName(month: number): string {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  
  return months[month - 1] || ''
}
