import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ColaboradorPagosReportDto } from '@entities/colaborador-pago/model/types';
import { themePalette } from '@/shared/config/theme/palette';
import { formatDateShort } from '@/shared/utils/date-utils';

export class ColaboradorPagosExcelGenerator {
    private data: ColaboradorPagosReportDto;

    constructor(data: ColaboradorPagosReportDto) {
        this.data = data;
    }

    public async generateAndDownload() {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Logistica System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Reporte de Pagos', {
            views: [{ showGridLines: false }]
        });

        const PRIMARY_COLOR = themePalette.primary.main.replace('#', '');
        const BORDER_STYLE: Partial<ExcelJS.Borders> = {
            bottom: { style: 'thin', color: { argb: `FF${themePalette.common.border.replace('#', '')}` } }
        };

        // --- Title ---
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `REPORTE DE PAGOS DE COLABORADOR`;
        titleCell.font = { size: 16, bold: true, color: { argb: `FF${PRIMARY_COLOR}` } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;

        let rowIdx = 3;

        // --- Header Info ---
        const addHeaderRow = (label1: string, val1: string, label2: string, val2: string) => {
            const row = worksheet.getRow(rowIdx);
            row.getCell(1).value = label1;
            row.getCell(1).font = { bold: true };
            row.getCell(2).value = val1;
            
            row.getCell(4).value = label2;
            row.getCell(4).font = { bold: true };
            row.getCell(5).value = val2;
            rowIdx++;
        };

        addHeaderRow("Colaborador:", this.data.nombreCompleto, "Cargo:", this.data.cargo);
        addHeaderRow(`Doc (${this.data.tipoDocumento}):`, this.data.numeroDocumento, "", "");
        rowIdx++;

        // --- Details ---
        if (this.data.pagos.length > 0) {
            const headerRow = worksheet.getRow(rowIdx);
            const headers = ["Tipo de Pago", "Observaciones", "Fecha Pago", "Rango", "Moneda", "Monto"];
            headers.forEach((h, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = h;
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PRIMARY_COLOR}` } };
            });
            rowIdx++;

            this.data.pagos.forEach(item => {
                const row = worksheet.getRow(rowIdx);
                row.getCell(1).value = item.tipoPago;
                row.getCell(2).value = item.observaciones;
                row.getCell(3).value = formatDateShort(item.fechaPago);
                row.getCell(4).value = `${formatDateShort(item.fechaInicio)} - ${formatDateShort(item.fechaCierre)}`;
                row.getCell(5).value = item.moneda;
                row.getCell(6).value = item.monto;
                row.getCell(6).numFmt = '#,##0.00';
                row.eachCell((cell) => { cell.border = BORDER_STYLE; });
                rowIdx++;
            });
            rowIdx++;
        }

        // --- Footer Totals ---
        const totalsKeys = Object.keys(this.data.totalesPorMoneda);
        if (totalsKeys.length > 0) {
            const totalTitleCell = worksheet.getCell(`E${rowIdx}`);
            totalTitleCell.value = "TOTALES POR MONEDA";
            totalTitleCell.font = { bold: true };
            rowIdx++;

            totalsKeys.forEach(moneda => {
                const row = worksheet.getRow(rowIdx);
                row.getCell(5).value = `Total ${moneda}:`;
                row.getCell(5).font = { bold: true };
                row.getCell(6).value = this.data.totalesPorMoneda[moneda];
                row.getCell(6).numFmt = '#,##0.00';
                row.getCell(6).font = { bold: true };
                rowIdx++;
            });
        }

        worksheet.columns.forEach(column => {
            column.width = 20;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Pagos_${this.data.numeroDocumento}.xlsx`);
    }
}