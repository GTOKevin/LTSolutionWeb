import type { SelectItem } from '@/shared/model/types';

export const GASTO_CODES = {
    COMBUSTIBLE: 'COMBUSTIBLE',
    PEAJE: 'PEAJE',
} as const;

export interface GastoSelectMetadata {
    code?: string;
    defaultCurrencyCode?: string;
    isFuel: boolean;
}

export function resolveGastoSelectMetadata(item?: SelectItem | null): GastoSelectMetadata {
    const code = item?.extra?.trim() || undefined;
    const defaultCurrencyCode = item?.extraTwo?.trim() || undefined;

    return {
        code,
        defaultCurrencyCode,
        isFuel: code === GASTO_CODES.COMBUSTIBLE,
    };
}
