import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatCurrency } from '@/shared/utils/format-utils';
import type { FacturaReporte } from '@/entities/factura/model/types';

type JsPdfWithAutoTable = jsPDF & {
    lastAutoTable?: {
        finalY: number;
    };
};

export const generateFacturaPdf = (reportData: FacturaReporte) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const currencySymbol = reportData.moneda?.simbolo || 'S/';

    // --- Header ---
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('REPORTE DE FACTURA', 40, 40);

    doc.setFontSize(10);
    doc.setTextColor(100);
    
    // Right Side: Factura Info
    doc.setFont('helvetica', 'bold');
    doc.text(`Serie - Número: ${reportData.serie}-${reportData.numero}`, 400, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estado: ${reportData.estado?.nombre || 'N/A'}`, 400, 55);

    // Left Side: Client Info & Dates
    doc.text(`Cliente: ${reportData.cliente?.razonSocial || ''}`, 40, 70);
    doc.text(`RUC: ${reportData.cliente?.ruc || ''}`, 40, 85);
    
    doc.text(`Fecha Emisión: ${formatDateShort(reportData.fechaEmision)}`, 40, 100);
    doc.text(`Días Crédito: ${reportData.diasCredito || 0}`, 40, 115);
    doc.text(`Fecha Vencimiento: ${reportData.fechaVencimiento ? formatDateShort(reportData.fechaVencimiento) : '-'}`, 40, 130);
    doc.text(`Fecha Compromiso: ${reportData.fechaCompromisoPago ? formatDateShort(reportData.fechaCompromisoPago) : '-'}`, 40, 145);

    // Financial Info
    doc.setFont('helvetica', 'bold');
    doc.text(`Monto Facturado: ${formatCurrency(reportData.total, currencySymbol)}`, 350, 100);
    doc.text(`Monto Pagado: ${formatCurrency(reportData.total - reportData.saldoPendiente, currencySymbol)}`, 350, 115);
    doc.setTextColor(200, 0, 0); // Red for pending
    doc.text(`Saldo Pendiente: ${formatCurrency(reportData.saldoPendiente, currencySymbol)}`, 350, 130);
    
    let currentY = 170;

    // --- Detalles de Factura ---
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Detalles de Factura', 40, currentY);
    
    autoTable(doc, {
        startY: currentY + 10,
        head: [['Código Viaje', 'Descripción', 'SubTotal', 'IGV', 'Total']],
        body: reportData.detalles.map(d => [
            d.viajeCodigo || '-',
            `Ruta: ${d.origen || '-'} - ${d.destino || '-'}\nPlaca: ${d.tractoPlaca || '-'}\n${d.descripcion || ''}`,
            formatCurrency(d.subTotal, currencySymbol),
            formatCurrency(d.igv, currencySymbol),
            formatCurrency(d.total, currencySymbol)
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' }
        }
    });

    currentY = ((doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? currentY) + 30;

    // --- Pagos / Amortizaciones ---
    doc.setFontSize(12);
    doc.text('Amortizaciones Registradas', 40, currentY);

    if (reportData.pagos && reportData.pagos.length > 0) {
        autoTable(doc, {
            startY: currentY + 10,
            head: [['Fecha Pago', 'Acreditación', 'Tipo', 'Estado', 'Operación', 'Obs.', 'Monto']],
            body: reportData.pagos.map(p => [
                formatDateShort(p.fechaPago),
                p.fechaAcreditacion ? formatDateShort(p.fechaAcreditacion) : '-',
                p.tipoPagoNombre || '-',
                p.estadoNombre || '-',
                p.numeroOperacion || '-',
                p.observacion || '-',
                formatCurrency(p.montoAbonado, currencySymbol)
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [39, 174, 96] },
            columnStyles: {
                6: { halign: 'right' }
            }
        });
    } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay amortizaciones registradas.', 40, currentY + 15);
    }

    doc.save(`Factura_${reportData.serie}-${reportData.numero}.pdf`);
};

export const generateFacturaExcel = async (reportData: FacturaReporte) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Factura');
    const currencySymbol = reportData.moneda?.simbolo || 'S/';

    // --- Header ---
    sheet.getColumn('A').width = 20;
    sheet.getColumn('B').width = 35;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 15;
    sheet.getColumn('F').width = 15;
    sheet.getColumn('G').width = 15;

    sheet.mergeCells('A1:G1');
    const title = sheet.getCell('A1');
    title.value = `REPORTE DE FACTURA: ${reportData.serie}-${reportData.numero}`;
    title.font = { size: 16, bold: true };
    title.alignment = { horizontal: 'center' };

    sheet.getCell('A3').value = 'Cliente:';
    sheet.getCell('B3').value = reportData.cliente?.razonSocial;
    sheet.getCell('E3').value = 'Monto Facturado:';
    sheet.getCell('F3').value = reportData.total;

    sheet.getCell('A4').value = 'Fecha Emisión:';
    sheet.getCell('B4').value = formatDateShort(reportData.fechaEmision);
    sheet.getCell('E4').value = 'Monto Pagado:';
    sheet.getCell('F4').value = reportData.total - reportData.saldoPendiente;

    sheet.getCell('A5').value = 'Días Crédito:';
    sheet.getCell('B5').value = reportData.diasCredito;
    sheet.getCell('E5').value = 'Saldo Pendiente:';
    sheet.getCell('F5').value = reportData.saldoPendiente;
    sheet.getCell('E5').font = { bold: true };
    sheet.getCell('F5').font = { bold: true, color: { argb: 'FFFF0000' } };

    sheet.getCell('A6').value = 'Fecha Venc.:';
    sheet.getCell('B6').value = reportData.fechaVencimiento ? formatDateShort(reportData.fechaVencimiento) : '-';

    // Format currency cells
    ['F3', 'F4', 'F5'].forEach(cell => {
        sheet.getCell(cell).numFmt = `"${currencySymbol}" #,##0.00`;
    });

    // --- Detalles ---
    let row = 9;
    sheet.getCell(`A${row}`).value = 'DETALLES DE FACTURA';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    
    row++;
    const detailHeaders = ['Código Viaje', 'Descripción', 'SubTotal', 'IGV', 'Total'];
    detailHeaders.forEach((header, index) => {
        const cell = sheet.getCell(row, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
    });

    row++;
    reportData.detalles.forEach(d => {
        sheet.getCell(row, 1).value = d.viajeCodigo || '-';
        sheet.getCell(row, 2).value = `Ruta: ${d.origen || '-'} - ${d.destino || '-'}\nPlaca: ${d.tractoPlaca || '-'}\n${d.descripcion || ''}`;
        sheet.getCell(row, 3).value = d.subTotal;
        sheet.getCell(row, 4).value = d.igv;
        sheet.getCell(row, 5).value = d.total;
        
        // Format currencies
        sheet.getCell(row, 3).numFmt = `"${currencySymbol}" #,##0.00`;
        sheet.getCell(row, 4).numFmt = `"${currencySymbol}" #,##0.00`;
        sheet.getCell(row, 5).numFmt = `"${currencySymbol}" #,##0.00`;
        
        sheet.getCell(row, 2).alignment = { wrapText: true };
        row++;
    });

    // --- Pagos ---
    row += 2;
    sheet.getCell(`A${row}`).value = 'AMORTIZACIONES REGISTRADAS';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };

    row++;
    if (reportData.pagos && reportData.pagos.length > 0) {
        const pagoHeaders = ['Fecha Pago', 'Acreditación', 'Tipo', 'Estado', 'Operación', 'Obs.', 'Monto'];
        pagoHeaders.forEach((header, index) => {
            const cell = sheet.getCell(row, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF27AE60' } };
        });

        row++;
        reportData.pagos.forEach(p => {
            sheet.getCell(row, 1).value = formatDateShort(p.fechaPago);
            sheet.getCell(row, 2).value = p.fechaAcreditacion ? formatDateShort(p.fechaAcreditacion) : '-';
            sheet.getCell(row, 3).value = p.tipoPagoNombre || '-';
            sheet.getCell(row, 4).value = p.estadoNombre || '-';
            sheet.getCell(row, 5).value = p.numeroOperacion || '-';
            sheet.getCell(row, 6).value = p.observacion || '-';
            sheet.getCell(row, 7).value = p.montoAbonado;
            
            sheet.getCell(row, 7).numFmt = `"${currencySymbol}" #,##0.00`;
            row++;
        });
    } else {
        sheet.getCell(`A${row}`).value = 'No hay amortizaciones registradas.';
        sheet.getCell(`A${row}`).font = { italic: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Factura_${reportData.serie}-${reportData.numero}.xlsx`);
};
