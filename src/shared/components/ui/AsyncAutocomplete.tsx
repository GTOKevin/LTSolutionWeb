import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Fade,
  LinearProgress,
  Paper,
  Skeleton,
  TextField,
  Typography,
  alpha,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  Search as SearchIcon,
  SearchOff as SearchOffIcon,
  Check as CheckIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { SelectOption } from '@/shared/model/types';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { useToast } from '@/shared/components/ui/Toast';
import { cacheSelectItem, getCachedSelectItem } from '@/shared/lib/select-item-cache';
import { ASYNC_AUTOCOMPLETE_QUERY_KEYS } from '@/shared/lib/async-autocomplete-keys';

/**
 * Opción mostrada por el autocomplete. Compatible con `SelectItem` (id numérico)
 * y `SelectStringItem` (id string) del modelo compartido.
 */
export type AsyncAutocompleteOption<TId extends string | number = number> = SelectOption<TId>;

export interface AsyncAutocompleteProps<TId extends string | number = number> {
  /** Clave estable del catálogo (namespace de React Query y del cache de labels). */
  resourceKey: string;
  label: string;
  value: TId | null | undefined;
  onChange: (value: TId, option: AsyncAutocompleteOption<TId> | null) => void;
  /** Cargador de opciones paginado por texto. */
  loadOptions: (search: string) => Promise<AsyncAutocompleteOption<TId>[]>;
  /** Opciones preexistentes para mostrar antes de la primera consulta. */
  initialOptions?: AsyncAutocompleteOption<TId>[];
  placeholder?: string;
  /** Nombre accesible del input cuando la etiqueta visible se renderiza fuera del control (F8). */
  ariaLabel?: string;
  error?: boolean;
  helperText?: string;
  /** Mensaje mostrado cuando falla la carga de opciones (F1). */
  errorText?: string;
  /** Callback invocado cuando la consulta de opciones falla (F1). */
  onError?: (error: unknown) => void;
  /** Muestra un toast con el error de carga (se deduplica por mensaje). Por defecto true (F1). */
  showErrorToast?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  /** Mínimo de caracteres antes de consultar (0 = consulta al abrir). */
  minChars?: number;
  noOptionsText?: string;
  /** Muestra el icono de búsqueda al inicio del input con micro-animación. */
  showSearchIcon?: boolean;
  /** Valor emitido al limpiar la selección. Por defecto `0`. */
  emptyValue?: TId;
  sx?: SxProps<Theme>;
}

const DEFAULT_LOAD_ERROR_MESSAGE = 'No se pudieron cargar las opciones. Intente nuevamente.';

/**
 * Contexto que comparte el estado de carga con el dropdown (PaperComponent).
 * Permite mantener una identidad estable del Paper (F2) sin perder el
 * indicador de "cargando nuevos resultados" (F7).
 */
const AsyncAutocompleteLoadingContext = createContext(false);

/**
 * Dropdown de identidad estable (definido fuera del render). Al no depender de
 * props que cambian en cada tecla, React no lo desmonta/monta en cada render (F2).
 */
function AsyncAutocompleteDropdown({ children, ...paperProps }: HTMLAttributes<HTMLElement>) {
  const isFetching = useContext(AsyncAutocompleteLoadingContext);

  return (
    <Paper
      {...paperProps}
      elevation={6}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.4)'
            : '0 14px 34px -4px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(12px)',
        animation: 'asyncDropdownSlide 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'top center',
        '& .MuiAutocomplete-listbox': {
          p: 0.75,
          // F7: atenúa el set previo (keepPreviousData) mientras llegan resultados nuevos.
          opacity: isFetching ? 0.55 : 1,
          transition: 'opacity 0.18s ease',
          '& .MuiAutocomplete-option': {
            borderRadius: 1.5,
            my: 0.25,
            px: 1.25,
            py: 0.85,
            transition:
              'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s ease',
            '&:hover': {
              transform: 'translateX(4px)',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
            '&[aria-selected="true"]': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              fontWeight: 600,
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
              },
            },
            '&.Mui-focused': {
              bgcolor: (theme) => alpha(theme.palette.action.focus, 0.18),
              transform: 'translateX(4px)',
            },
          },
        },
      }}
    >
      {isFetching && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2.5,
            zIndex: 5,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            },
          }}
        />
      )}
      {children}
    </Paper>
  );
}

