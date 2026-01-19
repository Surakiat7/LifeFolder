import { useToast } from 'heroui-native';

type ToastVariant = 'success' | 'danger' | 'warning' | 'default' | 'accent';

export const useAppToast = () => {
  const { toast } = useToast();

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    description?: string
  ) => {
    const variantMap: Record<string, ToastVariant> = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'accent',
    };

    toast.show({
      variant: variantMap[type],
      label: message,
      description: description,
      placement: 'top',
    });
  };

  const showSuccess = (message: string, description?: string) => {
    showToast('success', message, description);
  };

  const showError = (message: string, description?: string) => {
    showToast('error', message, description);
  };

  const showWarning = (message: string, description?: string) => {
    showToast('warning', message, description);
  };

  const showInfo = (message: string, description?: string) => {
    showToast('info', message, description);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toast,
  };
};

export default useAppToast;
