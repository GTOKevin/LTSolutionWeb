import { Box, Button, Typography, useTheme } from '@mui/material';
import { Edit as EditIcon, AddCircle as AddCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import React from 'react';

interface SubFormHeaderProps {
    isEditing: boolean;
    titleAdd: string;
    titleEdit: string;
    onCancel?: () => void;
    iconAdd?: React.ReactNode;
    iconEdit?: React.ReactNode;
}

export function SubFormHeader({
    isEditing,
    titleAdd,
    titleEdit,
    onCancel,
    iconAdd = <AddCircleIcon fontSize="small" />,
    iconEdit = <EditIcon fontSize="small" />
}: SubFormHeaderProps) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                    bgcolor: isEditing ? theme.palette.warning.main : theme.palette.primary.main, 
                    color: 'white', 
                    p: 0.5, 
                    borderRadius: '50%', 
                    display: 'flex' 
                }}>
                    {isEditing ? iconEdit : iconAdd}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {isEditing ? titleEdit : titleAdd}
                </Typography>
            </Box>
            {isEditing && onCancel && (
                <Button 
                    size="small" 
                    color="inherit" 
                    onClick={onCancel}
                    startIcon={<CancelIcon />}
                >
                    Cancelar Edición
                </Button>
            )}
        </Box>
    );
}
