import { create } from 'zustand';

type DialogType = 'alert' | 'confirm';
type DialogVariant = 'default' | 'danger' | 'success';

interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions;
  resolvePromise: ((value: boolean) => void) | null;
  
  // Actions
  showDialog: (options: DialogOptions) => Promise<boolean>;
  confirm: () => void;
  cancel: () => void;
}

const defaultOptions: DialogOptions = {
  title: '',
  message: '',
  type: 'alert',
  variant: 'default',
  confirmText: 'OK',
  cancelText: 'Cancel'
};

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  options: defaultOptions,
  resolvePromise: null,

  showDialog: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: { ...defaultOptions, ...options },
        resolvePromise: resolve
      });
    });
  },

  confirm: () => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(true);
    set({ isOpen: false, resolvePromise: null });
  },

  cancel: () => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(false);
    set({ isOpen: false, resolvePromise: null });
  }
}));

// Helper functions for easy usage anywhere in the codebase
export const showConfirm = (title: string, message: string, variant: DialogVariant = 'danger', confirmText = 'Confirm') => {
  return useDialogStore.getState().showDialog({
    title,
    message,
    type: 'confirm',
    variant,
    confirmText
  });
};

export const showAlert = (title: string, message: string, variant: DialogVariant = 'default') => {
  return useDialogStore.getState().showDialog({
    title,
    message,
    type: 'alert',
    variant
  });
};
