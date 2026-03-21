import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ColaboradorLicenciasReportDto } from '@entities/licencia/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
    header: { marginBottom: 20 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginBottom: 10, textAlign: 'center' },
    infoRow: { flexDirection: 'row', marginBottom: 5 },
    infoLabel: { fontWeight: 'bold', width: 80 },
    infoValue: { flex: 1 },
    table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#1976D2' },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold', color: 'white' },
    tableCell: { margin: 5, fontSize: 9 }
});

export const ColaboradorLicenciasPdf: React.FC<{ data: ColaboradorLicenciasReportDto }> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>REPORTE DE AUSENCIAS/LICENCIAS DE COLABORADOR</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Colaborador:</Text>
                    <Text style={styles.infoValue}>{data.nombreCompleto}</Text>
                    <Text style={styles.infoLabel}>Cargo:</Text>
                    <Text style={styles.infoValue}>{data.cargo}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Documento:</Text>
                    <Text style={styles.infoValue}>{data.tipoDocumento} - {data.numeroDocumento}</Text>
                </View>
            </View>

            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Tipo de Ausencia/Licencia</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Fecha Inicio</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Fecha Fin</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Comentario</Text></View>
                </View>
                {data.licencias.map((item, i) => (
                    <View style={styles.tableRow} key={i}>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{item.tipoLicencia}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDateShort(item.fechaInicio)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{item.fechaFin ? formatDateShort(item.fechaFin) : '-'}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{item.comentario}</Text></View>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);