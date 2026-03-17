import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { ViajeListReportDto } from '@/entities/viaje/model/types';

// Register a font if needed, but standard fonts are fine.
// Using Helvetica by default.

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        orientation: 'landscape',
    },
    header: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#112233',
        paddingBottom: 5,
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        textAlign: 'center',
        color: '#666',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '5.5%', // 18 columns approx
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f0f0f0',
    },
    tableCol: {
        width: '5.5%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCellHeader: {
        margin: 2,
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCell: {
        margin: 2,
        fontSize: 5,
        textAlign: 'center',
    },
    // Custom widths for specific columns
    colWide: { width: '10%' },
    colNarrow: { width: '4%' },
    colDefault: { width: '6.5%' },
});

interface ViajeListPdfProps {
    data: ViajeListReportDto[];
    fechaInicio: string;
    fechaFin: string;
}

export const ViajeListPdf: React.FC<ViajeListPdfProps> = ({ data, fechaInicio, fechaFin }) => {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte de Viajes</Text>
                    <Text style={styles.subtitle}>{`De ${fechaInicio} hasta ${fechaFin}`}</Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColHeader, styles.colWide]}><Text style={styles.tableCellHeader}>Cliente</Text></View>
                        <View style={[styles.tableColHeader, styles.colWide]}><Text style={styles.tableCellHeader}>Conductor</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Tracto</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Carreta</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Origen</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Destino</Text></View>
                        <View style={[styles.tableColHeader, styles.colWide]}><Text style={styles.tableCellHeader}>Mercadería</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Peso</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Medidas</Text></View>
                        <View style={[styles.tableColHeader, styles.colDefault]}><Text style={styles.tableCellHeader}>Guías</Text></View>
                        <View style={[styles.tableColHeader, styles.colNarrow]}><Text style={styles.tableCellHeader}>Km</Text></View>
                        <View style={[styles.tableColHeader, styles.colNarrow]}><Text style={styles.tableCellHeader}>Gals</Text></View>
                        <View style={[styles.tableColHeader, styles.colNarrow]}><Text style={styles.tableCellHeader}>Gastos</Text></View>
                        <View style={[styles.tableColHeader, styles.colNarrow]}><Text style={styles.tableCellHeader}>D.Trans</Text></View>
                        <View style={[styles.tableColHeader, styles.colNarrow]}><Text style={styles.tableCellHeader}>D.Desc</Text></View>
                        <View style={[styles.tableColHeader, styles.colNarrow]}><Text style={styles.tableCellHeader}>D.Viaje</Text></View>
                    </View>

                    {data.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={[styles.tableCol, styles.colWide]}><Text style={styles.tableCell}>{item.cliente}</Text></View>
                            <View style={[styles.tableCol, styles.colWide]}><Text style={styles.tableCell}>{item.conductor}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.tracto}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.carreta}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.origen}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.destino}</Text></View>
                            <View style={[styles.tableCol, styles.colWide]}><Text style={styles.tableCell}>{item.mercaderia}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.peso}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.medidas}</Text></View>
                            <View style={[styles.tableCol, styles.colDefault]}><Text style={styles.tableCell}>{item.guias}</Text></View>
                            <View style={[styles.tableCol, styles.colNarrow]}><Text style={styles.tableCell}>{item.kmRecorrido}</Text></View>
                            <View style={[styles.tableCol, styles.colNarrow]}><Text style={styles.tableCell}>{item.galonesConsumidos}</Text></View>
                            <View style={[styles.tableCol, styles.colNarrow]}><Text style={styles.tableCell}>{item.totalGastos}</Text></View>
                            <View style={[styles.tableCol, styles.colNarrow]}><Text style={styles.tableCell}>{item.diasTransporte}</Text></View>
                            <View style={[styles.tableCol, styles.colNarrow]}><Text style={styles.tableCell}>{item.diasDescarga}</Text></View>
                            <View style={[styles.tableCol, styles.colNarrow]}><Text style={styles.tableCell}>{item.diasViaje}</Text></View>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};
