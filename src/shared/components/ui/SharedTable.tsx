import React, { useRef } from 'react';
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
import { useVirtualizer } from '@tanstack/react-virtual';

import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import type { PagedResponse } from '@/shared/model/types';
import { TableLoading } from './TableLoading';

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
    rowHeight?: number; // Optional row height for virtualization
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
    containerSx,
    rowHeight = 53
}: SharedTableProps<T>) {
    const theme = useTheme();
    const parentRef = useRef<HTMLDivElement>(null);
    const items = data?.items || [];

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 5,
    });

    return (
        <Paper sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column', 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1],
            ...containerSx
        }}>
            <TableContainer ref={parentRef} sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader style={{ tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell 
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ width: column.width, minWidth: column.minWidth }}
                                    sx={{ 
                                        backgroundColor: theme.palette.grey[100],
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
                    <TableBody 
                        style={{ 
                            height: isLoading || items.length === 0 ? 'auto' : `${rowVirtualizer.getTotalSize()}px`, 
                            position: 'relative' 
                        }}
                    >
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ p: 0 }}>
                                    <TableLoading />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const item = items[virtualRow.index];
                                return (
                                    <TableRow 
                                        key={keyExtractor(item)} 
                                        hover
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`
                                        }}
                                        sx={{ 
                                            '&:hover .actions-group': { opacity: 1 },
                                            cursor: 'pointer',
                                            display: 'flex', // Necesario para que las celdas se alineen en absolute
                                            alignItems: 'center'
                                        }}
                                    >
                                        {renderRow(item)}
                                    </TableRow>
                                );
                            })
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
