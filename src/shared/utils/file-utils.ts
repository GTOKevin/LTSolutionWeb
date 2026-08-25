export function buildRutasArchivo(values: string[]): string[] {
    return values
        .map((value) => value.trim())
        .filter((value) => Boolean(value));
}

export function downloadBlob(blob: Blob, filename: string) {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}

/**
 * Descarga real de un archivo servido por URL (mismo origen o CORS habilitado).
 * Hace fetch -> blob y usa `downloadBlob` para forzar la descarga. Si el fetch
 * falla (red/origen bloqueado), degrada a abrir la URL en pestaña nueva para
 * que el usuario conserve acceso al recurso.
 */
export async function downloadFileFromUrl(url: string, fileName?: string): Promise<void> {
    try {
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const resolvedFileName =
            fileName
            || url.split('?')[0].split('/').pop()
            || 'archivo';

        downloadBlob(blob, resolvedFileName);
    } catch {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

export function isImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(url);
}

export function isPdfUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return /\.pdf(\?.*)?$/i.test(url);
}

export async function isPreviewableImageUrl(url: string | null | undefined): Promise<boolean> {
    if (!url) {
        return false;
    }

    const cacheBustedUrl = new URL(url, window.location.origin);
    cacheBustedUrl.searchParams.set('t', Date.now().toString());

    try {
        const headResponse = await fetch(cacheBustedUrl.toString(), {
            method: 'HEAD',
            cache: 'no-store',
        });

        if (headResponse.ok) {
            const contentType = headResponse.headers.get('content-type');
            if (contentType) {
                return contentType.startsWith('image/');
            }
        }
    } catch {
        // Fallback below when the origin does not allow HEAD/CORS metadata.
    }

    return isImageUrl(url);
}
