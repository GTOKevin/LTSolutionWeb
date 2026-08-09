export interface EmployeeViajeDocumentPreviewState {
    previewUrl: string | null;
    title: string;
}

export const closedEmployeeViajeDocumentPreviewState: EmployeeViajeDocumentPreviewState = {
    previewUrl: null,
    title: 'Vista previa',
};
