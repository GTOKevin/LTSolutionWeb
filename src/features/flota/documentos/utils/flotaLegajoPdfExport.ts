import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FlotaDocumento } from '@entities/flota/model/types';
import { formatDateLong, formatDateShort } from '@/shared/utils/date-utils';
import { getDocumentVigenciaMetaByExpirationDate } from '@/shared/utils/document-vigencia';

type JsPdfWithAutoTable = jsPDF & {
    lastAutoTable?: {
        finalY?: number;
    };
};

interface ExportLegajoPdfOptions {
    placa?: string;
    flotaId: number;
    documentos: FlotaDocumento[];
}

export function exportFlotaLegajoPdf({
    placa,
    flotaId,
    documentos,
}: ExportLegajoPdfOptions) {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const fechaReporte = formatDateLong(now.toISOString().split('T')[0]);

    // Encabezado Corporativo EURO TRANSPORT
    doc.setFillColor(0, 69, 128); // #004580 (Primary Stitch)
    doc.rect(0, 0, pageWidth, 56, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EURO TRANSPORT — ENTERPRISE LOGISTICS', 40, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('LEGAJO TÉCNICO Y CONTROL DE VIGENCIA DE PÓLIZAS', 40, 46);

    const docCount = `${documentos.length} DOCUMENTO${documentos.length === 1 ? '' : 'S'}`;
    doc.text(docCount, pageWidth - 40, 36, { align: 'right' });

    // Tarjeta de Información de la Unidad
    let currentY = 76;
    doc.setFillColor(248, 250, 252); // surface-bg
    doc.roundedRect(40, currentY, pageWidth - 80, 50, 6, 6, 'F');

    doc.setTextColor(17, 28, 45); // on-surface
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('UNIDAD DE TRANSPORTE:', 55, currentY + 22);

    doc.setFont('courier', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 69, 128);
    doc.text(placa ? `PLACA: ${placa.toUpperCase()}` : `FLOTA ID: #${flotaId}`, 200, currentY + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 95, 98); // secondary
    doc.text(`Fecha de emisión del informe: ${fechaReporte}`, 55, currentY + 38);

    const vigentes = documentos.filter(
        (d) => getDocumentVigenciaMetaByExpirationDate(d.fechaVencimiento).key === 'vigente'
    ).length;
    const porVencer = documentos.filter(
        (d) => getDocumentVigenciaMetaByExpirationDate(d.fechaVencimiento).key === 'por_vencer'
    ).length;
    const vencidos = documentos.filter(
        (d) => getDocumentVigenciaMetaByExpirationDate(d.fechaVencimiento).key === 'vencido'
    ).length;

    doc.text(
        `Estado del Legajo: ${vigentes} Vigentes | ${porVencer} Próximos a Vencer | ${vencidos} Vencidos`,
        pageWidth - 55,
        currentY + 28,
        { align: 'right' }
    );

    // Tabla de Documentos
    currentY += 64;

    const tableRows = documentos.map((docItem, index) => {
        const meta = getDocumentVigenciaMetaByExpirationDate(docItem.fechaVencimiento);
        let estadoLabel = 'Vigente';
        if (meta.key === 'vencido') {
            estadoLabel = `Vencido (${Math.abs(meta.daysLeft ?? 0)}d)`;
        } else if (meta.key === 'por_vencer') {
            estadoLabel = `Por Vencer (${meta.daysLeft ?? 0}d)`;
        } else if (meta.daysLeft) {
            estadoLabel = `Vigente (${meta.daysLeft}d)`;
        }

        return [
            (index + 1).toString(),
            docItem.tipoDocumento?.nombre || `Tipo ${docItem.tipoDocumentoID}`,
            docItem.numeroDocumento || 'S/N',
            docItem.entidadEmisora || '—',
            formatDateShort(docItem.fechaEmision) || '—',
            formatDateShort(docItem.fechaVencimiento) || '—',
            estadoLabel,
            docItem.rutaArchivo ? 'SÍ (Adjunto)' : 'NO',
        ];
    });

    autoTable(doc, {
        startY: currentY,
        head: [
            [
                '#',
                'Tipo de Documento',
                'N° Documento / Póliza',
                'Entidad Emisora',
                'F. Emisión',
                'F. Vencimiento',
                'Estado de Vigencia',
                'Archivo Digital',
            ],
        ],
        body: tableRows,
        theme: 'striped',
        margin: { left: 40, right: 40 },
        headStyles: {
            fillColor: [0, 69, 128],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 6,
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 6,
            textColor: [17, 28, 45],
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            1: { cellWidth: 150 },
            2: { cellWidth: 140, font: 'courier', fontStyle: 'bold' },
            3: { cellWidth: 130 },
            4: { cellWidth: 70, halign: 'center' },
            5: { cellWidth: 70, halign: 'center' },
            6: { cellWidth: 110, halign: 'center', fontStyle: 'bold' },
            7: { cellWidth: 65, halign: 'center' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 6) {
                const cellText = String(data.cell.raw || '');
                if (cellText.includes('Vencido')) {
                    data.cell.styles.textColor = [186, 26, 26]; // Error
                } else if (cellText.includes('Por Vencer')) {
                    data.cell.styles.textColor = [245, 158, 11]; // Warning
                } else {
                    data.cell.styles.textColor = [16, 185, 129]; // Success
                }
            }
        },
    });

    const finalY = (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? currentY + 120;

    // Pie de página: la vigencia se calcula con las fechas registradas en el sistema.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(114, 119, 130);
    doc.text(
        'Reporte generado a partir de los documentos registrados en el sistema EURO TRANSPORT. La vigencia se calcula con las fechas de vencimiento almacenadas.',
        40,
        Math.min(finalY + 24, doc.internal.pageSize.getHeight() - 20)
    );

    const safePlaca = (placa || `Flota_${flotaId}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Legajo_Digital_${safePlaca}_${now.toISOString().split('T')[0]}.pdf`);
}
