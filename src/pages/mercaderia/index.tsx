import { MercaderiaPageContent, useMercaderiaPageController } from '@features/mercaderia/list';

export function MercaderiaPage() {
    const controller = useMercaderiaPageController();
    return <MercaderiaPageContent controller={controller} />;
}
