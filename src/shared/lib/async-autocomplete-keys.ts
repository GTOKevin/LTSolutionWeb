
export const ASYNC_AUTOCOMPLETE_QUERY_KEYS = {
    resource: (resourceKey: string, search: string) =>
        ['async-autocomplete', resourceKey, search] as const,
} as const;