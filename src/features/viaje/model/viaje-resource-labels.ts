/**
 * Etiquetas neutras de pertenencia de recursos del viaje.
 *
 * H1: la UI de solo-lectura no debe presentar razon social, flota ni
 * vigencia SCTR como datos verificados si el backend no los entrega.
 * Estos fallbacks son descriptivos y no afirman vinculo laboral ni
 * cobertura documental alguna.
 */
export const VIAJE_RECURSO_LABELS = {
    tractoPropio: 'Propio',
    carretaPropia: 'Propia',
    flotaPropia: 'Flota propia',
    personalPropio: 'Personal propio',
    proveedorExterno: 'Proveedor externo',
    conductorTerceroSinRegistrar: 'Conductor tercero sin registrar',
    sinConductor: 'Sin conductor asignado',
    sinEmpresaRegistrada: 'Sin empresa registrada',
    contratistaTransporte: 'Contratista de transporte',
    sinPlaca: 'Sin placa',
    sinCarreta: 'Sin Carreta',
    sinCliente: 'Sin cliente asociado',
    origenNoRegistrado: 'Origen no registrado',
    destinoNoRegistrado: 'Destino no registrado',
} as const;
