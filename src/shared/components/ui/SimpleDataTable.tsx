import { Box, Paper, Typography, alpha, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

export interface SimpleDataTableColumn<T> {
    header: string;
    align?: 'left' | 'right' | 'center';
    render: (item: T) => ReactNode;
}

interface SimpleDataTableProps<T> {
    columns: SimpleDataTableColumn<T>[];
    rows: T[];
    rowKey: (item: T) => React.Key;
    emptyMessage?: string;
}

/**
 * Tabla de lectura simple (sin paginación ni acciones) para secciones embebidas.
 * Centraliza el markup de <Box component="table"> para evitar duplicación entre
 * secciones de detalle.
 */
export function SimpleDataTable<T>({ columns, rows, rowKey, emptyMessage }: SimpleDataTableProps<T>) {
    const theme = useTheme();

    if (rows.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {emptyMessage ?? 'No hay registros para mostrar.'}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: alpha(theme.palette.background.default, 0.7) }}>
                            {columns.map((column) => (
                                <Box
                                    component="th"
                                    key={column.header}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        typography: 'overline',
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                        letterSpacing: 1,
                                        textAlign: column.align ?? 'left',
                                    }}
                                >
                                    {column.header}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box component="tbody" sx={{ '& tr:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                        {rows.map((item) => (
                            <Box component="tr" key={rowKey(item)} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                                {columns.map((column) => (
                                    <Box
                                        component="td"
                                        key={column.header}
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            textAlign: column.align ?? 'left',
                                        }}
                                    >
                                        {column.render(item)}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}