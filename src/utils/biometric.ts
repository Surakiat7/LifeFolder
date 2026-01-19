import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEYS } from './constants';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Check if device supports biometric authentication
 */
export const isBiometricSupported = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
};

/**
 * Check if biometric authentication is enrolled (user has set up biometrics)
 */
export const isBiometricEnrolled = async (): Promise<boolean> => {
  try {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric enrollment:', error);
    return false;
  }
};

/**
 * Get available authentication types
 */
export const getAvailableAuthTypes = async (): Promise<BiometricType[]> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return types.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'facial';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'iris';
        default:
          return 'none';
      }
    });
  } catch (error) {
    console.error('Error getting auth types:', error);
    return [];
  }
};

/**
 * Get biometric type label for display
 */
export const getBiometricTypeLabel = async (): Promise<string> => {
  const types = await getAvailableAuthTypes();
  
  if (types.includes('facial')) {
    return 'Face ID';
  }
  if (types.includes('fingerprint')) {
    return 'Touch ID';
  }
  if (types.includes('iris')) {
    return 'Iris';
  }
  
  return 'Biometric';
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometrics = async (
  promptMessage?: string
): Promise<BiometricResult> => {
  try {
    const isSupported = await isBiometricSupported();
    
    if (!isSupported) {
      return {
        success: false,
        error: 'Biometric authentication is not supported on this device',
      };
    }

    const isEnrolled = await isBiometricEnrolled();
    
    if (!isEnrolled) {
      return {
        success: false,
        error: 'No biometric authentication methods are enrolled',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || 'Authenticate to access LifeFolder',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    }

    // Handle different error types
    if (result.error === 'user_cancel') {
      return {
        success: false,
        error: 'Authentication cancelled',
      };
    }

    if (result.error === 'user_fallback') {
      return {
        success: false,
        error: 'User chose to use passcode',
      };
    }

    if (result.error === 'lockout') {
      return {
        success: false,
        error: 'Too many failed attempts. Please try again later.',
      };
    }

    return {
      success: false,
      error: result.error || 'Authentication failed',
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: 'An error occurred during authentication',
    };
  }
};

/**
 * Check if biometric lock is enabled in app settings
 */
export const isBiometricLockEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(SECURE_STORE_KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  } catch (error) {
    console.error('Error reading biometric setting:', error);
    return false;
  }
};

/**
 * Enable or disable biometric lock
 */
export const setBiometricLockEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.BIOMETRIC_ENABLED,
      enabled ? 'true' : 'false'
    );
  } catch (error) {
    console.error('Error saving biometric setting:', error);
    throw error;
  }
};

/**
 * Full biometric check - checks if enabled and authenticates
 */
export const performBiometricCheck = async (): Promise<BiometricResult> => {
  const isEnabled = await isBiometricLockEnabled();
  
  if (!isEnabled) {
    return { success: true }; // Skip if not enabled
  }
  
  return await authenticateWithBiometrics();
};
