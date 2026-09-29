import { useEffect, useRef } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { AsyncAutocomplete } from '@/shared/components/ui/AsyncAutocomplete';
import type { SelectItem } from '@/shared/model/types';
import { loadMercaderias, VIAJE_SELECT_KEYS } from '../options/hooks/useViajeResourceSearch';

/** Puente de lectura/escritura sobre el campo descripción destino del autofill. */
export interface MercaderiaDescriptionBinding {
    get: () => string;
    set: (value: string) => void;
}

export interface MercaderiaAutocompleteProps {
    value: number | null | undefined;
    onChange: (value: number) => void;
    /** Campo descripción que se autocompleta con el nombre de la mercadería. */
    description: MercaderiaDescriptionBinding;
    /**
     * Identidad del registro (p. ej. `field.id` de `useFieldArray`). Al cambiar,
     * se resetea el autofill interno para no arrastrar valores entre filas.
     */
    identityKey?: string | number;
    initialOptions?: SelectItem[];
    label?: string;
    ariaLabel?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    size?: 'small' | 'medium';
    sx?: SxProps<Theme>;
}

/**
 * Select async de mercaderías con autocompletado de descripción.
 *
 * Al seleccionar una mercadería completa el campo descripción con su nombre,
 * pero **no sobrescribe** una descripción editada manualmente: solo autocompleta
 * si el valor está vacío o coincide con el autogenerado previo.
 */
export function MercaderiaAutocomplete({
    value,
    onChange,
    description,
    identityKey,
    initialOptions,
    label = '',
    ariaLabel = 'Tipo de Mercadería',
    placeholder = 'Buscar mercadería...',
    required = false,
    disabled = false,
    error = false,
    helperText,
    size = 'small',
    sx,
}: MercaderiaAutocompleteProps) {
    const autoDescriptionRef = useRef('');

    useEffect(() => {
        autoDescriptionRef.current = '';
    }, [identityKey]);

    return (
        <AsyncAutocomplete
            resourceKey={VIAJE_SELECT_KEYS.mercaderias}
            label={label}
            ariaLabel={ariaLabel}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            size={size}
            sx={sx}
            value={value ?? 0}
            initialOptions={initialOptions}
            loadOptions={loadMercaderias}
            error={error}
            helperText={helperText}
            onChange={(selectedId, option) => {
                const text = option?.text ?? '';
                const currentDescription = description.get().trim();
                const previousAutoDescription = autoDescriptionRef.current.trim();
                const shouldAutofill =
                    currentDescription.length === 0 || currentDescription === previousAutoDescription;

                autoDescriptionRef.current = text;

                if (shouldAutofill) {
                    description.set(text);
                }

                onChange(selectedId);
            }}
        />
    );
}
