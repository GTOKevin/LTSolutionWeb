export function isImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(url);
}