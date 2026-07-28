import { useFacturaCreateEditController } from '../hooks/useFacturaCreateEditController';
import { FacturaCreateEditContent } from './FacturaCreateEditContent';

interface FacturaCreateEditProps {
    id?: number;
    viewOnly?: boolean;
}

export function FacturaCreateEdit({ id, viewOnly = false }: FacturaCreateEditProps) {
    const controller = useFacturaCreateEditController({ id, viewOnly });

    return <FacturaCreateEditContent controller={controller} />;
}
