export type DashboardPeriod = 'day' | 'week' | 'month';

export interface DashboardMetricTotal {
    total: number;
}

export interface DashboardFacturacionMensualItem {
    month: string;
    monedaID: number;
    simbolo: string;
    totalFacturado: number;
    variacionVsMesAnteriorPct: number;
}

export interface DashboardAlertasCriticas {
    total: number;
    facturasVencidas: number;
    documentosVencidos: number;
}

export interface DashboardDisponibilidadFlota {
    total: number;
    disponibles: number;
    porcentajeDisponible: number;
}

export interface DashboardViajesVolumePoint {
    label: string;
    value: number;
}

export interface DashboardViajesVolume {
    period: DashboardPeriod;
    from: string;
    to: string;
    series: DashboardViajesVolumePoint[];
}

export interface DashboardEstadoFacturacionPorMoneda {
    monedaID: number;
    simbolo: string;
    pagadoMonto: number;
    pendienteMonto: number;
    vencidoMonto: number;
}

export interface DashboardEstadoFacturacion {
    totalFacturas: number;
    pagadas: number;
    pendientes: number;
    vencidas: number;
    pagadoPct: number;
    pendientePct: number;
    vencidoPct: number;
    totalesPorMoneda: DashboardEstadoFacturacionPorMoneda[];
}

export interface DashboardRecentTrip {
    viajeID: number;
    codigo: string;
    cliente: string;
    estadoID: number;
    estadoNombre: string;
    fechaCarga: string;
    origen: string;
    destino: string;
    ruta: string;
    tractoPlaca: string;
    carretaPlaca?: string | null;
}

export interface DashboardTripStatusIds {
    agendadoId?: number;
    transitoId?: number;
    descargandoId?: number;
    completadoId?: number;
}

export interface DashboardNotification {
    notificacionID: number;
    titulo: string;
    mensaje: string;
    tipoNotificacion: string;
    leido: boolean;
    urlAccion?: string;
    fechaRegistro: string;
}

export interface DashboardOverview {
    viajesEnCurso: DashboardMetricTotal;
    facturacionMensual: DashboardFacturacionMensualItem[];
    alertasCriticas: DashboardAlertasCriticas;
    disponibilidadFlota: DashboardDisponibilidadFlota;
    volumenViajes: DashboardViajesVolume;
    estadoFacturacion: DashboardEstadoFacturacion;
    viajesRecientes: DashboardRecentTrip[];
    notificacionesSeguridad: DashboardNotification[];
}

export interface DashboardOverviewParams {
    period?: DashboardPeriod;
    from?: string;
    to?: string;
    recentViajes?: number;
    securityAlerts?: number;
}

export interface DashboardFacturacionStatusParams {
    month?: string;
}

export interface DashboardViajesVolumeParams {
    period?: DashboardPeriod;
    from?: string;
    to?: string;
}
