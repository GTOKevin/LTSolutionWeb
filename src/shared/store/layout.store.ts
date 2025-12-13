import { create } from 'zustand';

interface LayoutState {
    sidebarOpen: boolean;
    pageTitle: string;

    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setPageTitle: (title: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    sidebarOpen: true,
    pageTitle: 'Logística y Transporte',

    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setPageTitle: (title: string) => set({ pageTitle: title }),
}));
