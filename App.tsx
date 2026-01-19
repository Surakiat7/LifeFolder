import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Pressable,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeroUINativeProvider } from 'heroui-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore, useUIStore } from './src/store';
import { COLORS } from './src/utils/constants';

// Import global styles for Uniwind/Tailwind
import './src/global.css';

// Confirm Modal Component
const ConfirmModal: React.FC = () => {
  const { isConfirmModalVisible, confirmModalConfig, hideConfirmModal } =
    useUIStore();

  if (!isConfirmModalVisible || !confirmModalConfig) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{confirmModalConfig.title}</Text>
        <Text style={styles.modalMessage}>{confirmModalConfig.message}</Text>
        <View style={styles.modalButtons}>
          <Pressable
            onPress={hideConfirmModal}
            style={[styles.modalButton, styles.cancelButton]}
          >
            <Text style={styles.cancelButtonText}>
              {confirmModalConfig.cancelText || 'Cancel'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              confirmModalConfig.onConfirm();
              hideConfirmModal();
            }}
            style={[
              styles.modalButton,
              styles.confirmButton,
              confirmModalConfig.isDestructive && styles.destructiveButton,
            ]}
          >
            <Text
              style={[
                styles.confirmButtonText,
                confirmModalConfig.isDestructive &&
                  styles.destructiveButtonText,
              ]}
            >
              {confirmModalConfig.confirmText || 'Confirm'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// Loading Overlay
const LoadingOverlay: React.FC = () => {
  const { isGlobalLoading, loadingMessage } = useUIStore();

  if (!isGlobalLoading) return null;

  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        {loadingMessage && (
          <Text style={styles.loadingMessage}>{loadingMessage}</Text>
        )}
      </View>
    </View>
  );
};

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app start
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <HeroUINativeProvider
          config={{
            toast: {
              defaultProps: {
                variant: 'accent',
                placement: 'bottom',
                isSwipeable: false,
              },
            },
          }}
        >
          <RootNavigator />
          <ConfirmModal />
          <LoadingOverlay />
          <StatusBar style='auto' />
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingMessage: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
