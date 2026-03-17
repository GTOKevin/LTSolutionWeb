import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ViajeListReportDto } from '@/entities/viaje/model/types';

export class ViajeListExcelGenerator {
    private data: ViajeListReportDto[];
    private fechaInicio: string;
    private fechaFin: string;

    constructor(data: ViajeListReportDto[], fechaInicio: string, fechaFin: string) {
        this.data = data;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    async generateAndDownload() {
        const workbook = new ExcelJS.Workbook();
        const sheetName = `${this.fechaInicio} - ${this.fechaFin}`.substring(0, 31); // Excel limit
        const worksheet = workbook.addWorksheet(sheetName);

        // Columns configuration
        worksheet.columns = [
            { header: 'Cliente', key: 'cliente', width: 25 },
            { header: 'Conductor', key: 'conductor', width: 25 },
            { header: 'Tracto', key: 'tracto', width: 15 },
            { header: 'Carreta', key: 'carreta', width: 15 },
            { header: 'Origen', key: 'origen', width: 20 },
            { header: 'Destino', key: 'destino', width: 20 },
            { header: 'Mercadería', key: 'mercaderia', width: 30 },
            { header: 'Peso', key: 'peso', width: 15 },
            { header: 'Medidas', key: 'medidas', width: 20 },
            { header: 'Guías', key: 'guias', width: 20 },
            { header: 'Km Recorrido', key: 'kmRecorrido', width: 15 },
            { header: 'Galones Consumidos', key: 'galonesConsumidos', width: 20 },
            { header: 'Gastos Totales', key: 'totalGastos', width: 20 },
            { header: 'Días Transporte', key: 'diasTransporte', width: 15 },
            { header: 'Días Descarga', key: 'diasDescarga', width: 15 },
            { header: 'Días Viaje', key: 'diasViaje', width: 15 },
            { header: 'Fecha Partida', key: 'fechaPartida', width: 15 },
            { header: 'Fecha Llegada', key: 'fechaLlegada', width: 15 },
            { header: 'Fecha Descarga', key: 'fechaDescarga', width: 15 },
            { header: 'Fecha Llegada Base', key: 'fechaLlegadaBase', width: 18 },
        ];

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1976D2' } // Blue color similar to theme
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add data
        this.data.forEach(item => {
            worksheet.addRow({
                cliente: item.cliente,
                conductor: item.conductor,
                tracto: item.tracto,
                carreta: item.carreta,
                origen: item.origen,
                destino: item.destino,
                mercaderia: item.mercaderia,
                peso: item.peso,
                medidas: item.medidas,
                guias: item.guias,
                kmRecorrido: item.kmRecorrido,
                galonesConsumidos: item.galonesConsumidos,
                totalGastos: item.totalGastos,
                diasTransporte: item.diasTransporte,
                diasDescarga: item.diasDescarga,
                diasViaje: item.diasViaje,
                fechaPartida: item.fechaPartida,
                fechaLlegada: item.fechaLlegada,
                fechaDescarga: item.fechaDescarga,
                fechaLlegadaBase: item.fechaLlegadaBase,
            });
        });

        // Generate buffer and save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_Viajes_${this.fechaInicio}_${this.fechaFin}.xlsx`);
    }
}
