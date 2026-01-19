import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive: boolean;
}

interface UIState {
  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Modal states
  isUploadModalVisible: boolean;
  isFilterModalVisible: boolean;
  isConfirmModalVisible: boolean;
  confirmModalConfig: ConfirmModalConfig | null;

  // Toast notifications
  toasts: Toast[];

  // Bottom sheet
  isBottomSheetVisible: boolean;
  bottomSheetContent: React.ReactNode | null;

  // Search
  isSearchActive: boolean;
  searchQuery: string;

  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  showUploadModal: () => void;
  hideUploadModal: () => void;
  showFilterModal: () => void;
  hideFilterModal: () => void;
  showConfirmModal: (config: Omit<ConfirmModalConfig, 'onCancel'> & { onCancel?: () => void }) => void;
  hideConfirmModal: () => void;
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  showBottomSheet: (content: React.ReactNode) => void;
  hideBottomSheet: () => void;
  setSearchActive: (active: boolean) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isGlobalLoading: false,
  loadingMessage: null,
  isUploadModalVisible: false,
  isFilterModalVisible: false,
  isConfirmModalVisible: false,
  confirmModalConfig: null,
  toasts: [],
  isBottomSheetVisible: false,
  bottomSheetContent: null,
  isSearchActive: false,
  searchQuery: '',

  // Set global loading
  setGlobalLoading: (loading, message) => {
    set({
      isGlobalLoading: loading,
      loadingMessage: message || null,
    });
  },

  // Upload modal
  showUploadModal: () => {
    set({ isUploadModalVisible: true });
  },

  hideUploadModal: () => {
    set({ isUploadModalVisible: false });
  },

  // Filter modal
  showFilterModal: () => {
    set({ isFilterModalVisible: true });
  },

  hideFilterModal: () => {
    set({ isFilterModalVisible: false });
  },

  // Confirm modal
  showConfirmModal: (config) => {
    set({
      isConfirmModalVisible: true,
      confirmModalConfig: {
        ...config,
        onCancel: config.onCancel || (() => get().hideConfirmModal()),
        isDestructive: config.isDestructive ?? false,
      },
    });
  },

  hideConfirmModal: () => {
    set({
      isConfirmModalVisible: false,
      confirmModalConfig: null,
    });
  },

  // Toast notifications
  showToast: (type, message, duration = 3000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, type, message, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, duration);
    }
  },

  hideToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Bottom sheet
  showBottomSheet: (content) => {
    set({
      isBottomSheetVisible: true,
      bottomSheetContent: content,
    });
  },

  hideBottomSheet: () => {
    set({
      isBottomSheetVisible: false,
      bottomSheetContent: null,
    });
  },

  // Search
  setSearchActive: (active) => {
    set({ isSearchActive: active });
    if (!active) {
      set({ searchQuery: '' });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Reset
  reset: () => {
    set({
      isGlobalLoading: false,
      loadingMessage: null,
      isUploadModalVisible: false,
      isFilterModalVisible: false,
      isConfirmModalVisible: false,
      confirmModalConfig: null,
      toasts: [],
      isBottomSheetVisible: false,
      bottomSheetContent: null,
      isSearchActive: false,
      searchQuery: '',
    });
  },
}));
