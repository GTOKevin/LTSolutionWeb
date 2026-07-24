import { TipoProductoPageContent, useTipoProductoPageController } from '@features/tipo-producto/list';

export function TipoProductoPage() {
    const controller = useTipoProductoPageController();
    return <TipoProductoPageContent controller={controller} />;
}
