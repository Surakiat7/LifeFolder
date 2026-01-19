import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useItemsStore, useCategoriesStore, useTagsStore, useRemindersStore, useUIStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { SettingsStackParamList } from '../../navigation/AppNavigator';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';

type ProfileNavigationProp = NativeStackNavigationProp<SettingsStackParamList, typeof SCREENS.PROFILE>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  
  const { user, signOut, isLoading: authLoading } = useAuthStore();
  const { items } = useItemsStore();
  const { categories } = useCategoriesStore();
  const { tags } = useTagsStore();
  const { reminders } = useRemindersStore();
  const { showConfirmModal } = useUIStore();
  const { showSuccess, showInfo } = useAppToast();

  const handleSettings = () => {
    navigation.navigate(SCREENS.SETTINGS);
  };

  const handleSecurity = () => {
    navigation.navigate(SCREENS.SECURITY_SETTINGS);
  };

  const handleLogout = () => {
    showConfirmModal({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        await signOut();
        showSuccess('Signed out successfully');
      },
    });
  };

  const menuItems = [
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and customization',
      onPress: handleSettings,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Security',
      subtitle: 'Biometric lock and app protection',
      onPress: handleSecurity,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'FAQ and contact support',
      onPress: () => showInfo('Coming soon'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'App version and legal info',
      onPress: () => showInfo('LifeFolder v1.0.0'),
    },
  ];

  const stats = [
    { label: 'Documents', value: items.length, icon: 'document-text' },
    { label: 'Categories', value: categories.length, icon: 'folder' },
    { label: 'Tags', value: tags.length, icon: 'pricetag' },
    { label: 'Reminders', value: reminders.filter(r => !r.is_sent).length, icon: 'notifications' },
  ];

  const getUserInitials = () => {
    if (!user?.full_name) return '?';
    const names = user.full_name.split(' ');
    return names.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image 
                source={{ uri: user.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {user?.full_name || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || ''}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={stat.icon as any} size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            onPress={handleLogout}
            variant="ghost"
            className="w-full"
            isDisabled={authLoading}
          >
            Sign Out
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            LifeFolder • Secure Document Storage
          </Text>
          <Text style={styles.versionText}>
            Version 1.0.0
          </Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    ...SHADOWS.medium,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarText: {
    ...TYPOGRAPHY.title1,
    color: COLORS.surface,
    fontWeight: '700',
  },
  userName: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    fontWeight: '600',
  },
  userEmail: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  statLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutContainer: {
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
  versionText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});

export default ProfileScreen;
