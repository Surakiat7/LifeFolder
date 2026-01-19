import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';

const { height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, clearError } = useAuthStore();
  const { showSuccess } = useAppToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        showSuccess('Welcome back!', 'Signed in successfully');
      } else if (result.error) {
        Alert.alert('Sign In Failed', result.error);
      }
    } catch (e) {
      Alert.alert('Sign In Failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.backButton}>
            {/* Back button would go here if needed */}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="folder-open" size={64} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to access your documents securely
          </Text>

          {/* Sign In Card */}
          <View style={styles.signInCard}>
            <Text style={styles.signInTitle}>Sign in with Google</Text>
            <Text style={styles.signInDescription}>
              Use your Google account for secure and easy access to LifeFolder
            </Text>

            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="sm" color="primary" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
            <Text style={styles.securityText}>
              Your data is encrypted and securely stored
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
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
    paddingHorizontal: SPACING.xl,
  },
  headerSection: {
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  mainSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.06,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  signInCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  signInTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  signInDescription: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  googleIconContainer: {
    marginRight: SPACING.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  googleButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
  },
  securityText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  footer: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  footerText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: COLORS.primary,
  },
});

export default LoginScreen;
