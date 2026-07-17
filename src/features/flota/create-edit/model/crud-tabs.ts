export function getFlotaCrudTabs(canEditDocs: boolean) {
    return [
        { label: 'Datos Técnicos' },
        { label: 'Documentos', disabled: !canEditDocs },
    ];
}
