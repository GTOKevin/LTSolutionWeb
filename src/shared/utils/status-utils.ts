export function getEstadoColor(aprobada: boolean | null): 'success' | 'warning' | 'error' {
    if (aprobada === true) return 'success';
    if (aprobada === false) return 'error';
    return 'warning';
}