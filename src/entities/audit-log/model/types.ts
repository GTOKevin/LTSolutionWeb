export interface AuditLog {
    auditLogID: number;
    tableName: string;
    fecha: string;
    keyValues: string;
    oldValues: string | null;
    newValues: string | null;
    action: string;
    username: string | null;
}

export interface AuditLogParams {
    search?: string;
    page?: number;
    size?: number;
}

export interface PurgeAuditLogResult {
    eliminados: number;
}