function highlightMatch(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Box
            key={index}
            component="span"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              borderRadius: '3px',
              px: 0.35,
              py: 0.05,
              transition: 'background-color 0.18s ease',
            }}
          >
            {part}
          </Box>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}


export function AsyncAutocomplete<TId extends string | number = number>({
  resourceKey,
  label,
  value,
  onChange,
  loadOptions,
  initialOptions,
  placeholder,
  ariaLabel,
  error = false,
  helperText,
  errorText,
  onError,
  showErrorToast = true,
  disabled = false,
  required = false,
  size = 'small',
  minChars = 0,
  noOptionsText,
  showSearchIcon = true,
  emptyValue,
  sx,
}: AsyncAutocompleteProps<TId>) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText.trim(), 300);

  const resolvedEmptyValue = (emptyValue ?? 0) as unknown as TId;

  const { showToast } = useToast();
  const onErrorRef = useRef(onError);
  const notifiedErrorRef = useRef<string | null>(null);

  const canQuery = open && debouncedSearch.length >= minChars;

  const { data, isFetching, isError, error: queryError, refetch } = useQuery({
    queryKey: ASYNC_AUTOCOMPLETE_QUERY_KEYS.resource(resourceKey, debouncedSearch),
    queryFn: () => loadOptions(debouncedSearch),
    enabled: canQuery,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const resolvedLoadErrorMessage =
    errorText ?? getErrorMessage(queryError, DEFAULT_LOAD_ERROR_MESSAGE);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!isError) {
      notifiedErrorRef.current = null;
      return;
    }

    onErrorRef.current?.(queryError);

    if (!showErrorToast || notifiedErrorRef.current === resolvedLoadErrorMessage) return;

    notifiedErrorRef.current = resolvedLoadErrorMessage;
    showToast({
      title: 'Error al buscar opciones',
      message: resolvedLoadErrorMessage,
      severity: 'error',
    });
  }, [isError, queryError, showErrorToast, resolvedLoadErrorMessage, showToast]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return (
      (data ?? initialOptions ?? []).find((item) => item.id === value) ??
      getCachedSelectItem<TId>(resourceKey, value)
    );
  }, [data, initialOptions, value, resourceKey]);

  const options = useMemo(() => {
    const base = data ?? initialOptions ?? [];
    if (selectedOption && !base.some((item) => item.id === selectedOption.id)) {
      return [selectedOption, ...base];
    }
    return base;
  }, [data, initialOptions, selectedOption]);

  const displayedInputValue = open ? searchText : (selectedOption?.text ?? '');

  const resolvedNoOptionsText =
    noOptionsText ??
    (isError
      ? resolvedLoadErrorMessage
      : debouncedSearch.length < minChars
        ? `Escriba al menos ${minChars} caracteres...`
        : 'Sin resultados');

  return (
    <AsyncAutocompleteLoadingContext.Provider value={isFetching}>
      <Autocomplete
      sx={[
        {
          // Transición suave en el borde y anillo de foco
          '& .MuiOutlinedInput-root': {
            transition:
              'box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, background-color 0.2s ease',
            '&:hover:not(.Mui-focused):not(.Mui-disabled)': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => alpha(theme.palette.text.primary, 0.35),
              },
            },
            '&.Mui-focused': {
              boxShadow: (theme) => `0 0 0 3.5px ${alpha(theme.palette.primary.main, 0.14)}`,
            },
          },
          // Micro-interacción del botón chevron (flecha del dropdown)
          '& .MuiAutocomplete-popupIndicator': {
            transition:
              'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.18s ease, color 0.18s ease',
            '&:hover': {
              transform: 'scale(1.15)',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
            },
            '&.MuiAutocomplete-popupIndicatorOpen': {
              transform: 'rotate(180deg) scale(1.05)',
              color: 'primary.main',
            },
          },
          // Micro-interacción del botón limpiar (X)
          '& .MuiAutocomplete-clearIndicator': {
            transition:
              'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.18s ease, color 0.18s ease',
            '&:hover': {
              transform: 'scale(1.18) rotate(90deg)',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              color: 'error.main',
            },
          },
          // Keyframes integrados
          '@keyframes asyncDropdownSlide': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-8px) scale(0.985)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            },
          },
          '@keyframes checkPop': {
            '0%': {
              transform: 'scale(0.3)',
              opacity: 0,
            },
            '70%': {
              transform: 'scale(1.25)',
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
          '@keyframes asyncFadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(4px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
          '@keyframes emptyFloat': {
            '0%, 100%': {
              transform: 'translateY(0)',
            },
            '50%': {
              transform: 'translateY(-4px)',
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      fullWidth
      open={open}
      onOpen={() => {
        setOpen(true);
        setSearchText(selectedOption?.text ?? '');
      }}
      onClose={() => setOpen(false)}
      options={options}
      value={selectedOption}
      disabled={disabled}
      loading={isFetching}
      getOptionLabel={(option) => option.text}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      filterOptions={(filtered) => filtered}
      inputValue={displayedInputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'reset') return;
        setSearchText(handleSanitizeSearchInput(newInputValue));
      }}
      onChange={(_, newValue) => {
        cacheSelectItem(resourceKey, newValue);
        setSearchText(newValue?.text ?? '');
        onChange(newValue?.id ?? resolvedEmptyValue, newValue);
      }}
      PaperComponent={AsyncAutocompleteDropdown}
      renderOption={(props, option, { selected }) => {
        const { key, ...otherProps } = props;
        return (
          <li
            key={key ?? option.id}
            {...otherProps}
            style={{
              ...otherProps.style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: selected ? 600 : 400,
                  color: selected ? 'primary.main' : 'text.primary',
                  transition: 'color 0.15s ease',
                }}
              >
                {highlightMatch(option.text, debouncedSearch)}
              </Typography>
            </Box>

            {selected && (
              <Fade in={selected} timeout={200}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.main',
                    ml: 1,
                    flexShrink: 0,
                    animation: 'checkPop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 13, strokeWidth: 1.5 }} />
                </Box>
              </Fade>
            )}
          </li>
        );
      }}
      loadingText={
        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.2,
            animation: 'asyncFadeIn 0.2s ease-out',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 0.5, py: 0.25 }}>
            <CircularProgress size={15} thickness={4.5} sx={{ color: 'primary.main' }} />
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.02em' }}
            >
              Buscando opciones...
            </Typography>
          </Box>
          <Skeleton
            variant="rounded"
            height={32}
            sx={{
              borderRadius: 1.5,
              animationDuration: '0.9s',
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
            }}
          />
          <Skeleton
            variant="rounded"
            height={32}
            sx={{
              width: '82%',
              borderRadius: 1.5,
              animationDuration: '0.9s',
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
            }}
          />
          <Skeleton
            variant="rounded"
            height={32}
            sx={{
              width: '64%',
              borderRadius: 1.5,
              animationDuration: '0.9s',
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
            }}
          />
        </Box>
      }
      noOptionsText={
        isError ? (
          <Box
            sx={{
              py: 3,
              px: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              animation: 'asyncFadeIn 0.25s ease-out',
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                fontWeight: 500,
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              {resolvedLoadErrorMessage}
            </Typography>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                void refetch();
              }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Reintentar
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              py: 3,
              px: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              animation: 'asyncFadeIn 0.25s ease-out',
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'emptyFloat 2.5s ease-in-out infinite',
              }}
            >
              <SearchOffIcon sx={{ fontSize: 22, opacity: 0.8 }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              {resolvedNoOptionsText}
            </Typography>
          </Box>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            'aria-label': ariaLabel ?? (label || undefined),
          }}
          label={label}
          placeholder={placeholder}
          size={size}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {showSearchIcon && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pl: 0.5,
                      pr: 0.75,
                      color: open ? 'primary.main' : 'text.disabled',
                      transition:
                        'color 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: open ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <SearchIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
                  </Box>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                <Fade in={isFetching} unmountOnExit timeout={200}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 0.5,
                    }}
                  >
                    <CircularProgress
                      color="primary"
                      size={size === 'small' ? 16 : 18}
                      thickness={4.5}
                    />
                  </Box>
                </Fade>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      />
    </AsyncAutocompleteLoadingContext.Provider>
  );
}
