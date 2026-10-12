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
/* dispersa en los formularios. La referencia interna de conversión es KG y   */
/* METROS, pero los formularios almacenan el valor en la unidad seleccionada  */
/* (según el `TipoMaestro`), por lo que la conversión se hace entre unidades.  */
/* -------------------------------------------------------------------------- */

export type WeightUnit = 'KG' | 'TN' | 'LB';
export type LengthUnit = 'M' | 'MM' | 'CM' | 'IN' | 'FT';

export const WEIGHT_UNITS: { value: WeightUnit; label: string }[] = [
    { value: 'KG', label: 'KG' },
    { value: 'TN', label: 'TN' },
    { value: 'LB', label: 'LB' },
];

export const LENGTH_UNITS: { value: LengthUnit; label: string }[] = [
    { value: 'M', label: 'm' },
    { value: 'MM', label: 'mm' },
    { value: 'CM', label: 'cm' },
    { value: 'IN', label: 'in' },
    { value: 'FT', label: 'ft' },
];

const KG_PER_TON = 1000;
const KG_PER_POUND = 0.45359237;
const METERS_PER_FOOT = 0.3048;
const METERS_PER_INCH = 0.0254;
const METERS_PER_MM = 0.001;
const METERS_PER_CM = 0.01;

/** Factor de conversión de cada unidad de peso a kilogramos. */
const WEIGHT_FACTOR_TO_KG: Record<WeightUnit, number> = {
    KG: 1,
    TN: KG_PER_TON,
    LB: KG_PER_POUND,
};

/** Factor de conversión de cada unidad de longitud a metros. */
const LENGTH_FACTOR_TO_METERS: Record<LengthUnit, number> = {
    M: 1,
    MM: METERS_PER_MM,
    CM: METERS_PER_CM,
    IN: METERS_PER_INCH,
    FT: METERS_PER_FOOT,
};

/** Sufijo visible por unidad de peso (derivado del código del catálogo). */
export const WEIGHT_UNIT_SUFFIX: Record<WeightUnit, string> = {
    KG: 'Kg',
    TN: 'Tn',
    LB: 'Lb',
};

/** Sufijo visible por unidad de longitud (derivado del código del catálogo). */
export const LENGTH_UNIT_SUFFIX: Record<LengthUnit, string> = {
    M: 'm',
    MM: 'mm',
    CM: 'cm',
    IN: 'in',
    FT: 'ft',
};

const normalizeUnitCode = (code?: string | null) => code?.trim().toLowerCase() ?? '';

/** Mapea el `extra` (código) del catálogo PESO a la unidad tipada. */
export const resolveWeightUnitFromCode = (code?: string | null): WeightUnit | undefined => {
    switch (normalizeUnitCode(code)) {
        case 'kg':
            return 'KG';
        case 'tn':
            return 'TN';
        case 'lb':
            return 'LB';
        default:
            return undefined;
    }
};

/** Mapea el `extra` (código) del catálogo MEDIDA a la unidad tipada. */
export const resolveLengthUnitFromCode = (code?: string | null): LengthUnit | undefined => {
    switch (normalizeUnitCode(code)) {
        case 'm':
            return 'M';
        case 'mm':
            return 'MM';
        case 'cm':
            return 'CM';
        case 'in':
            return 'IN';
        case 'ft':
            return 'FT';
        default:
            return undefined;
    }
};

/** Convierte un peso entre dos unidades, sin asumir una canónica de almacenamiento. */
export const convertWeightBetweenUnits = (value: number, from: WeightUnit, to: WeightUnit): number =>
    from === to ? value : (value * WEIGHT_FACTOR_TO_KG[from]) / WEIGHT_FACTOR_TO_KG[to];

/** Convierte una longitud entre dos unidades, sin asumir una canónica de almacenamiento. */
export const convertLengthBetweenUnits = (value: number, from: LengthUnit, to: LengthUnit): number =>
    from === to ? value : (value * LENGTH_FACTOR_TO_METERS[from]) / LENGTH_FACTOR_TO_METERS[to];

/** Convierte un valor canónico en kilogramos a la unidad solicitada. */
export const convertWeightFromKg = (valueKg: number, unit: WeightUnit): number =>
    convertWeightBetweenUnits(valueKg, 'KG', unit);

/** Convierte un valor en la unidad indicada a kilogramos (canónico). */
export const convertWeightToKg = (value: number, unit: WeightUnit): number =>
    convertWeightBetweenUnits(value, unit, 'KG');

/** Convierte un valor canónico en metros a la unidad solicitada. */
export const convertLengthFromMeters = (valueMeters: number, unit: LengthUnit): number =>
    convertLengthBetweenUnits(valueMeters, 'M', unit);

/** Convierte un valor en la unidad indicada a metros (canónico). */
export const convertLengthToMeters = (value: number, unit: LengthUnit): number =>
    convertLengthBetweenUnits(value, unit, 'M');

/** Redondea a 2 decimales para presentación en inputs. */
export const round2 = (value: number): number => Math.round(value * 100) / 100;

