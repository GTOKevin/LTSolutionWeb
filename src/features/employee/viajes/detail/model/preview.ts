export interface EmployeeViajeDocumentPreviewState {
    previewUrl: string | null;
    previewUrls: string[];
    currentIndex: number;
    title: string;
}

export const closedEmployeeViajeDocumentPreviewState: EmployeeViajeDocumentPreviewState = {
    previewUrl: null,
    previewUrls: [],
    currentIndex: 0,
    title: 'Vista previa',
};
