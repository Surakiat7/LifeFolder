import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppToast } from '../../hooks/useAppToast';
import { SettingsStackParamList } from '../../navigation/AppNavigator';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { 
  isBiometricSupported,
  isBiometricEnrolled, 
  getBiometricTypeLabel, 
  authenticateWithBiometrics,
  isBiometricLockEnabled,
  setBiometricLockEnabled,
} from '../../utils/biometric';

type SecuritySettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList, typeof SCREENS.SECURITY_SETTINGS>;

const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<SecuritySettingsNavigationProp>();
  const { showSuccess, showError, showInfo } = useAppToast();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    setIsLoading(true);
    try {
      const supported = await isBiometricSupported();
      const enrolled = supported ? await isBiometricEnrolled() : false;
      const available = supported && enrolled;
      setBiometricAvailable(available);
      
      if (available) {
        const type = await getBiometricTypeLabel();
        setBiometricType(type);
        
        const enabled = await isBiometricLockEnabled();
        setBiometricEnabledState(enabled);
      }
    } catch (error) {
      console.error('Error checking biometrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (!biometricAvailable) {
      showError('Biometric authentication is not available on this device');
      return;
    }

    setIsToggling(true);

    if (value) {
      // Enabling biometric - authenticate first
      const result = await authenticateWithBiometrics(`Enable ${biometricType}`);
      if (result.success) {
        await setBiometricLockEnabled(true);
        setBiometricEnabledState(true);
        showSuccess(`${biometricType} enabled`);
      } else {
        showError('Authentication failed');
      }
    } else {
      // Disabling biometric - authenticate first to confirm
      const result = await authenticateWithBiometrics(`Disable ${biometricType}`);
      if (result.success) {
        await setBiometricLockEnabled(false);
        setBiometricEnabledState(false);
        showInfo(`${biometricType} disabled`);
      } else {
        showError('Authentication failed');
      }
    }

    setIsToggling(false);
  };

  const handleTestBiometric = async () => {
    if (!biometricAvailable) {
      showError('Biometric authentication is not available');
      return;
    }

    const result = await authenticateWithBiometrics('Test authentication');
    if (result.success) {
      showSuccess('Authentication successful!');
    } else {
      showError('Authentication failed');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Security Header */}
        <View style={styles.securityHeader}>
          <View style={styles.securityIcon}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.securityTitle}>App Security</Text>
          <Text style={styles.securitySubtitle}>
            Protect your documents with biometric authentication
          </Text>
        </View>

        {/* Biometric Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Authentication</Text>
          <View style={styles.sectionContent}>
            {/* Biometric Toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons 
                  name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'} 
                  size={22} 
                  color={biometricAvailable ? COLORS.primary : COLORS.textTertiary} 
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={[
                  styles.settingTitle,
                  !biometricAvailable && styles.settingTitleDisabled
                ]}>
                  {biometricType}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {biometricAvailable 
                    ? `Use ${biometricType} to unlock the app`
                    : 'Not available on this device'
                  }
                </Text>
              </View>
              {isToggling ? (
                <Spinner size="sm" color="primary" />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                  thumbColor={biometricEnabled ? COLORS.primary : COLORS.textTertiary}
                  disabled={!biometricAvailable}
                />
              )}
            </View>

            {/* Auto Lock */}
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="lock-closed-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Auto Lock</Text>
                <Text style={styles.settingSubtitle}>
                  Lock app when switching to other apps
                </Text>
              </View>
              <Switch
                value={autoLock}
                onValueChange={setAutoLock}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={autoLock ? COLORS.primary : COLORS.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* Test Biometric Button */}
        {biometricAvailable && biometricEnabled && (
          <View style={styles.testSection}>
            <Button
              onPress={handleTestBiometric}
              variant="ghost"
              className="w-full"
            >
              Test {biometricType}
            </Button>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              Your biometric data is stored securely on your device and never leaves it.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              Even if biometric is enabled, your data is always encrypted and protected.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  securityHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  securityIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  securityTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    fontWeight: '600',
  },
  securitySubtitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 280,
  },
  section: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingTitleDisabled: {
    color: COLORS.textTertiary,
  },
  settingSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  testSection: {
    padding: SPACING.xl,
  },
  infoSection: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
  },
  infoText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default SecuritySettingsScreen;
