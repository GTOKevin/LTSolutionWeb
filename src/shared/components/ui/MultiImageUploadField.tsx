import { AddCircleOutline as AddCircleOutlineIcon, DeleteOutline as DeleteOutlineIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { ImageUpload } from './ImageUpload';

interface MultiImageUploadFieldProps {
    values: string[];
    onChange: (values: string[]) => void;
    disabled?: boolean;
    helperText?: string;
    folder?: string;
    minItems?: number;
}

export function MultiImageUploadField({
    values,
    onChange,
    disabled = false,
    helperText,
    folder = 'general',
    minItems = 1,
}: MultiImageUploadFieldProps) {
    const normalizedValues = values.length > 0 ? values : Array.from({ length: minItems }, () => '');

    const handleSlotChange = (index: number, nextValue: string) => {
        const nextItems = [...normalizedValues];
        nextItems[index] = nextValue;
        onChange(nextItems.filter((item, itemIndex) => item.trim() || itemIndex < minItems));
    };

    const handleAddSlot = () => {
        onChange([...normalizedValues, '']);
    };

    const handleRemoveSlot = (index: number) => {
        if (normalizedValues.length <= minItems) {
            onChange(normalizedValues.map((item, itemIndex) => (itemIndex === index ? '' : item)));
            return;
        }

        onChange(normalizedValues.filter((_, itemIndex) => itemIndex !== index));
    };

    return (
        <Stack spacing={2}>
            {normalizedValues.map((value, index) => (
                <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2 }}>
                    <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                Evidencia {index + 1}
                            </Typography>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveSlot(index)}
                                disabled={disabled}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <ImageUpload
                            value={value || undefined}
                            onChange={(nextValue) => handleSlotChange(index, nextValue)}
                            helperText={helperText}
                            disabled={disabled}
                            folder={folder}
                        />
                    </Stack>
                </Box>
            ))}

            <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddSlot}
                disabled={disabled}
            >
                Agregar imagen
            </Button>
        </Stack>
    );
}
