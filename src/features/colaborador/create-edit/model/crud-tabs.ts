export function getColaboradorCrudTabs(canEditDetails: boolean) {
    return [
        { label: 'Datos Personales' },
        { label: 'Licencias', disabled: !canEditDetails },
        { label: 'Documentos', disabled: !canEditDetails },
        { label: 'Pagos', disabled: !canEditDetails },
    ];
}
