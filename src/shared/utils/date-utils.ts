
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

/**
 * Returns current date in "YYYY-MM-DD" format using local time
 */
export const getCurrentDateISO = (): string => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

/**
 * Returns current time in "HH:MM" format using local time
 */
export const getCurrentTimeISO = (): string => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
};

/**
 * Formats a date string (ISO or DateOnly) to "YYYY-MM-DD"
 * Safe for input[type="date"] values
 */
export const toInputDate = (dateString?: string | Date | null): string => {
    if (!dateString) return '';
    // If it's already a string, try to split T part
    if (typeof dateString === 'string') {
        return dateString.split('T')[0];
    }
    // If it's a Date object
    const yyyy = dateString.getFullYear();
    const mm = String(dateString.getMonth() + 1).padStart(2, '0');
    const dd = String(dateString.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formats a date string or Date object to "HH:MM"
 * Safe for input[type="time"] values
 */
export const toInputTime = (dateInput?: string | Date | null): string => {
    if (!dateInput) return '';
    
    let date: Date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else {
        date = dateInput;
    }

    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
};

/**
 * Combines a date string (YYYY-MM-DD) and time string (HH:MM) into an ISO string
 * Returns null if inputs are invalid
 */
export const combineDateTime = (date: string, time: string): string | null => {
    if (!date || !time) return null;
    try {
        const combined = new Date(`${date}T${time}:00`);
        if (isNaN(combined.getTime())) return null;
        return combined.toISOString();
    } catch (e) {
        return null;
    }
};

/**
 * Formats a Date object or ISO string to "DD/MM/YYYY HH:mm"
 * Uses local time.
 */
export const formatDateTime = (dateInput: string | Date): string => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hh}:${min}`;
};

/**
 * Formats a Date object or ISO string to "DD/MM/YYYY"
 * Uses local time.
 */
export const formatDate = (dateInput: string | Date): string => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formats a Date object or ISO string to "HH:mm"
 * Uses local time.
 */
export const formatTime = (dateInput: string | Date): string => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${hh}:${min}`;
};

// Alias for backward compatibility or simple usage
export const formatDateOnly = formatDateShort;
