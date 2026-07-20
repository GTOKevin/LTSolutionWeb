export function getClienteCrudTabs(canEditContacts: boolean) {
    return [
        { label: 'Datos Generales' },
        { label: 'Contactos', disabled: !canEditContacts },
    ];
}
