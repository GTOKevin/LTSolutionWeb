import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ViajeGeneralReportDto } from '@entities/viaje/model/types';
import { themePalette } from '@/shared/config/theme/palette';

// Register a standard font (Helvetica is built-in, but good practice to be explicit if using others)
// For now, we stick to built-in fonts for simplicity and speed.

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: themePalette.text.light.primary
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: themePalette.primary.main,
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between'
    },
    tripInfoContainer: {
        width: '55%'
    },
    financialContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: themePalette.primary.main,
        borderRadius: 4,
        padding: 5,
        backgroundColor: themePalette.background.light.paper
    },
    financialTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: themePalette.primary.main,
        marginBottom: 5,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: themePalette.primary.main,
        paddingBottom: 2
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3
    },
    financialLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: themePalette.text.light.secondary
    },
    financialValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: themePalette.text.light.primary
    },
    guiasContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: themePalette.primary.main,
        padding: 5,
        borderRadius: 4
    },
    guiasTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: themePalette.primary.main,
        marginBottom: 5,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: themePalette.primary.main,
        paddingBottom: 2
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 3
    },
    label: {
        width: 80,
        fontWeight: 'bold',
        color: themePalette.text.light.secondary
    },
    value: {
        flex: 1
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: themePalette.primary.main,
        marginTop: 15,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: themePalette.primary.main,
        paddingBottom: 2
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: themePalette.common.border,
        marginBottom: 10
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: themePalette.common.border,
        alignItems: 'center',
        minHeight: 20
    },
    tableHeader: {
        backgroundColor: themePalette.common.tableHeader,
        fontWeight: 'bold',
        color: themePalette.primary.main
    },
    tableCell: {
        padding: 4,
        fontSize: 8
    },
    // Fuel Highlight
    fuelRow: {
        backgroundColor: themePalette.warning.light
    },
    noData: {
        fontSize: 8,
        fontStyle: 'italic',
        color: themePalette.text.light.secondary,
        padding: 5
    }
});

interface Props {
    data: ViajeGeneralReportDto;
}

