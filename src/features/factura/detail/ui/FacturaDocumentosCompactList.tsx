import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    useTheme,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    ReceiptLong as ReceiptIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { facturaDocumentoApi } from '@entities/factura-documento/api/factura-documento.api';
import type { FacturaDocumento } from '@entities/factura-documento/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { FacturaDocumentoItem } from '@shared/components/ui/FacturaDocumentoItem';
import { FacturaDocumentoForm } from '@/features/factura/documentos/ui/FacturaDocumentoForm';
import { useDeleteFacturaDocumento } from '@/features/factura/documentos/hooks/useFacturaDocumentoCrud';

interface FacturaDocumentosCompactListProps {
    facturaId: number;
    canManageFacturas: boolean;
}

export function FacturaDocumentosCompactList({
    facturaId,
    canManageFacturas,
}: FacturaDocumentosCompactListProps) {
    const theme = useTheme();
    const [formOpen, setFormOpen] = useState(false);
    const [documentoToDelete, setDocumentoToDelete] = useState<FacturaDocumento | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['factura-documentos', facturaId],
        queryFn: () => facturaDocumentoApi.getAll({ facturaID: facturaId, page: 1, size: 50 }),
        enabled: !!facturaId,
    });

    const deleteMutation = useDeleteFacturaDocumento();
    const documentos: FacturaDocumento[] = data?.items ?? [];

    const handleDeleteConfirm = () => {
        if (documentoToDelete) {
            deleteMutation.mutate(documentoToDelete.facturaDocumentoID, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setDocumentoToDelete(null);
                    void refetch();
                },
            });
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Header con título y botón de adjuntar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon fontSize="small" color="primary" />
                    <Typography variant="caption" fontWeight={800} textTransform="uppercase" letterSpacing="0.08em" color="text.secondary">
                        Factura Electrónica Adjunta(PDF)
                    </Typography>
                </Box>
                {canManageFacturas && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon fontSize="small" />}
                        onClick={() => setFormOpen(true)}
                        sx={{
                            borderRadius: 1.5,
                            py: 0.3,
                            px: 1.2,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            textTransform: 'none',
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                        }}
                    >
                        Adjuntar
                    </Button>
                )}
            </Box>

            {isLoading ? (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                </Box>
            ) : documentos.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 1.75,
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.divider, 0.8),
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        No hay archivos de factura electrónica adjuntos.
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {documentos.map((doc) => {
                        const fileName = doc.descripcion || (doc.rutaArchivo ? doc.rutaArchivo.split('/').pop() : `Factura #${doc.facturaDocumentoID}`);

                        return (
                            <FacturaDocumentoItem
                                key={doc.facturaDocumentoID}
                                rutaArchivo={doc.rutaArchivo}
                                fileName={fileName}
                                canDelete={canManageFacturas}
                                onDelete={() => {
                                    setDocumentoToDelete(doc);
                                    setDeleteDialogOpen(true);
                                }}
                            />
                        );
                    })}
                </Box>
            )}

            <FacturaDocumentoForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    void refetch();
                }}
                facturaId={facturaId}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Eliminar Documento"
                content={`¿Está seguro que desea eliminar este archivo adjunto?`}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setDocumentoToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="Eliminar"
                severity="error"
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
