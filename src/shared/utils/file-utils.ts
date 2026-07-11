export function isImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(url);
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
