import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    type SxProps,
    type Theme
} from '@mui/material';

import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import type { PagedResponse } from '@/shared/model/types';

export interface Column {
    id: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    width?: number | string;
    minWidth?: number | string;
}

interface SharedTableProps<T> {
    data?: PagedResponse<T>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    columns: Column[];
    keyExtractor: (item: T) => string | number;
    renderRow: (item: T) => React.ReactNode;
    emptyMessage?: string;
    containerSx?: SxProps<Theme>;
}

export function SharedTable<T>({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    columns,
    keyExtractor,
    renderRow,
    emptyMessage = "No se encontraron registros",
    containerSx
}: SharedTableProps<T>) {
    const theme = useTheme();

    return (
        <Paper sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column', 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1],
            flex: 1,
            minHeight: 0,
            ...containerSx
        }}>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell 
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ width: column.width, minWidth: column.minWidth }}
                                    sx={{ 
                                        backgroundColor: 'theme.palette.grey[100]',
                                        color: 'text.secondary', 
                                        fontWeight: 'bold', 
                                        textTransform: 'uppercase', 
                                        fontSize: '0.75rem' 
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((item) => (
                            <TableRow 
                                key={keyExtractor(item)} 
                                hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
                                {renderRow(item)}
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                component="div"
                count={data?.total || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage="Filas por página"
            />
        </Paper>
    );
}
