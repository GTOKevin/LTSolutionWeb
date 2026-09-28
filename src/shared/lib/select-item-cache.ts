import type { SelectItem } from '@/shared/model/types';


const cache = new Map<string, SelectItem>();

const buildKey = (resourceKey: string, id: number): string => `${resourceKey}:${id}`;

export function cacheSelectItem(resourceKey: string, item: SelectItem | null | undefined): void {
    if (!item || !item.id) return;
    cache.set(buildKey(resourceKey, item.id), item);
}

export function getCachedSelectItem(resourceKey: string, id?: number | null): SelectItem | null {
    if (!id) return null;
    return cache.get(buildKey(resourceKey, id)) ?? null;
}


export function resolveSelectLabel(
    resourceKey: string,
    id: number | null | undefined,
    items?: SelectItem[],
    fallback = 'No especificado',
): string {
    if (!id) return fallback;
    const fromList = items?.find((item) => item.id === id);
    if (fromList) return fromList.text;
    return getCachedSelectItem(resourceKey, id)?.text ?? fallback;
}
