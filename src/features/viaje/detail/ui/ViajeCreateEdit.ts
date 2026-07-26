import { createElement } from 'react';
import type { SelectItem } from '@/shared/model/types';
import type { Viaje } from '@/entities/viaje/model/types';
import { ViajeCreateEdit as LegacyViajeCreateEdit } from '@features/viaje/ui/Viaje/ViajeCreateEdit';

interface Props {
    viaje?: Viaje | null;
    isViewOnly: boolean;
    options: {
        clientes?: SelectItem[];
        tractos?: SelectItem[];
        carretas?: SelectItem[];
        colaboradores?: SelectItem[];
        tiposMedida?: SelectItem[];
        tiposPeso?: SelectItem[];
        estados?: SelectItem[];
    };
    isPending: boolean;
}

export function ViajeCreateEdit(props: Props) {
    return createElement(LegacyViajeCreateEdit, props);
}