export const ViajeGeneralPdf = ({ data }: Props) => {
    const isFuelExpense = (tipo: string) => {
        return tipo.toLowerCase().includes('combustible');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Title */}
                <Text style={styles.headerTitle}>Reporte General de Viaje #{data.viajeId}</Text>

                {/* Header Info & Guias */}
                <View style={styles.headerContainer}>
                    <View style={styles.tripInfoContainer}>
                        <View style={styles.infoRow}><Text style={styles.label}>Cliente:</Text><Text style={styles.value}>{data.cliente}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Conductor:</Text><Text style={styles.value}>{data.conductor}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Origen:</Text><Text style={styles.value}>{data.origen}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Destino:</Text><Text style={styles.value}>{data.destino}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Tracto:</Text><Text style={styles.value}>{data.tracto}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Carreta:</Text><Text style={styles.value}>{data.carreta}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Total Ejes:</Text><Text style={styles.value}>{data.ejesTotales}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Medidas:</Text><Text style={styles.value}>{data.medidasTotales}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Peso Total:</Text><Text style={styles.value}>{data.pesoTotal}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Partida:</Text><Text style={styles.value}>{data.fechaPartida}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Llegada:</Text><Text style={styles.value}>{data.fechaLlegada}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Descarga:</Text><Text style={styles.value}>{data.fechaDescarga}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>En Base:</Text><Text style={styles.value}>{data.fechaLlegadaBase}</Text></View>
                    </View>

                    <View style={{width:'40%'}}>
                        <View style={styles.financialContainer}>
                            <Text style={styles.financialTitle}>RESUMEN FINANCIERO</Text>
                            <View style={styles.financialRow}>
                                <Text style={styles.financialLabel}>Días de Viaje:</Text>
                                <Text style={styles.financialValue}>{data.diasViaje}</Text>
                            </View>
                            <View style={styles.financialRow}>
                                <Text style={styles.financialLabel}>Gastos Operativos:</Text>
                                <Text style={styles.financialValue}>S/ {data.totalGastos.toFixed(2)}</Text>
                            </View>
                            <View style={styles.financialRow}>
                                <Text style={styles.financialLabel}>Sueldo Conductor (S/100/día):</Text>
                                <Text style={styles.financialValue}>S/ {data.sueldoConductor.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.financialRow, { borderTopWidth: 1, borderTopColor: themePalette.common.border, paddingTop: 2, marginTop: 2 }]}>
                                <Text style={[styles.financialLabel, { color: themePalette.primary.main }]}>COSTO TOTAL OPERACIÓN:</Text>
                                <Text style={[styles.financialValue, { color: themePalette.primary.main }]}>S/ {data.costoTotalOperacion.toFixed(2)}</Text>
                            </View>
                            
                            <Text style={[styles.financialTitle, { marginTop: 10 }]}>CONSUMO COMBUSTIBLE</Text>
                            <View style={styles.financialRow}>
                                <Text style={styles.financialLabel}>Total Galones:</Text>
                                <Text style={styles.financialValue}>{data.totalGalonesCombustible.toFixed(2)}</Text>
                            </View>
                            <View style={styles.financialRow}>
                                <Text style={styles.financialLabel}>Costo Total Combustible:</Text>
                                <Text style={styles.financialValue}>S/ {data.totalCostoCombustible.toFixed(2)}</Text>
                            </View>
                            <View style={styles.financialRow}>
                                <Text style={styles.financialLabel}>Precio Promedio x Galón:</Text>
                                <Text style={styles.financialValue}>S/ {data.precioPromedioGalon.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={[styles.guiasContainer, { marginTop: 10 }]}>
                            <Text style={styles.guiasTitle}>GUÍAS</Text>
                            {data.guias.length > 0 ? (
                                data.guias.map((g, i) => (
                                    <View key={i} style={{ marginBottom: 4 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 8 }}>{g.tipoGuiaNombre}</Text>
                                        <Text style={{ fontSize: 8 }}>{g.serie}-{g.numero}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noData}>Sin guías</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Section 1: Escoltas */}
                <Text style={styles.sectionTitle}>1. Escoltas del Viaje</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Tipo</Text>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Placa / Empresa</Text>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Conductor</Text>
                    </View>
                    {data.escoltas.length > 0 ? (
                        data.escoltas.map((e, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{e.tipo}</Text>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{e.placa}</Text>
                                <Text style={[styles.tableCell, { width: '40%' }]}>{e.conductor}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noData}>Sin escoltas registradas</Text>
                    )}
                </View>

                {/* Section 2: Mercadería */}
                <Text style={styles.sectionTitle}>2. Detalle de Mercadería</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Nombre</Text>
                        <Text style={[styles.tableCell, { width: '40%' }]}>Descripción</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Medidas</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Peso</Text>
                    </View>
                    {data.mercaderias.length > 0 ? (
                        data.mercaderias.map((m, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{m.nombre}</Text>
                                <Text style={[styles.tableCell, { width: '40%' }]}>{m.descripcion}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{m.medidas}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{m.peso}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noData}>Sin mercadería registrada</Text>
                    )}
                </View>

                {/* Section 3: Gastos */}
                <Text style={styles.sectionTitle}>3. Gastos del Viaje</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Fecha</Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>Tipo</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>Descripción</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Comprobante</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>Gal.</Text>
                        <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>Monto</Text>
                    </View>
                    {data.gastos.length > 0 ? (
                        data.gastos.map((g, i) => (
                            <View key={i} style={[styles.tableRow, isFuelExpense(g.tipoGasto) ? styles.fuelRow : {}]}>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{g.fechaGasto}</Text>
                                <Text style={[styles.tableCell, { width: '20%' }]}>{g.tipoGasto}</Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>{g.descripcion}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{g.numeroComprobante}</Text>
                                <Text style={[styles.tableCell, { width: '10%' }]}>{g.galones ?? '-'}</Text>
                                <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                                    {g.moneda} {g.monto.toFixed(2)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noData}>Sin gastos registrados</Text>
                    )}
                </View>

                {/* Section 4: Incidentes */}
                <Text style={styles.sectionTitle}>4. Incidentes</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Fecha/Hora</Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>Tipo</Text>
                        <Text style={[styles.tableCell, { width: '35%' }]}>Descripción</Text>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Lugar</Text>
                    </View>
                    {data.incidentes.length > 0 ? (
                        data.incidentes.map((inc, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{inc.fechaHora}</Text>
                                <Text style={[styles.tableCell, { width: '20%' }]}>{inc.tipo}</Text>
                                <Text style={[styles.tableCell, { width: '35%' }]}>{inc.descripcion}</Text>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{inc.lugar}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noData}>Sin incidentes registrados</Text>
                    )}
                </View>
            </Page>
        </Document>
    );
};
