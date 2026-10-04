type CurrencyDescriptor =
    | string
    | {
        simbolo?: string | null;
        codigo?: string | null;
        nombre?: string | null;
    }
    | null
    | undefined;

export const getInitials = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatCurrency = (amount: number, currencyCodeOrSymbol?: string | null): string => {
    const normalizedToken = currencyCodeOrSymbol?.trim();

    if (!normalizedToken) {
        return formatDecimalAmount(amount);
    }

    // Si viene el símbolo en lugar del código ISO, lo mapeamos al código ISO correspondiente
    let isoCode = normalizedToken;
    if (normalizedToken === '$') isoCode = 'USD';
    else if (normalizedToken === '€') isoCode = 'EUR';
    else if (normalizedToken === 'S/') isoCode = 'PEN';

    // Determinar el locale basado en la moneda para un mejor formateo
    let locale = 'en-US';
    if (isoCode === 'PEN') locale = 'es-PE';
    else if (isoCode === 'EUR') locale = 'es-ES';

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: isoCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        // Fallback en caso de que se pase un string que no sea un código ISO válido
        return `${normalizedToken} ${amount.toFixed(2)}`;
    }
};

export const formatDecimalAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const resolveCurrencyToken = (currency?: CurrencyDescriptor): string | undefined => {
    if (typeof currency === 'string') {
        return currency.trim() || undefined;
    }

    return currency?.simbolo?.trim() || currency?.codigo?.trim() || undefined;
};

export const getCurrencyCandidates = (currency?: CurrencyDescriptor): string[] => {
    if (typeof currency === 'string') {
        const value = currency.trim();
        return value ? [value] : [];
    }

    return [currency?.simbolo, currency?.codigo, currency?.nombre]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));
};

export const resolveCurrencyLabel = (currency?: CurrencyDescriptor): string => {
    if (typeof currency === 'string') {
        return currency.trim() || 'Moneda';
    }

    return currency?.nombre?.trim() || currency?.codigo?.trim() || currency?.simbolo?.trim() || 'Moneda';
};

export const resolveCurrencyDisplay = (currency?: CurrencyDescriptor): string => {
    return resolveCurrencyToken(currency) || resolveCurrencyLabel(currency);
};

export const resolveCurrencyExcelFormat = (currency?: CurrencyDescriptor): string => {
    const token = resolveCurrencyToken(currency);

    return token ? `"${token}" #,##0.00` : '#,##0.00';
};

export const formatCurrencyAmount = (amount: number, currency?: CurrencyDescriptor): string => {
    const token = resolveCurrencyToken(currency);
    const label = resolveCurrencyLabel(currency);

    if (token) {
        return formatCurrency(amount, token);
    }

    return label !== 'Moneda'
        ? `${label} ${formatDecimalAmount(amount)}`
        : formatDecimalAmount(amount);
};

export const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

/* -------------------------------------------------------------------------- */
/* Unit helpers (peso y longitud) — centralizados para evitar conversión       */
/* dispersa en los formularios. La fuente canónica es KG y METROS.            */
/* -------------------------------------------------------------------------- */

export type WeightUnit = 'KG' | 'TN' | 'LB';
export type LengthUnit = 'M' | 'FT';

export const WEIGHT_UNITS: { value: WeightUnit; label: string }[] = [
    { value: 'KG', label: 'KG' },
    { value: 'TN', label: 'TN' },
    { value: 'LB', label: 'LB' },
];

export const LENGTH_UNITS: { value: LengthUnit; label: string }[] = [
    { value: 'M', label: 'm' },
    { value: 'FT', label: 'ft' },
];

const KG_PER_TON = 1000;
const KG_PER_POUND = 0.45359237;
const METERS_PER_FOOT = 0.3048;

/** Convierte un valor canónico en kilogramos a la unidad solicitada. */
export const convertWeightFromKg = (valueKg: number, unit: WeightUnit): number => {
    switch (unit) {
        case 'TN':
            return valueKg / KG_PER_TON;
        case 'LB':
            return valueKg / KG_PER_POUND;
        default:
            return valueKg;
    }
};

/** Convierte un valor en la unidad indicada a kilogramos (canónico). */
export const convertWeightToKg = (value: number, unit: WeightUnit): number => {
    switch (unit) {
        case 'TN':
            return value * KG_PER_TON;
        case 'LB':
            return value * KG_PER_POUND;
        default:
            return value;
    }
};

/** Convierte un valor canónico en metros a la unidad solicitada. */
export const convertLengthFromMeters = (valueMeters: number, unit: LengthUnit): number => {
    return unit === 'FT' ? valueMeters / METERS_PER_FOOT : valueMeters;
};

/** Convierte un valor en la unidad indicada a metros (canónico). */
export const convertLengthToMeters = (value: number, unit: LengthUnit): number => {
    return unit === 'FT' ? value * METERS_PER_FOOT : value;
};

/** Redondea a 2 decimales para presentación en inputs. */
export const round2 = (value: number): number => Math.round(value * 100) / 100;

