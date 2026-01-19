import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppToast } from '../../hooks/useAppToast';
import { SettingsStackParamList } from '../../navigation/AppNavigator';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList, typeof SCREENS.SETTINGS>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { showInfo } = useAppToast();

  // Settings state (in a real app, these would be persisted)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSecuritySettings = () => {
    navigation.navigate(SCREENS.SECURITY_SETTINGS);
  };

  const renderToggleSetting = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
        thumbColor={value ? COLORS.primary : COLORS.textTertiary}
      />
    </View>
  );

  const renderNavigationSetting = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void
  ) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            {renderToggleSetting(
              'Push Notifications',
              'Receive reminders and updates',
              notificationsEnabled,
              setNotificationsEnabled,
              'notifications-outline'
            )}
            {renderToggleSetting(
              'Sound',
              'Play sound for notifications',
              soundEnabled,
              setSoundEnabled,
              'volume-high-outline'
            )}
            {renderToggleSetting(
              'Vibration',
              'Vibrate for notifications',
              vibrationEnabled,
              setVibrationEnabled,
              'phone-portrait-outline'
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            {renderNavigationSetting(
              'Security Settings',
              'Biometric lock and PIN setup',
              'shield-checkmark-outline',
              handleSecuritySettings
            )}
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.sectionContent}>
            {renderToggleSetting(
              'Auto Backup',
              'Automatically backup to cloud',
              autoBackup,
              (value) => {
                setAutoBackup(value);
                showInfo(value ? 'Auto backup enabled' : 'Auto backup disabled');
              },
              'cloud-upload-outline'
            )}
            {renderNavigationSetting(
              'Export Data',
              'Download all your documents',
              'download-outline',
              () => showInfo('Coming soon')
            )}
            {renderNavigationSetting(
              'Clear Cache',
              'Free up storage space',
              'trash-outline',
              () => showInfo('Cache cleared')
            )}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContent}>
            {renderToggleSetting(
              'Dark Mode',
              'Use dark theme',
              darkMode,
              (value) => {
                setDarkMode(value);
                showInfo('Theme will be applied on restart');
              },
              'moon-outline'
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            {renderNavigationSetting(
              'Privacy Policy',
              'Read our privacy policy',
              'document-text-outline',
              () => showInfo('Opening privacy policy...')
            )}
            {renderNavigationSetting(
              'Terms of Service',
              'Read our terms of service',
              'reader-outline',
              () => showInfo('Opening terms of service...')
            )}
            {renderNavigationSetting(
              'Open Source Licenses',
              'Third-party libraries we use',
              'code-outline',
              () => showInfo('Opening licenses...')
            )}
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>LifeFolder</Text>
          <Text style={styles.versionNumber}>Version 1.0.0 (Build 1)</Text>
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
  section: {
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
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
  settingSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  versionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  versionNumber: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});

export default SettingsScreen;
