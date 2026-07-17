import { useTipoProductoPageController } from '@features/tipo-producto/list/hooks/useTipoProductoPageController';
import { TipoProductoPageContent } from '@features/tipo-producto/list/ui/TipoProductoPageContent';

export function TipoProductoPage() {
    const controller = useTipoProductoPageController();
    return <TipoProductoPageContent controller={controller} />;
}
