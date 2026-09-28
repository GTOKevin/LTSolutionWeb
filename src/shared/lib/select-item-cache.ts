import type { SelectItem } from '@/shared/model/types';

const MAX_CACHE_ENTRIES = 500;

const cache = new Map<string, SelectItem>();

const buildKey = (resourceKey: string, id: number): string => `${resourceKey}:${id}`;

const touch = (key: string, item: SelectItem): void => {
    cache.delete(key);
    cache.set(key, item);
    if (cache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) cache.delete(oldestKey);
    }
};

export function cacheSelectItem(resourceKey: string, item: SelectItem | null | undefined): void {
    if (!item || !item.id) return;
    touch(buildKey(resourceKey, item.id), item);
}

export function getCachedSelectItem(resourceKey: string, id?: number | null): SelectItem | null {
    if (!id) return null;
    const key = buildKey(resourceKey, id);
    const item = cache.get(key);
    if (!item) return null;
    touch(key, item);
    return item;
}

export function clearSelectItemCache(resourceKey?: string): void {
    if (!resourceKey) {
        cache.clear();
        return;
    }
    const prefix = `${resourceKey}:`;
    for (const key of [...cache.keys()]) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
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