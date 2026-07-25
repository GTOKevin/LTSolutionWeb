import { MercaderiaPageContent, useMercaderiaPageController } from '@features/mercaderia';

export function MercaderiaPage() {
    const controller = useMercaderiaPageController();
    return <MercaderiaPageContent controller={controller} />;
}
