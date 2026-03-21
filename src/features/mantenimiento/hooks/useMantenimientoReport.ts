import { useCallback } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import { formatDateLong } from '@shared/utils/date-utils';
import type { MantenimientoParams, Mantenimiento, MantenimientoDetalle } from '@entities/mantenimiento/model/types';

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

    const fetchSummaryReportData = async (params: Omit<MantenimientoParams, 'page' | 'size'>) => {
        try {
            const data = await mantenimientoApi.getSummaryReport(params);
            return data;
        } catch (error) {
            console.error("Error fetching summary report data", error);
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
                placa: reportData.mantenimiento.flota?.placa || '-',
                servicio: reportData.mantenimiento.tipoServicio?.nombre || '-',
                fechaIngreso: formatDateLong(reportData.mantenimiento.fechaIngreso),
                kmIngreso: reportData.mantenimiento.kmIngreso?.toString() || '-',
                motivo: reportData.mantenimiento.motivoIngreso || '-',
                estado: reportData.mantenimiento.estado?.nombre || '-',
                fechaSalida: reportData.mantenimiento.fechaSalida ? formatDateLong(reportData.mantenimiento.fechaSalida) : '-',
                kmSalida: reportData.mantenimiento.kmSalida?.toString() || '-',
                diagnostico: reportData.mantenimiento.diagnosticoMecanico || '-',
                solucion: reportData.mantenimiento.solucion || '-'
            } : { placa: '-', servicio: '-', fechaIngreso: '-', kmIngreso: '-', motivo: '-', estado: '-', fechaSalida: '-', kmSalida: '-', diagnostico: '-', solucion: '-' };

            const addInfoRow = (row: number, label1: string, value1: string, label2?: string, value2?: string) => {
                const labelCell1 = worksheet.getCell(`A${row}`);
                labelCell1.value = label1;
                labelCell1.font = { bold: true };
                worksheet.getCell(`B${row}`).value = value1;
                worksheet.mergeCells(`B${row}:D${row}`);

                if (label2 && value2) {
                    const labelCell2 = worksheet.getCell(`F${row}`);
                    labelCell2.value = label2;
                    labelCell2.font = { bold: true };
                    worksheet.getCell(`G${row}`).value = value2;
                    worksheet.mergeCells(`G${row}:I${row}`);
                }
            };

            addInfoRow(3, 'Placa de Unidad:', parentInfo.placa, 'Estado:', parentInfo.estado);
            addInfoRow(4, 'Tipo de Servicio:', parentInfo.servicio);
            addInfoRow(5, 'Fecha Ingreso:', parentInfo.fechaIngreso, 'Fecha de Salida:', parentInfo.fechaSalida);
            addInfoRow(6, 'Km. Ingreso:', parentInfo.kmIngreso, 'Km. Salida:', parentInfo.kmSalida);
            addInfoRow(7, 'Motivo de Ingreso:', parentInfo.motivo);
            addInfoRow(8, 'Diagnóstico Mecánico:', parentInfo.diagnostico);
            addInfoRow(9, 'Solución:', parentInfo.solucion);

            // --- Table Header ---
            const headerRowIndex = 11;
            const headers = [
                'Categoría', 'Producto', 'Descripción', 'Cantidad', 'Moneda', 
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
                    item.tipoProducto?.categoria || '',
                    item.tipoProducto?.nombre || '',
                    item.descripcion || '',
                    item.cantidad,
                    item.moneda?.codigo || '',
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
                { width: 20 }, { width: 30 }, { width: 40 }, { width: 10 }, { width: 10 },
                { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
            ];

            // --- Totals ---
            currentRowIndex += 1;
            Object.entries(reportData.totalsByCurrency || {}).forEach(([symbol, total]) => {
                const totalLabelCell = worksheet.getCell(`H${currentRowIndex}`);
                totalLabelCell.value = `TOTAL ${symbol}`;
                totalLabelCell.font = { bold: true };
                totalLabelCell.alignment = { horizontal: 'right' };
                totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

                const totalValueCell = worksheet.getCell(`I${currentRowIndex}`);
                totalValueCell.value = total as number;
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
                placa: reportData.mantenimiento.flota?.placa || '-',
                servicio: reportData.mantenimiento.tipoServicio?.nombre || '-',
                fechaIngreso: formatDateLong(reportData.mantenimiento.fechaIngreso),
                kmIngreso: reportData.mantenimiento.kmIngreso?.toString() || '-',
                motivo: reportData.mantenimiento.motivoIngreso || '-',
                estado: reportData.mantenimiento.estado?.nombre || '-',
                fechaSalida: reportData.mantenimiento.fechaSalida ? formatDateLong(reportData.mantenimiento.fechaSalida) : '-',
                kmSalida: reportData.mantenimiento.kmSalida?.toString() || '-',
                diagnostico: reportData.mantenimiento.diagnosticoMecanico || '-',
                solucion: reportData.mantenimiento.solucion || '-'
            } : { placa: '-', servicio: '-', fechaIngreso: '-', kmIngreso: '-', motivo: '-', estado: '-', fechaSalida: '-', kmSalida: '-', diagnostico: '-', solucion: '-' };

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

            addRow('Placa de Unidad:', parentInfo.placa, 'Estado:', parentInfo.estado);
            addRow('Tipo de Servicio:', parentInfo.servicio);
            addRow('Fecha Ingreso:', parentInfo.fechaIngreso, 'Fecha Salida:', parentInfo.fechaSalida);
            addRow('Km. Ingreso:', parentInfo.kmIngreso, 'Km. Salida:', parentInfo.kmSalida);
            
            const addLongRow = (label: string, value: string) => {
                doc.setFont('helvetica', 'bold');
                doc.text(label, leftColX, startY);
                startY += lineHeight;
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(value, 180);
                doc.text(splitText, leftColX, startY);
                startY += (splitText.length * lineHeight) + 2;
            };

            addLongRow('Motivo de Ingreso:', parentInfo.motivo);
            addLongRow('Diagnóstico Mecánico:', parentInfo.diagnostico);
            addLongRow('Solución:', parentInfo.solucion);

            startY += 5; // Spacing before table

            // --- Details Table ---
            const tableColumn = ["Categoría", "Producto", "Descripción", "Cant.", "Mon.", "Costo", "IGV", "Total"];
            const tableRows: any[] = [];

            reportData.detalles.forEach(item => {
                const row = [
                    item.tipoProducto?.categoria || '',
                    item.tipoProducto?.nombre || '',
                    item.descripcion || '',
                    item.cantidad,
                    item.moneda?.codigo,
                    item.costo.toFixed(2),
                    item.montoIGV.toFixed(2),
                    item.total.toFixed(2)
                ];
                tableRows.push(row);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                headStyles: { fillColor: [46, 125, 50] }, // Green
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 10, halign: 'center' },
                    4: { cellWidth: 10, halign: 'center' },
                    5: { cellWidth: 15, halign: 'right' },
                    6: { cellWidth: 15, halign: 'right' },
                    7: { cellWidth: 15, halign: 'right' }
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            
            let currentTotalY = finalY;
            Object.entries(reportData.totalsByCurrency || {}).forEach(([symbol, total]) => {
                doc.text(`TOTAL ${symbol}: ${(total as number).toFixed(2)}`, 195, currentTotalY, { align: 'right' });
                currentTotalY += 6;
            });

            doc.save(generateFileName(reportData.mantenimiento, 'pdf'));

        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    }, []);

    const generateSummaryExcel = useCallback(async (params: Omit<MantenimientoParams, 'page' | 'size'>) => {
        try {
            const reportData = await fetchSummaryReportData(params);
            if (!reportData || !reportData.mantenimientos) return;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte Total Mantenimientos');

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
            worksheet.mergeCells('A1:I1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'REPORTE TOTAL DE MANTENIMIENTOS';
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF2E7D32' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(1).height = 30;

            // --- Table Header ---
            const headerRowIndex = 3;
            const currencies = Object.keys(reportData.totalsByCurrency || {});
            const headers = [
                'Tracto', 'Tipo Servicio', 'Fecha Ingreso', 'Fecha Salida', 
                'Km. Ingreso', 'Km. Salida', 'Motivo Ingreso', 'Diagnóstico Mecánico', 'Solución',
                ...currencies.map(c => `Gastos (${c})`)
            ];
            const headerRow = worksheet.getRow(headerRowIndex);
            headerRow.values = headers;
            headerRow.height = 20;

            headerRow.eachCell((cell) => {
                cell.style = headerStyle;
            });

            // --- Data ---
            let currentRowIndex = headerRowIndex + 1;
            reportData.mantenimientos.forEach((item: Mantenimiento) => {
                const maintTotals: Record<string, number> = {};
                (item.mantenimientoDetalles || []).forEach((d: MantenimientoDetalle) => {
                    const symbol = d.moneda?.simbolo || '';
                    maintTotals[symbol] = (maintTotals[symbol] || 0) + d.total;
                });

                const rowValues: (string | number)[] = [
                    `${item.flota?.marca || ''} ${item.flota?.modelo || ''} (${item.flota?.placa || ''})`.trim(),
                    item.tipoServicio?.nombre || '',
                    formatDateLong(item.fechaIngreso),
                    item.fechaSalida ? formatDateLong(item.fechaSalida) : '-',
                    item.kmIngreso || '-',
                    item.kmSalida || '-',
                    item.motivoIngreso || '-',
                    item.diagnosticoMecanico || '-',
                    item.solucion || '-'
                ];

                currencies.forEach(c => {
                    rowValues.push(maintTotals[c] || 0);
                });

                const row = worksheet.getRow(currentRowIndex);
                row.values = rowValues;
                
                row.eachCell((cell, colNumber) => {
                    cell.style = dataStyle;
                    if (colNumber > 9) {
                        cell.numFmt = '#,##0.00';
                    }
                });
                
                currentRowIndex++;
            });

            // --- Column Widths ---
            worksheet.columns = [
                { width: 30 }, { width: 20 }, { width: 15 }, { width: 15 }, 
                { width: 15 }, { width: 15 }, { width: 30 }, { width: 30 }, { width: 30 },
                ...currencies.map(() => ({ width: 15 }))
            ];

            // --- Totals ---
            currentRowIndex += 2;
            const totalTitleRow = worksheet.getRow(currentRowIndex);
            totalTitleRow.getCell(8).value = 'GASTOS TOTALES';
            totalTitleRow.getCell(8).font = { bold: true };
            currentRowIndex++;

            Object.entries(reportData.totalsByCurrency || {}).forEach(([symbol, total]) => {
                const totalLabelCell = worksheet.getCell(`H${currentRowIndex}`);
                totalLabelCell.value = `TOTAL ${symbol}`;
                totalLabelCell.font = { bold: true };
                totalLabelCell.alignment = { horizontal: 'right' };
                totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

                const totalValueCell = worksheet.getCell(`I${currentRowIndex}`);
                totalValueCell.value = total as number;
                totalValueCell.font = { bold: true, color: { argb: 'FF2E7D32' } };
                totalValueCell.numFmt = '#,##0.00';
                totalValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
                
                currentRowIndex++;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            saveAs(blob, `Reporte_Total_Mantenimientos_${fecha}.xlsx`);

        } catch (error) {
            console.error('Error exporting summary to Excel:', error);
        }
    }, []);

    const generateSummaryPdf = useCallback(async (params: Omit<MantenimientoParams, 'page' | 'size'>) => {
        try {
            const reportData = await fetchSummaryReportData(params);
            if (!reportData || !reportData.mantenimientos) return;

            const doc = new jsPDF('landscape'); // Landscape format for more columns
            
            // --- Title ---
            doc.setFontSize(18);
            doc.setTextColor(46, 125, 50); // Green
            doc.text('REPORTE TOTAL DE MANTENIMIENTOS', 148, 15, { align: 'center' });

            let startY = 25;

            // --- Data Table ---
            const currencies = Object.keys(reportData.totalsByCurrency || {});
            const tableColumn = [
                "Tracto", "Tipo Servicio", "Fecha Ing.", "Fecha Sal.", 
                "Km. Ing.", "Km. Sal.", "Motivo", "Solución",
                ...currencies.map(c => `Total ${c}`)
            ];
            const tableRows: (string | number)[][] = [];

            reportData.mantenimientos.forEach((item: Mantenimiento) => {
                const maintTotals: Record<string, number> = {};
                (item.mantenimientoDetalles || []).forEach((d: MantenimientoDetalle) => {
                    const symbol = d.moneda?.simbolo || '';
                    maintTotals[symbol] = (maintTotals[symbol] || 0) + d.total;
                });

                const row = [
                    `${item.flota?.marca || ''} ${item.flota?.modelo || ''} (${item.flota?.placa || ''})`.trim(),
                    item.tipoServicio?.nombre || '',
                    formatDateLong(item.fechaIngreso),
                    item.fechaSalida ? formatDateLong(item.fechaSalida) : '-',
                    item.kmIngreso || '-',
                    item.kmSalida || '-',
                    item.motivoIngreso || '-',
                    item.solucion || '-'
                ];

                currencies.forEach(c => {
                    row.push((maintTotals[c] || 0).toFixed(2));
                });

                tableRows.push(row);
            });

            const columnStyles: Record<number, Record<string, string | number>> = {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 },
                6: { cellWidth: 'auto' },
                7: { cellWidth: 'auto' }
            };

            currencies.forEach((_, idx) => {
                columnStyles[8 + idx] = { cellWidth: 15, halign: 'right' };
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                headStyles: { fillColor: [46, 125, 50] }, // Green
                styles: { fontSize: 7 },
                columnStyles: columnStyles
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            
            let currentTotalY = finalY;
            doc.text('GASTOS TOTALES:', 280, currentTotalY, { align: 'right' });
            currentTotalY += 6;
            
            Object.entries(reportData.totalsByCurrency || {}).forEach(([symbol, total]) => {
                doc.text(`TOTAL ${symbol}: ${(total as number).toFixed(2)}`, 280, currentTotalY, { align: 'right' });
                currentTotalY += 6;
            });

            const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            doc.save(`Reporte_Total_Mantenimientos_${fecha}.pdf`);

        } catch (error) {
            console.error('Error exporting summary to PDF:', error);
        }
    }, []);

    return { generateExcel, generatePdf, generateSummaryExcel, generateSummaryPdf };
};
