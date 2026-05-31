import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, alpha, useTheme } from '@mui/material';
import { Close as CloseIcon, Payments as PaymentsIcon } from '@mui/icons-material';
import type { Factura } from '@/entities/factura/model/types';
import { FacturaPagos } from './FacturaPagos';

interface FacturaPagosModalProps {
    open: boolean;
    onClose: () => void;
    factura: Factura | null;
}

export function FacturaPagosModal({ open, onClose, factura }: FacturaPagosModalProps) {
    const theme = useTheme();

    if (!factura) return null;

    return (
        <Dialog 
            open={open} 
            onClose={(_, reason) => {
                if (reason === 'backdropClick') return;
                onClose();
            }}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, boxShadow: '0 24px 40px -12px rgba(25, 28, 29, 0.06)', minHeight: '50vh' }
            }}
        >
            <DialogTitle sx={{ 
                p: 3, 
                pb: 2, 
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentsIcon color="primary" />
                    <Typography component="span" variant="h6" fontWeight="bold">
                        Amortizaciones de Factura {factura.serie}-{factura.numero}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3 }}>
                <FacturaPagos factura={factura} />
            </DialogContent>
        </Dialog>
    );
}