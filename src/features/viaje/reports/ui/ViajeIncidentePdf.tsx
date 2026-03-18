import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ViajeIncidenteReportDto } from '@/entities/viaje/model/types';
import { themePalette } from '@/shared/config/theme/palette';
import { buildInternalFileUrl } from '@/shared/config/env';

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
        marginBottom: 15,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    headerContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between'
    },
    leftColumn: {
        width: '65%'
    },
    rightColumn: {
        width: '30%',
        borderWidth: 1,
        borderColor: themePalette.primary.main,
        borderRadius: 4,
        padding: 5
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4
    },
    label: {
        width: 100,
        fontWeight: 'bold',
        color: themePalette.text.light.secondary
    },
    value: {
        flex: 1
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
    guiaText: {
        fontSize: 9,
        marginBottom: 2,
        textAlign: 'center'
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: themePalette.primary.main,
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: themePalette.primary.main,
        paddingBottom: 4
    },
    incidenteContainer: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: themePalette.common.border,
        breakInside: 'avoid'
    },
    incidenteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: themePalette.common.tableHeader,
        padding: 5,
        marginBottom: 5,
        borderRadius: 2
    },
    incidenteType: {
        fontWeight: 'bold',
        color: themePalette.primary.main
    },
    incidenteDate: {
        fontWeight: 'bold'
    },
    incidenteRow: {
        flexDirection: 'row',
        marginBottom: 3
    },
    incidenteLabel: {
        width: 80,
        fontWeight: 'bold',
        color: themePalette.text.light.secondary
    },
    incidenteValue: {
        flex: 1
    },
    imageContainer: {
        marginTop: 10,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
    },
    image: {
        objectFit: 'contain',
        maxHeight: 200,
        maxWidth: '100%'
    }
});

interface Props {
    data: ViajeIncidenteReportDto;
}

export const ViajeIncidentePdf = ({ data }: Props) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.headerTitle}>Reporte de Incidentes - Viaje #{data.viajeId}</Text>

                <View style={styles.headerContainer}>
                    <View style={styles.leftColumn}>
                        <View style={styles.infoRow}><Text style={styles.label}>Cliente:</Text><Text style={styles.value}>{data.cliente}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Conductor:</Text><Text style={styles.value}>{data.conductor}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Tracto:</Text><Text style={styles.value}>{data.tracto}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Carreta:</Text><Text style={styles.value}>{data.carreta}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Origen:</Text><Text style={styles.value}>{data.origen}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Destino:</Text><Text style={styles.value}>{data.destino}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Fecha Partida:</Text><Text style={styles.value}>{data.fechaPartida}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Fecha Descarga:</Text><Text style={styles.value}>{data.fechaDescarga}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Fecha en Base:</Text><Text style={styles.value}>{data.fechaLlegadaBase}</Text></View>
                        
                        <View style={[styles.infoRow, { marginTop: 5 }]}>
                            <Text style={styles.label}>Mercaderías:</Text>
                            <View style={styles.value}>
                                {data.mercaderias.map((m, i) => (
                                    <Text key={i}>{m}</Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.rightColumn}>
                        <Text style={styles.guiasTitle}>GUÍAS</Text>
                        {data.guias.length > 0 ? (
                            data.guias.map((g, i) => (
                                <Text key={i} style={styles.guiaText}>{g}</Text>
                            ))
                        ) : (
                            <Text style={[styles.guiaText, { fontStyle: 'italic', color: '#999' }]}>Sin guías</Text>
                        )}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>DETALLE DE INCIDENTES</Text>

                {data.incidentes.length > 0 ? (
                    data.incidentes.map((incidente, index) => (
                        <View key={index} style={styles.incidenteContainer} wrap={false}>
                            <View style={styles.incidenteHeader}>
                                <Text style={styles.incidenteType}>{incidente.tipo}</Text>
                                <Text style={styles.incidenteDate}>{incidente.fechaHora}</Text>
                            </View>
                            
                            <View style={styles.incidenteRow}>
                                <Text style={styles.incidenteLabel}>Lugar:</Text>
                                <Text style={styles.incidenteValue}>{incidente.lugar}</Text>
                            </View>
                            
                            <View style={styles.incidenteRow}>
                                <Text style={styles.incidenteLabel}>Descripción:</Text>
                                <Text style={styles.incidenteValue}>{incidente.descripcion}</Text>
                            </View>

                            {(() => {
                                const imageUrl = buildInternalFileUrl(incidente.rutaFoto);
                                return imageUrl ? (
                                    <View style={styles.imageContainer}>
                                        <Image 
                                            src={imageUrl} 
                                            style={styles.image}
                                        />
                                    </View>
                                ) : null;
                            })()}
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: '#666' }}>
                        No hay incidentes registrados en este viaje.
                    </Text>
                )}
            </Page>
        </Document>
    );
};
