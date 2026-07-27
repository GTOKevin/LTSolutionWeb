import { Box, Chip, TableCell, Typography } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { SharedTable } from '@shared/components/ui/SharedTable';
import { TableActions } from '@shared/components/ui/TableActions';
import type { ClienteContacto } from '@entities/cliente/model/types';
import type { ClienteContactosController } from '../hooks/useClienteContactosController';

interface ClienteContactosDataViewProps {
    controller: ClienteContactosController;
    viewOnly?: boolean;
}

export function ClienteContactosDataView({ controller, viewOnly = false }: ClienteContactosDataViewProps) {
    const {
        data,
        isLoading,
        page,
        rowsPerPage,
        setPage,
        handleRowsPerPageChange,
        handleEdit,
        handleDeleteRequest,
    } = controller;

    return (
        <Box sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
            <MobileListShell
                items={data?.items || []}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, currentPage) => setPage(currentPage)}
                onRowsPerPageChange={handleRowsPerPageChange}
                emptyMessage="No hay contactos registrados."
                keyExtractor={(item) => item.clienteContactoID}
                viewOnly={viewOnly}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                renderHeader={(contacto) => (
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {contacto.nombreCompleto}
                        </Typography>
                        {contacto.rol ? (
                            <Chip label={contacto.rol} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                        ) : null}
                        {!contacto.activo ? (
                            <Chip label="Inactivo" size="small" color="error" sx={{ height: 20, fontSize: 10 }} />
                        ) : null}
                    </Box>
                )}
                renderBody={(contacto) => (
                    <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            <PersonIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            {contacto.telefonoPrincipal} • {contacto.email || 'Sin email'}
                        </Typography>
                    </Box>
                )}
            />

            <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 2 }}>
                <SharedTable<ClienteContacto>
                    columns={[
                        { id: 'nombreCompleto', label: 'Nombre Completo' },
                        { id: 'rol', label: 'Rol / Cargo' },
                        { id: 'telefonoPrincipal', label: 'Telefono' },
                        { id: 'email', label: 'Email' },
                        { id: 'activo', label: 'Estado', align: 'center' },
                        ...(!viewOnly ? [{ id: 'acciones', label: 'Acciones', align: 'right' as const }] : []),
                    ]}
                    data={data}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, currentPage) => setPage(currentPage)}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.clienteContactoID}
                    renderRow={(item) => (
                        <>
                            <TableCell>
                                <Typography variant="body2" fontWeight={500}>{item.nombreCompleto}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">{item.rol || '-'}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">{item.telefonoPrincipal}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">{item.email || '-'}</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={item.activo ? 'Activo' : 'Inactivo'}
                                    size="small"
                                    color={item.activo ? 'success' : 'error'}
                                    sx={{ height: 24 }}
                                />
                            </TableCell>
                            {!viewOnly ? (
                                <TableCell align="right">
                                    <TableActions
                                        onEdit={() => handleEdit(item)}
                                        onDelete={() => handleDeleteRequest(item)}
                                    />
                                </TableCell>
                            ) : null}
                        </>
                    )}
                />
            </Box>
        </Box>
    );
}
