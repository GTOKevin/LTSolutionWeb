import { TipoProductoPageContent, useTipoProductoPageController } from '@features/tipo-producto';

export function TipoProductoPage() {
    const controller = useTipoProductoPageController();
    return <TipoProductoPageContent controller={controller} />;
}
