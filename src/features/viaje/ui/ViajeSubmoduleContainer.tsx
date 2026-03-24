import { Box, Alert, Paper, Typography, Collapse, IconButton, Button, useTheme, alpha } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Cancel as CancelIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState, useRef, useEffect, type ReactNode } from 'react';

interface ViajeSubmoduleContainerProps {
    viajeId?: number;
    viewOnly?: boolean;
    entityName: string; // e.g. "mercadería", "guías"
    titleAdd: string;
    titleEdit: string;
    isEditing: boolean;
    onCancelEdit?: () => void;
    renderForm: (onClose: () => void) => ReactNode;
    renderList: () => ReactNode;
}

export function ViajeSubmoduleContainer({
    viajeId,
    viewOnly,
    entityName,
    titleAdd,
    titleEdit,
    isEditing,
    onCancelEdit,
    renderForm,
    renderList
}: ViajeSubmoduleContainerProps) {
    const theme = useTheme();
    const [isFormExpanded, setIsFormExpanded] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing) {
            setIsFormExpanded(true);
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isEditing]);

    if (!viajeId && !viewOnly) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Debe guardar el viaje (información general) antes de registrar {entityName}.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!viewOnly && viajeId && (
                <Paper
                    ref={formRef}
                    elevation={0}
                    sx={{
                        p: 0,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.02),
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        onClick={() => {
                            if (isFormExpanded && isEditing && onCancelEdit) {
                                onCancelEdit();
                                setIsFormExpanded(false);
                            } else {
                                setIsFormExpanded((prev) => !prev);
                            }
                        }}
                        sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: isFormExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                                bgcolor: isEditing ? theme.palette.warning.main : theme.palette.primary.main, 
                                color: 'white', 
                                p: 0.5, 
                                borderRadius: '50%', 
                                display: 'flex' 
                            }}>
                                {isEditing ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                {isEditing ? titleEdit : titleAdd}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isEditing && onCancelEdit && (
                                <Button 
                                    size="small" 
                                    color="inherit" 
                                    startIcon={<CancelIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCancelEdit();
                                        setIsFormExpanded(false);
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsFormExpanded((prev) => !prev);
                                }}
                            >
                                {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>
                    <Collapse in={isFormExpanded} unmountOnExit>
                        <Box sx={{ p: 0 }}>
                            {renderForm(() => setIsFormExpanded(false))}
                        </Box>
                    </Collapse>
                </Paper>
            )}
            {viajeId && renderList()}
        </Box>
    );
}