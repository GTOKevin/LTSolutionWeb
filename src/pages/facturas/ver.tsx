import { useParams } from 'react-router-dom';
import { FacturaDetailPageContent } from '@features/factura';

export function FacturaVerPage() {
    const { id } = useParams<{ id: string }>();

    return <FacturaDetailPageContent id={id ? Number(id) : undefined} />;
}

