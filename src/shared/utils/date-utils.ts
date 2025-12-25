
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Parses a DateOnly string (YYYY-MM-DD) into a Date object set to local midnight.
 * This prevents timezone shifts that occur when parsing ISO strings directly.
 */
export const parseDateOnly = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

/**
 * Formats a DateOnly string (YYYY-MM-DD) to "DD/MM/YYYY"
 * @example "2025-12-01" -> "01/12/2025"
 */
export const formatDateShort = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Formats a DateOnly string to "DD de [Mes] del YYYY"
 * @example "2025-12-01" -> "01 de Diciembre del 2025"
 */
export const formatDateLong = (dateString: string): string => {
    const date = parseDateOnly(dateString);
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} del ${year}`;
};

/**
 * Formats a DateOnly string using Intl.DateTimeFormat
 * @param dateString YYYY-MM-DD string
 * @param options Intl.DateTimeFormatOptions
 */
export const formatDateCustom = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    const date = parseDateOnly(dateString);
    if (!date) return '';
    
    return new Intl.DateTimeFormat('es-PE', options).format(date);
};

// Alias for backward compatibility or simple usage
export const formatDateOnly = formatDateShort;
