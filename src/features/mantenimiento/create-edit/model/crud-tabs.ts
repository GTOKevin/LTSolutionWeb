export function getMantenimientoCrudTabs(canEditDetails: boolean) {
    return [
        { label: 'Datos de Ingreso' },
        { label: 'Detalles / Insumos', disabled: !canEditDetails },
    ];
}
