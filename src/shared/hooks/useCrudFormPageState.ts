import { useCallback, useState } from 'react';

type CreateSuccessBehavior = 'keep_open' | 'close' | 'delegate';

interface UseCrudFormPageStateOptions {
    entityId?: number | null;
    onSuccess: (id: number) => void;
    onClose: () => void;
    initialTab?: number;
    detailsTabIndex?: number;
    keepOpenAfterCreate?: boolean;
    createSuccessBehavior?: CreateSuccessBehavior;
    onCreateSuccess?: (id: number) => void;
}

export function useCrudFormPageState({
    entityId,
    onSuccess,
    onClose,
    initialTab = 0,
    detailsTabIndex = 1,
    keepOpenAfterCreate = true,
    createSuccessBehavior,
    onCreateSuccess,
}: UseCrudFormPageStateOptions) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const resolvedCreateSuccessBehavior = createSuccessBehavior ?? (keepOpenAfterCreate ? 'keep_open' : 'close');

    const isEdit = typeof entityId === 'number' && entityId > 0;
    const effectiveId = entityId ?? createdId;
    const canEditDetails = typeof effectiveId === 'number' && effectiveId > 0;

    const resetUiState = useCallback(() => {
        const resetUiTimer = window.setTimeout(() => {
            setActiveTab(initialTab);
            setCreatedId(null);
            setErrorMessage(null);
        }, 0);

        return () => {
            window.clearTimeout(resetUiTimer);
        };
    }, [initialTab]);

    const handleMutationSuccess = useCallback((id: number) => {
        onSuccess(id);

        if (!isEdit && !createdId) {
            if (resolvedCreateSuccessBehavior === 'keep_open') {
                setCreatedId(id);
                setActiveTab(detailsTabIndex);
                return;
            }

            if (resolvedCreateSuccessBehavior === 'delegate') {
                onCreateSuccess?.(id);
                return;
            }
        }

        onClose();
    }, [createdId, detailsTabIndex, isEdit, onClose, onCreateSuccess, onSuccess, resolvedCreateSuccessBehavior]);

    return {
        activeTab,
        setActiveTab,
        createdId,
        errorMessage,
        setErrorMessage,
        effectiveId,
        canEditDetails,
        isEdit,
        resetUiState,
        handleMutationSuccess,
    };
}
