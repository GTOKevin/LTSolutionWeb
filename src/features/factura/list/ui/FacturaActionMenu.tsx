import { useState } from 'react';
import { 
    IconButton, 
    Menu, 
    MenuItem, 
    ListItemIcon, 
    ListItemText, 
    Divider 
} from '@mui/material';
import { 
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Payments as PaymentsIcon,
    ReceiptLong as ReceiptLongIcon,
    Send as SendIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    PictureAsPdf as PdfIcon,
    Description as ExcelIcon
} from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';
import type { SelectItem } from '@/shared/model/types';
import { facturaApi } from '@/entities/factura/api/factura.api';
import {
    isFacturaAnulada,
    isFacturaEmitida,
    isFacturaEntregada,
    isFacturaGenerada,
    resolveFacturaAnuladaId,
    resolveFacturaEmitidaId,
    resolveFacturaEntregadaId,
} from '@/entities/factura/model/status';
import { logger } from '@/shared/utils/logger';
import { generateFacturaPdf, generateFacturaExcel } from '../../utils/facturaReportGenerator';

interface FacturaActionMenuProps {
    factura: Factura;
    onView?: (f: Factura) => void;
    onEdit?: (f: Factura) => void;
    onDelete?: (f: Factura) => void;
    onPayment?: (f: Factura) => void;
    onViewPayments?: (f: Factura) => void;
    onUpdateStatus?: (f: Factura, newStatusId: number) => void;
    statusCatalog?: SelectItem[];
}

export function FacturaActionMenu({
    factura,
    onView,
    onEdit,
    onDelete,
    onPayment,
    onViewPayments,
    onUpdateStatus,
    statusCatalog = [],
}: FacturaActionMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        // event?.stopPropagation();
        setAnchorEl(null);
    };

    const handleGenerateReport = async (type: 'pdf' | 'excel') => {
        setIsGenerating(true);
        try {
            const reportData = await facturaApi.getReporteById(factura.facturaID);
            if (type === 'pdf') {
                generateFacturaPdf(reportData);
            } else {
                await generateFacturaExcel(reportData);
            }
        } catch (error) {
            logger.error('Error al generar el reporte', error);
        } finally {
            setIsGenerating(false);
            handleClose();
        }
    };

    const isGenerado = isFacturaGenerada(factura);
    const isEmitido = isFacturaEmitida(factura);
    const isAnulado = isFacturaAnulada(factura);
    const isEntregado = isFacturaEntregada(factura);
    const emitidaStatusId = resolveFacturaEmitidaId(statusCatalog);
    const entregadaStatusId = resolveFacturaEntregadaId(statusCatalog);
    const anuladaStatusId = resolveFacturaAnuladaId(statusCatalog);
    const canManageFactura =
        Boolean(onEdit) ||
        Boolean(onDelete) ||
        Boolean(onPayment) ||
        Boolean(onViewPayments) ||
        Boolean(onUpdateStatus) ||
        Boolean(onView);

    if (!canManageFactura) {
        return null;
    }

    return (
        <>
            <IconButton size="small" onClick={handleClick}>
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={(e) => e.stopPropagation()}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: { minWidth: 200, borderRadius: 2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1)' }
                }}
            >
                {/* Visualización y Edición */}
                {onView && (
                    <MenuItem onClick={() => { onView(factura); handleClose(); }}>
                        <ListItemIcon><ViewIcon fontSize="small" color="info" /></ListItemIcon>
                        <ListItemText>Ver Detalle</ListItemText>
                    </MenuItem>
                )}
                
                {/* Solo se edita si está GENERADO */}
                {isGenerado && onEdit && (
                    <MenuItem onClick={() => { onEdit(factura); handleClose(); }}>
                        <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText>Editar Factura</ListItemText>
                    </MenuItem>
                )}

                {/* Acciones de Pagos */}
                {(onViewPayments || onPayment) && <Divider />}
                {onViewPayments && (
                    <MenuItem onClick={() => { onViewPayments(factura); handleClose(); }}>
                        <ListItemIcon><ReceiptLongIcon fontSize="small" color="action" /></ListItemIcon>
                        <ListItemText>Ver Amortizaciones</ListItemText>
                    </MenuItem>
                )}
                
                {/* Registrar Amortización: Permitido si hay saldo y no está anulada o recién generada */}
                {onPayment && (
                    <MenuItem 
                        onClick={() => { onPayment(factura); handleClose(); }}
                        disabled={factura.saldoPendiente <= 0 || isAnulado || isGenerado}
                    >
                        <ListItemIcon><PaymentsIcon fontSize="small" color={factura.saldoPendiente > 0 && !isAnulado && !isGenerado ? "success" : "disabled"} /></ListItemIcon>
                        <ListItemText>Registrar Pago</ListItemText>
                    </MenuItem>
                )}

                {/* Cambios de Estado */}
                {onUpdateStatus && <Divider />}
                {isGenerado && onUpdateStatus && emitidaStatusId ? (
                    <MenuItem onClick={() => { onUpdateStatus(factura, emitidaStatusId); handleClose(); }}>
                        <ListItemIcon><SendIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText>Emitir Factura</ListItemText>
                    </MenuItem>
                ) : null}
                
                {isEmitido && onUpdateStatus && entregadaStatusId ? (
                    <MenuItem onClick={() => { onUpdateStatus(factura, entregadaStatusId); handleClose(); }}>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Marcar como Entregado</ListItemText>
                    </MenuItem>
                ) : null}

                {(isGenerado || isEmitido) && onUpdateStatus && anuladaStatusId ? (
                    <MenuItem onClick={() => { onUpdateStatus(factura, anuladaStatusId); handleClose(); }}>
                        <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText sx={{ color: 'error.main' }}>Anular Factura</ListItemText>
                    </MenuItem>
                ) : null}

                {/* Descarga de Reportes */}
                {isEntregado && onUpdateStatus
                    ? [
                          <Divider key="report-divider" />,
                          <MenuItem key="report-pdf" onClick={() => handleGenerateReport('pdf')} disabled={isGenerating}>
                              <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
                              <ListItemText>Descargar PDF</ListItemText>
                          </MenuItem>,
                          <MenuItem key="report-excel" onClick={() => handleGenerateReport('excel')} disabled={isGenerating}>
                              <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon>
                              <ListItemText>Descargar Excel</ListItemText>
                          </MenuItem>,
                      ]
                    : null}

                {/* Eliminar (Generalmente solo si está Generado, pero dejaremos según lógica anterior) */}
                {onDelete && (
                    <>
                        <Divider />
                        <MenuItem onClick={() => { onDelete(factura); handleClose(); }}>
                            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
}
