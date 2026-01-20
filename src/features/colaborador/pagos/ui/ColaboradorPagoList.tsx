import {
    Box,
    Typography,
    Button,
    useTheme,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Snackbar,
    Alert,
    TablePagination,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colaboradorPagoApi } from '@entities/colaborador-pago/api/colaborador-pago.api';
import type { ColaboradorPago } from '@entities/colaborador-pago/model/types';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { useState } from 'react';
import { ColaboradorPagoForm } from './ColaboradorPagoForm';
import { formatDateShort } from '@/shared/utils/date-utils';

interface ColaboradorPagoListProps {
    colaboradorId: number;
    viewOnly?: boolean;
}

export function ColaboradorPagoList({ colaboradorId, viewOnly = false }: ColaboradorPagoListProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [openForm, setOpenForm] = useState(false);
    const [pagoToEdit, setPagoToEdit] = useState<ColaboradorPago | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [pagoToDelete, setPagoToDelete] = useState<ColaboradorPago | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading } = useQuery({
        queryKey: ['colaborador-pagos', colaboradorId, page, rowsPerPage],
        queryFn: () => colaboradorPagoApi.getAll({ 
            colaboradorID: colaboradorId, 
            page: page + 1, 
            size: rowsPerPage 
        })
    });

    const items = data?.data?.items || [];
    const totalItems = data?.data?.total || 0;

    const deleteMutation = useMutation({
        mutationFn: (id: number) => colaboradorPagoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colaborador-pagos', colaboradorId] });
            setOpenDelete(false);
            setPagoToDelete(null);
        },
        onError: () => {
            setErrorMessage('Error al eliminar el pago');
            setOpenSnackbar(true);
        }
    });

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setPagoToEdit(null);
        setOpenForm(true);
    };

    const handleEdit = (pago: ColaboradorPago) => {
        setPagoToEdit(pago);
        setOpenForm(true);
    };

    const handleDelete = (pago: ColaboradorPago) => {
        setPagoToDelete(pago);
        setOpenDelete(true);
    };

    const formatMoney = (amount: number, symbol?: string) => {
        return `${symbol || ''} ${amount.toFixed(2)}`;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    Historial de Pagos
                </Typography>
                {!viewOnly && (
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        onClick={handleCreate}
                    >
                        Registrar Pago
                    </Button>
                )}
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {isLoading ? (
                    <Box p={3} textAlign="center">Cargando pagos...</Box>
                ) : items.length === 0 ? (
                    <Box 
                        p={5} 
                        textAlign="center" 
                        color="text.secondary"
                        sx={{ 
                            border: `1px dashed ${theme.palette.divider}`,
                            borderRadius: 2,
                            bgcolor: theme.palette.action.hover
                        }}
                    >
                        <Typography variant="body1">No hay pagos registrados.</Typography>
                        {!viewOnly && <Typography variant="caption">Haga clic en "Registrar Pago" para comenzar.</Typography>}
                    </Box>
                ) : (
                    items.map((pago) => (
                        <ListItem 
                            key={pago.colaboradorPagoID} 
                            divider
                            sx={{ 
                                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.05)' },
                                borderRadius: 1,
                                mb: 1,
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Box mr={2}>
                                <Box 
                                    color="success.main" 
                                    sx={{ 
                                        p: 1, 
                                        border: `1px solid ${theme.palette.divider}`, 
                                        borderRadius: 1,
                                        bgcolor: 'success.lighter' 
                                    }}
                                >
                                    <PaymentIcon fontSize="large" />
                                </Box>
                            </Box>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {pago.tipoPago?.nombre || 'Pago'}
                                        </Typography>
                                        <Chip 
                                            label={formatMoney(pago.monto, pago.moneda?.simbolo)} 
                                            size="small" 
                                            color="success" 
                                            variant="outlined" 
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="body2" component="span" color="text.primary">
                                            Periodo: {formatDateShort(pago.fechaInico)} - {formatDateShort(pago.fechaCierre)}
                                        </Typography>
                                        {pago.observaciones && (
                                            <Typography variant="caption" component="span" color="text.secondary">
                                                Nota: {pago.observaciones}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            <ListItemSecondaryAction>
                                {!viewOnly && (
                                    <>
                                        <IconButton size="small" color='primary' onClick={() => handleEdit(pago)} sx={{ mr: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(pago)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))
                )}
            </List>

            <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />

            <ColaboradorPagoForm 
                open={openForm}
                onClose={() => setOpenForm(false)}
                colaboradorId={colaboradorId}
                pagoToEdit={pagoToEdit}
            />

            <ConfirmDialog
                open={openDelete}
                title="Eliminar Pago"
                content={`¿Está seguro que desea eliminar este registro de pago?`}
                onClose={() => setOpenDelete(false)}
                onConfirm={() => pagoToDelete && deleteMutation.mutate(pagoToDelete.colaboradorPagoID)}
                isLoading={deleteMutation.isPending}
            />

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
