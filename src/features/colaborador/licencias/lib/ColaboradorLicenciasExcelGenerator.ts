import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ColaboradorLicenciasReportDto } from '@entities/licencia/model/types';
import { themePalette } from '@/shared/config/theme/palette';
import { formatDateShort } from '@/shared/utils/date-utils';

export class ColaboradorLicenciasExcelGenerator {
    private data: ColaboradorLicenciasReportDto;

    constructor(data: ColaboradorLicenciasReportDto) {
        this.data = data;
    }

    public async generateAndDownload() {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Logistica System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Reporte de Ausencias', {
            views: [{ showGridLines: false }]
        });

        const PRIMARY_COLOR = themePalette.primary.main.replace('#', '');
        const BORDER_STYLE: Partial<ExcelJS.Borders> = {
            bottom: { style: 'thin', color: { argb: `FF${themePalette.common.border.replace('#', '')}` } }
        };

        // --- Title ---
        worksheet.mergeCells('A1:D1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `REPORTE DE AUSENCIAS/LICENCIAS DE COLABORADOR`;
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
            
            row.getCell(3).value = label2;
            row.getCell(3).font = { bold: true };
            row.getCell(4).value = val2;
            rowIdx++;
        };

        addHeaderRow("Colaborador:", this.data.nombreCompleto, "Cargo:", this.data.cargo);
        addHeaderRow(`Doc (${this.data.tipoDocumento}):`, this.data.numeroDocumento, "", "");
        rowIdx++;

        // --- Details ---
        if (this.data.licencias.length > 0) {
            const headerRow = worksheet.getRow(rowIdx);
            const headers = ["Tipo de Ausencia/Licencia", "Fecha Inicio", "Fecha Fin", "Comentario"];
            headers.forEach((h, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = h;
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PRIMARY_COLOR}` } };
            });
            rowIdx++;

            this.data.licencias.forEach(item => {
                const row = worksheet.getRow(rowIdx);
                row.getCell(1).value = item.tipoLicencia;
                row.getCell(2).value = formatDateShort(item.fechaInicio);
                row.getCell(3).value = item.fechaFin ? formatDateShort(item.fechaFin) : '-';
                row.getCell(4).value = item.comentario;
                row.eachCell((cell) => { cell.border = BORDER_STYLE; });
                rowIdx++;
            });
        }

        worksheet.columns.forEach(column => {
            column.width = 25;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Ausencias_${this.data.numeroDocumento}.xlsx`);
    }
}