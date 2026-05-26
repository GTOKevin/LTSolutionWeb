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
import { ESTADO_FACTURA_ID } from '@/shared/constants/constantes';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { generateFacturaPdf, generateFacturaExcel } from '../../utils/facturaReportGenerator';

interface FacturaActionMenuProps {
    factura: Factura;
    onView: (f: Factura) => void;
    onEdit: (f: Factura) => void;
    onDelete: (f: Factura) => void;
    onPayment: (f: Factura) => void;
    onViewPayments: (f: Factura) => void;
    onUpdateStatus: (f: Factura, newStatusId: number) => void;
}

export function FacturaActionMenu({
    factura,
    onView,
    onEdit,
    onDelete,
    onPayment,
    onViewPayments,
    onUpdateStatus
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
            console.error('Error al generar el reporte', error);
        } finally {
            setIsGenerating(false);
            handleClose();
        }
    };

    const isGenerado = factura.estadoID === ESTADO_FACTURA_ID.GENERADO;
    const isEmitido = factura.estadoID === ESTADO_FACTURA_ID.EMITIDO;
    const isAnulado = factura.estadoID === ESTADO_FACTURA_ID.ANULADO;
    const isEntregado = factura.estadoID == ESTADO_FACTURA_ID.ENTREGADO;

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
                <MenuItem onClick={() => { onView(factura); handleClose(); }}>
                    <ListItemIcon><ViewIcon fontSize="small" color="info" /></ListItemIcon>
                    <ListItemText>Ver Detalle</ListItemText>
                </MenuItem>
                
                {/* Solo se edita si está GENERADO */}
                {isGenerado && (
                    <MenuItem onClick={() => { onEdit(factura); handleClose(); }}>
                        <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText>Editar Factura</ListItemText>
                    </MenuItem>
                )}

                {/* Acciones de Pagos */}
                <Divider />
                <MenuItem onClick={() => { onViewPayments(factura); handleClose(); }}>
                    <ListItemIcon><ReceiptLongIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText>Ver Amortizaciones</ListItemText>
                </MenuItem>
                
                {/* Registrar Amortización: Permitido si hay saldo y no está anulada o recién generada */}
                <MenuItem 
                    onClick={() => { onPayment(factura); handleClose(); }}
                    disabled={factura.saldoPendiente <= 0 || isAnulado || isGenerado}
                >
                    <ListItemIcon><PaymentsIcon fontSize="small" color={factura.saldoPendiente > 0 && !isAnulado && !isGenerado ? "success" : "disabled"} /></ListItemIcon>
                    <ListItemText>Registrar Pago</ListItemText>
                </MenuItem>

                {/* Cambios de Estado */}
                <Divider />
                {isGenerado && (
                    <MenuItem onClick={() => { onUpdateStatus(factura, ESTADO_FACTURA_ID.EMITIDO); handleClose(); }}>
                        <ListItemIcon><SendIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText>Emitir Factura</ListItemText>
                    </MenuItem>
                )}
                
                {isEmitido && (
                    <MenuItem onClick={() => { onUpdateStatus(factura, ESTADO_FACTURA_ID.ENTREGADO); handleClose(); }}>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Marcar como Entregado</ListItemText>
                    </MenuItem>
                )}

                {(isGenerado || isEmitido) && (
                    <MenuItem onClick={() => { onUpdateStatus(factura, ESTADO_FACTURA_ID.ANULADO); handleClose(); }}>
                        <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText sx={{ color: 'error.main' }}>Anular Factura</ListItemText>
                    </MenuItem>
                )}

                {/* Descarga de Reportes */}
                {isEntregado && (
                    <>
                        <Divider />
                        <MenuItem onClick={() => handleGenerateReport('pdf')} disabled={isGenerating}>
                            <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText>Descargar PDF</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleGenerateReport('excel')} disabled={isGenerating}>
                            <ListItemIcon><ExcelIcon fontSize="small" color="success" /></ListItemIcon>
                            <ListItemText>Descargar Excel</ListItemText>
                        </MenuItem>
                    </>
                )}

                {/* Eliminar (Generalmente solo si está Generado, pero dejaremos según lógica anterior) */}
                <Divider />
                <MenuItem onClick={() => { onDelete(factura); handleClose(); }}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}