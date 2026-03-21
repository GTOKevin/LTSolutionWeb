import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ColaboradorPagosReportDto } from '@entities/colaborador-pago/model/types';
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
    tableColHeader: { width: '16.66%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#1976D2' },
    tableCol: { width: '16.66%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold', color: 'white' },
    tableCell: { margin: 5, fontSize: 9 },
    totalsContainer: { marginTop: 20, alignSelf: 'flex-end', width: 200 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: '#eee' },
    totalLabel: { fontWeight: 'bold' },
    totalValue: { fontWeight: 'bold' }
});

export const ColaboradorPagosPdf: React.FC<{ data: ColaboradorPagosReportDto }> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>REPORTE DE PAGOS DE COLABORADOR</Text>
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
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Tipo</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Observaciones</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Fecha Pago</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Rango Periodo</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Moneda</Text></View>
                    <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Monto</Text></View>
                </View>
                {data.pagos.map((pago, i) => (
                    <View style={styles.tableRow} key={i}>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.tipoPago}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.observaciones || '-'}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDateShort(pago.fechaPago)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDateShort(pago.fechaInicio)} - {formatDateShort(pago.fechaCierre)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.moneda}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.monto.toFixed(2)}</Text></View>
                    </View>
                ))}
            </View>

            <View style={styles.totalsContainer}>
                <Text style={[styles.title, { fontSize: 12, textAlign: 'left', marginBottom: 5 }]}>Totales por Moneda</Text>
                {Object.entries(data.totalesPorMoneda).map(([moneda, total]) => (
                    <View style={styles.totalRow} key={moneda}>
                        <Text style={styles.totalLabel}>{moneda}:</Text>
                        <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);