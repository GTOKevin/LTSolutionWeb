import { useCallback } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import { formatDateLong } from '@shared/utils/date-utils';

export const useMantenimientoReport = () => {
    
    const fetchReportData = async (mantenimientoId: number) => {
        try {
            const data = await mantenimientoApi.getReport(mantenimientoId);
            return data;
        } catch (error) {
            console.error("Error fetching report data", error);
            throw error;
        }
    };

    const generateFileName = (mantenimiento: any, ext: string) => {
        const tipo = mantenimiento?.tipoServicio?.nombre || 'General';
        const placa = mantenimiento?.flota?.placa || 'SinPlaca';
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        
        // Sanitize
        const safeTipo = tipo.replace(/[^a-zA-Z0-9]/g, '_');
        const safePlaca = placa.replace(/[^a-zA-Z0-9]/g, '_');
        
        return `${safeTipo}_${safePlaca}_${fecha}.${ext}`;
    };

    const generateExcel = useCallback(async (mantenimientoId: number) => {
        try {
            const reportData = await fetchReportData(mantenimientoId);
            if (!reportData || !reportData.detalles) return;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte Mantenimiento');

            // --- Header Styles ---
            const headerStyle = {
                font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } }, // Excel Green
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            } as any;

            const dataStyle = {
                border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
                alignment: { vertical: 'middle' }
            } as any;

            // --- Title ---
            worksheet.mergeCells('A1:J1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'REPORTE DE MANTENIMIENTO';
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF2E7D32' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(1).height = 30;

            // --- Parent Info ---
            const parentInfo = reportData.mantenimiento ? {
                flota: `${reportData.mantenimiento.flota?.marca} ${reportData.mantenimiento.flota?.modelo} (${reportData.mantenimiento.flota?.placa})`,
                servicio: reportData.mantenimiento.tipoServicio?.nombre,
                fechaIngreso: formatDateLong(reportData.mantenimiento.fechaIngreso),
                fechaSalida: reportData.mantenimiento.fechaSalida ? formatDateLong(reportData.mantenimiento.fechaSalida) : '-',
                kmIngreso: reportData.mantenimiento.kmIngreso?.toString() || '-',
                kmSalida: reportData.mantenimiento.kmSalida?.toString() || '-',
                motivo: reportData.mantenimiento.motivoIngreso || '-',
                diagnostico: reportData.mantenimiento.diagnosticoMecanico || '-',
                solucion: reportData.mantenimiento.solucion || '-'
            } : { flota: '-', servicio: '-', fechaIngreso: '-', fechaSalida: '-', kmIngreso: '-', kmSalida: '-', motivo: '-', diagnostico: '-', solucion: '-' };

            const addInfoRow = (row: number, label: string, value: string) => {
                const labelCell = worksheet.getCell(`A${row}`);
                labelCell.value = label;
                labelCell.font = { bold: true };
                worksheet.getCell(`B${row}`).value = value;
                worksheet.mergeCells(`B${row}:D${row}`);
            };

            addInfoRow(3, 'Vehículo:', parentInfo.flota);
            addInfoRow(4, 'Servicio:', parentInfo.servicio ?? "");
            addInfoRow(5, 'Fecha Ingreso:', parentInfo.fechaIngreso);
            addInfoRow(6, 'Fecha Salida:', parentInfo.fechaSalida);
            addInfoRow(7, 'Km Ingreso:', parentInfo.kmIngreso);
            addInfoRow(8, 'Km Salida:', parentInfo.kmSalida);
            addInfoRow(9, 'Motivo Ingreso:', parentInfo.motivo);
            addInfoRow(10, 'Diagnóstico:', parentInfo.diagnostico);
            addInfoRow(11, 'Solución:', parentInfo.solucion);

            // --- Table Header ---
            const headerRowIndex = 13;
            const headers = [
                'ID', 'Producto/Servicio', 'Descripción', 'Cantidad', 'Moneda', 
                'Costo Unit.', 'SubTotal', 'IGV', 'Total'
            ];
            const headerRow = worksheet.getRow(headerRowIndex);
            headerRow.values = headers;
            headerRow.height = 20;

            headerRow.eachCell((cell) => {
                cell.style = headerStyle;
            });

            // --- Data ---
            let currentRowIndex = headerRowIndex + 1;
            reportData.detalles.forEach(item => {
                const row = worksheet.getRow(currentRowIndex);
                row.values = [
                    item.mantenimientoDetalleID,
                    (item as any).tipoProducto?.nombre || '',
                    item.descripcion || '',
                    item.cantidad,
                    item.moneda?.codigo,
                    item.costo,
                    item.subTotal,
                    item.montoIGV,
                    item.total
                ];
                
                row.eachCell((cell) => {
                    cell.style = dataStyle;
                });
                
                // Number formats
                row.getCell(6).numFmt = '#,##0.00';
                row.getCell(7).numFmt = '#,##0.00';
                row.getCell(8).numFmt = '#,##0.00';
                row.getCell(9).numFmt = '#,##0.00';
                
                currentRowIndex++;
            });

            // --- Column Widths ---
            worksheet.columns = [
                { width: 10 }, { width: 30 }, { width: 40 }, { width: 10 }, { width: 10 },
                { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
            ];

            // --- Totals ---
            currentRowIndex += 1;
            Object.entries(reportData.totalsByCurrency || {}).forEach(([symbol, total]) => {
                const totalLabelCell = worksheet.getCell(`G${currentRowIndex}`);
                totalLabelCell.value = `TOTAL ${symbol}`;
                totalLabelCell.font = { bold: true };
                totalLabelCell.alignment = { horizontal: 'right' };
                totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

                const totalValueCell = worksheet.getCell(`I${currentRowIndex}`);
                totalValueCell.value = total;
                totalValueCell.font = { bold: true, color: { argb: 'FF2E7D32' } };
                totalValueCell.numFmt = '#,##0.00';
                totalValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
                
                currentRowIndex++;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, generateFileName(reportData.mantenimiento, 'xlsx'));

        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    }, []);

    const generatePdf = useCallback(async (mantenimientoId: number) => {
        try {
            const reportData = await fetchReportData(mantenimientoId);
            if (!reportData || !reportData.detalles) return;

            const doc = new jsPDF();
            
            // --- Title ---
            doc.setFontSize(18);
            doc.setTextColor(46, 125, 50); // Green
            doc.text('REPORTE DE MANTENIMIENTO', 105, 15, { align: 'center' });

            // --- Parent Info ---
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const parentInfo = reportData.mantenimiento ? {
                flota: `${reportData.mantenimiento.flota?.marca} ${reportData.mantenimiento.flota?.modelo} (${reportData.mantenimiento.flota?.placa})`,
                servicio: reportData.mantenimiento.tipoServicio?.nombre,
                fechaIngreso: formatDateLong(reportData.mantenimiento.fechaIngreso),
                fechaSalida: reportData.mantenimiento.fechaSalida ? formatDateLong(reportData.mantenimiento.fechaSalida) : '-',
                kmIngreso: reportData.mantenimiento.kmIngreso?.toString() || '-',
                kmSalida: reportData.mantenimiento.kmSalida?.toString() || '-',
                motivo: reportData.mantenimiento.motivoIngreso || '-',
                diagnostico: reportData.mantenimiento.diagnosticoMecanico || '-',
                solucion: reportData.mantenimiento.solucion || '-'
            } : { flota: '-', servicio: '-', fechaIngreso: '-', fechaSalida: '-', kmIngreso: '-', kmSalida: '-', motivo: '-', diagnostico: '-', solucion: '-' };

            const leftColX = 14;
            const rightColX = 110;
            let startY = 25;
            const lineHeight = 6;

            // Helper to add row
            const addRow = (label1: string, val1: string, label2?: string, val2?: string) => {
                doc.setFont('helvetica', 'bold');
                doc.text(label1, leftColX, startY);
                doc.setFont('helvetica', 'normal');
                doc.text(val1, leftColX + 35, startY);

                if (label2 && val2) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(label2, rightColX, startY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(val2, rightColX + 35, startY);
                }
                startY += lineHeight;
            };

            addRow('Vehículo:', parentInfo.flota);
            addRow('Servicio:', parentInfo.servicio ?? "");
            addRow('Fecha Ingreso:', parentInfo.fechaIngreso, 'Fecha Salida:', parentInfo.fechaSalida);
            addRow('Km Ingreso:', parentInfo.kmIngreso, 'Km Salida:', parentInfo.kmSalida);
            
            const addLongRow = (label: string, value: string) => {
                doc.setFont('helvetica', 'bold');
                doc.text(label, leftColX, startY);
                startY += lineHeight;
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(value, 180);
                doc.text(splitText, leftColX, startY);
                startY += (splitText.length * lineHeight) + 2;
            };

            addLongRow('Motivo Ingreso:', parentInfo.motivo);
            addLongRow('Diagnóstico:', parentInfo.diagnostico);
            addLongRow('Solución:', parentInfo.solucion);

            startY += 5; // Spacing before table

            // --- Details Table ---
            const tableColumn = ["Producto/Servicio", "Descripción", "Cant.", "Mon.", "Costo", "IGV", "Total"];
            const tableRows: any[] = [];

            reportData.detalles.forEach(item => {
                const row = [
                    (item as any).tipoProducto?.nombre || '',
                    item.descripcion || '',
                    item.cantidad,
                    item.moneda?.codigo,
                    item.costo.toFixed(2),
                    item.montoIGV.toFixed(2),
                    item.total.toFixed(2)
                ];
                tableRows.push(row);
            });

            // Calculate totals for footer
            const totals = Object.entries(reportData.totalsByCurrency || {}).map(([symbol, total]) => {
                return `TOTAL ${symbol}: ${total.toFixed(2)}`;
            }).join(' | ');

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                headStyles: { fillColor: [46, 125, 50] }, // Green
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 20, halign: 'right' },
                    5: { cellWidth: 20, halign: 'right' },
                    6: { cellWidth: 20, halign: 'right' }
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(totals, 195, finalY, { align: 'right' });

            doc.save(generateFileName(reportData.mantenimiento, 'pdf'));

        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    }, []);

    return { generateExcel, generatePdf };
};
