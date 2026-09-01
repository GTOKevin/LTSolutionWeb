export interface DeleteLog {
    deleteLogID: number;
    entidad: string;
    entidadId: number;
    fechaEliminacion: string;
    usuarioEliminacionId: number;
    datos: string;
}

export interface DeleteLogParams {
    search?: string;
    page?: number;
    size?: number;
}

export interface PurgeDeleteLogResult {
    eliminados: number;
}
