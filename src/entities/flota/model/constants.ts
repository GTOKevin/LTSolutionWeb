export const TIPO_FLOTA_CODES = {
    CAMIONES: 'N3',
    CARRETAS: 'O4',
    LIVIANOS: 'N1',
    TODOS: '',
} as const;

export const TIPOS_COMBUSTIBLE = [
    { value: 'DIESEL', label: 'DIESEL' },
    { value: 'GASOLINA', label: 'GASOLINA' },
    { value: 'GASOLINA/GNV', label: 'GASOLINA/GNV' },
    { value: 'GASOLINA/GLP', label: 'GASOLINA/GLP' },
] as const;
