import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ViajeGeneralReportDto } from '@entities/viaje/model/types';
import { themePalette } from '@/shared/config/theme/palette';

export class ViajeGeneralExcelGenerator {
    private data: ViajeGeneralReportDto;

    constructor(data: ViajeGeneralReportDto) {
        this.data = data;
    }

    public async generateAndDownload() {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Logistica System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Reporte General', {
            views: [{ showGridLines: false }]
        });

        // --- Styles & Constants from Theme Palette ---
        // ExcelJS uses hex without #
        const PRIMARY_COLOR = themePalette.primary.main.replace('#', '');
        const HEADER_FILL_COLOR = themePalette.common.tableHeader.replace('#', '');
        const WARNING_LIGHT_COLOR = themePalette.warning.light.replace('#', '');
        const TEXT_PRIMARY_COLOR = themePalette.text.light.primary.replace('#', '');

        const SECTION_TITLE_FILL: ExcelJS.Fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `FF${PRIMARY_COLOR}` } 
        };
        const SECTION_TITLE_FONT: Partial<ExcelJS.Font> = {
            bold: true,
            size: 12,
            color: { argb: 'FFFFFFFF' } // White text for contrast on primary color
        };

        const TABLE_HEADER_FILL: ExcelJS.Fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `FF${HEADER_FILL_COLOR}` }
        };

        const FUEL_HIGHLIGHT: ExcelJS.Fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `FF${WARNING_LIGHT_COLOR}` }
        };

        const BORDER_STYLE: Partial<ExcelJS.Borders> = {
            bottom: { style: 'thin', color: { argb: `FF${themePalette.common.border.replace('#', '')}` } }
        };

        // --- Title ---
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `REPORTE GENERAL DE VIAJE #${this.data.viajeId}`;
        titleCell.font = { size: 16, bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;

        let rowIdx = 3;

        // --- Header Info Helper ---
        const addHeaderRow = (label1: string, val1: string, label2: string, val2: string) => {
            const row = worksheet.getRow(rowIdx);
            
            row.getCell(1).value = label1;
            row.getCell(1).font = { bold: true, color: { argb: `FF${TEXT_PRIMARY_COLOR}` } };
            row.getCell(2).value = val1;
            
            row.getCell(3).value = label2;
            row.getCell(3).font = { bold: true, color: { argb: `FF${TEXT_PRIMARY_COLOR}` } };
            row.getCell(4).value = val2;
            
            rowIdx++;
        };

        addHeaderRow("Cliente:", this.data.cliente, "Viaje #:", this.data.viajeId.toString());
        addHeaderRow("Conductor:", this.data.conductor, "", "");
        addHeaderRow("Tracto:", this.data.tracto, "Carreta:", this.data.carreta);
        addHeaderRow("Origen:", this.data.origen, "Destino:", this.data.destino);
        addHeaderRow("Total Ejes:", this.data.ejesTotales.toString(), "Peso Total:", this.data.pesoTotal);
        addHeaderRow("F. Partida:", this.data.fechaPartida, "F. Llegada:", this.data.fechaLlegada);
        addHeaderRow("F. Descarga:", this.data.fechaDescarga, "F. Base:", this.data.fechaLlegadaBase);
        addHeaderRow("Medidas:", this.data.medidasTotales, "", "");
        
        rowIdx++;

        // --- Financial Summary & Fuel ---
        worksheet.mergeCells(`A${rowIdx}:D${rowIdx}`);
        const financeTitleCell = worksheet.getCell(`A${rowIdx}`);
        financeTitleCell.value = "RESUMEN FINANCIERO Y COMBUSTIBLE";
        financeTitleCell.font = { bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
        financeTitleCell.border = { bottom: { style: 'thin', color: { argb: `FF${PRIMARY_COLOR}` } } };
        rowIdx++;

        addHeaderRow("Días de Viaje:", this.data.diasViaje.toString(), "Total Galones:", this.data.totalGalonesCombustible.toFixed(2));
        addHeaderRow("Gastos Operativos:", `S/ ${this.data.totalGastos.toFixed(2)}`, "Costo Total Combustible:", `S/ ${this.data.totalCostoCombustible.toFixed(2)}`);
        addHeaderRow("Sueldo Conductor (S/100/día):", `S/ ${this.data.sueldoConductor.toFixed(2)}`, "Precio Promedio x Galón:", `S/ ${this.data.precioPromedioGalon.toFixed(2)}`);
        
        const totalOpRow = worksheet.getRow(rowIdx);
        totalOpRow.getCell(1).value = "COSTO TOTAL OPERACIÓN:";
        totalOpRow.getCell(1).font = { bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
        totalOpRow.getCell(2).value = `S/ ${this.data.costoTotalOperacion.toFixed(2)}`;
        totalOpRow.getCell(2).font = { bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
        rowIdx += 2;

        // --- Guides Box ---
        if (this.data.guias.length > 0) {
            const guideTitleRow = worksheet.getRow(rowIdx);
            guideTitleRow.getCell(1).value = "GUÍAS DEL VIAJE";
            guideTitleRow.getCell(1).font = { bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
            rowIdx++;

            this.data.guias.forEach(g => {
                const r = worksheet.getRow(rowIdx);
                r.getCell(1).value = g.tipoGuiaNombre;
                r.getCell(1).font = { bold: true, size: 9 };
                r.getCell(2).value = `${g.serie}-${g.numero}`;
                r.getCell(2).font = { size: 9 };
                rowIdx++;
            });
            rowIdx++;
        }

        // --- Helper for Sections ---
        const addSectionHeader = (title: string, headers: string[]) => {
            // Title Bar
            worksheet.mergeCells(`A${rowIdx}:H${rowIdx}`);
            const titleCell = worksheet.getCell(`A${rowIdx}`);
            titleCell.value = title;
            titleCell.font = SECTION_TITLE_FONT;
            titleCell.fill = SECTION_TITLE_FILL;
            titleCell.alignment = { horizontal: 'left', indent: 1 };
            rowIdx++;

            // Column Headers
            const headerRow = worksheet.getRow(rowIdx);
            headers.forEach((h, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = h;
                cell.font = { bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
                cell.fill = TABLE_HEADER_FILL;
                cell.border = BORDER_STYLE;
            });
            rowIdx++;
        };

        // --- Section 1: Escoltas ---
        if (this.data.escoltas.length > 0) {
            addSectionHeader("1. ESCOLTAS", ["Tipo", "Placa / Empresa", "Conductor"]);
            this.data.escoltas.forEach(item => {
                const row = worksheet.getRow(rowIdx);
                row.getCell(1).value = item.tipo;
                row.getCell(2).value = item.placa;
                row.getCell(3).value = item.conductor;
                row.eachCell((cell) => { cell.border = BORDER_STYLE; });
                rowIdx++;
            });
            rowIdx++;
        }

        // --- Section 2: Mercadería ---
        if (this.data.mercaderias.length > 0) {
            addSectionHeader("2. MERCADERÍA", ["Nombre", "Descripción", "Medidas", "Peso"]);
            this.data.mercaderias.forEach(item => {
                const row = worksheet.getRow(rowIdx);
                row.getCell(1).value = item.nombre;
                row.getCell(2).value = item.descripcion;
                row.getCell(3).value = item.medidas;
                row.getCell(4).value = item.peso;
                row.eachCell((cell) => { cell.border = BORDER_STYLE; });
                rowIdx++;
            });
            rowIdx++;
        }

        // --- Section 3: Gastos ---
        if (this.data.gastos.length > 0) {
            addSectionHeader("3. GASTOS", ["Fecha", "Tipo", "Descripción", "Doc.", "Galones", "Moneda", "Monto"]);
            this.data.gastos.forEach(item => {
                const row = worksheet.getRow(rowIdx);
                const isFuel = item.tipoGasto.toLowerCase().includes('combustible');
                
                row.getCell(1).value = item.fechaGasto;
                row.getCell(2).value = item.tipoGasto;
                row.getCell(3).value = item.descripcion;
                row.getCell(4).value = item.numeroComprobante;
                row.getCell(5).value = item.galones || '';
                row.getCell(6).value = item.moneda;
                row.getCell(7).value = item.monto;
                row.getCell(7).numFmt = '#,##0.00';

                // Apply borders first
                row.eachCell((cell) => { cell.border = BORDER_STYLE; });

                if (isFuel) {
                    for(let i=1; i<=7; i++) {
                        row.getCell(i).fill = FUEL_HIGHLIGHT;
                    }
                }
                rowIdx++;
            });
            rowIdx++;
        }

        // --- Section 4: Incidentes ---
        if (this.data.incidentes.length > 0) {
            addSectionHeader("4. INCIDENTES", ["Fecha/Hora", "Tipo", "Lugar", "Descripción"]);
            this.data.incidentes.forEach(item => {
                const row = worksheet.getRow(rowIdx);
                row.getCell(1).value = item.fechaHora;
                row.getCell(2).value = item.tipo;
                row.getCell(3).value = item.lugar;
                row.getCell(4).value = item.descripcion;
                row.eachCell((cell) => { cell.border = BORDER_STYLE; });
                rowIdx++;
            });
            rowIdx++;
        }

        // Auto-width columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell && column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) maxLength = columnLength;
            });
            column.width = maxLength < 10 ? 10 : (maxLength > 50 ? 50 : maxLength + 2);
        });

        // Write Buffer & Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Viaje_${this.data.viajeId}_General.xlsx`);
    }
}
