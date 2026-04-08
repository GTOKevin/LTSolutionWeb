export const getInitials = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatCurrency = (amount: number, currencyCodeOrSymbol = 'USD'): string => {
    // Si viene el símbolo en lugar del código ISO, lo mapeamos al código ISO correspondiente
    let isoCode = currencyCodeOrSymbol;
    if (currencyCodeOrSymbol === '$') isoCode = 'USD';
    else if (currencyCodeOrSymbol === '€') isoCode = 'EUR';
    else if (currencyCodeOrSymbol === 'S/') isoCode = 'PEN';

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
    } catch (e) {
        // Fallback en caso de que se pase un string que no sea un código ISO válido
        return `${currencyCodeOrSymbol} ${amount.toFixed(2)}`;
    }
};

