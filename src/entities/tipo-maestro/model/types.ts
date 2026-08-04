export interface TipoMaestro {
    tipoMaestroID: number;
    nombre: string;
    codigo?: string;
    seccion?: string;
    activo: boolean;
}

export interface TipoMaestroSeccionResumen {
    seccion: string;
    ultimosIds: number[];
    siguienteIdSugerido?: number | null;
}
