import { useMercaderiaPageController } from '@features/mercaderia/list/hooks/useMercaderiaPageController';
import { MercaderiaPageContent } from '@features/mercaderia/list/ui/MercaderiaPageContent';

export function MercaderiaPage() {
    const controller = useMercaderiaPageController();
    return <MercaderiaPageContent controller={controller} />;
}
